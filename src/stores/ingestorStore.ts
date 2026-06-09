/**
 * Ingestor Store — 3-step question ingestion pipeline
 *
 * Step 1: Paste/upload raw text content
 * Step 2: Run pipeline (parse → normalize → classify → deduplicate)
 * Step 3: Review & commit approved questions
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'

import type { IngestBatch, ParsedQuestion, IngestIssue, RawQuestion } from '@/types/ingestor'
import type { Question, Option } from '@/types/question'

import { parseText, detectFormat, type ParsedRawQuestion } from '@/lib/ingestor/parser'
import { classifySubject, classifyChapter, classifyDifficulty, extractYear } from '@/lib/ingestor/classifier'
import { findDuplicates } from '@/lib/ingestor/deduplicator'
import { normalizeQuestion } from '@/lib/ingestor/normalizer'
import { addQuestions, getAllQuestions } from '@/lib/db/questions'
import { initDB } from '@/lib/db/schema'

// ─── Types ─────────────────────────────────────────────────────────

type PipelineStep = 1 | 2 | 3

interface ProcessingStatus {
  phase: 'idle' | 'parsing' | 'normalizing' | 'classifying' | 'deduplicating' | 'done' | 'error'
  message: string
  progress: number // 0–100
}

interface CommitResult {
  success: boolean
  created: number
  skipped: number
  error?: string
}

interface IngestorState {
  // ── State ──
  step: PipelineStep
  batchName: string
  rawContent: string
  detectedFormat: string
  batch: IngestBatch | null
  selectedId: string | null
  isProcessing: boolean
  processingStatus: ProcessingStatus
  commitResult: CommitResult | null

  // ── Actions ──
  setRawContent: (content: string) => void
  setBatchName: (name: string) => void
  goBack: () => void
  goForward: () => void
  runPipeline: () => Promise<void>
  updateParsedQuestion: (tempId: string, updates: Partial<ParsedQuestion>) => void
  approveParsedQuestion: (tempId: string) => void
  rejectParsedQuestion: (tempId: string) => void
  approveAllReady: () => void
  selectQuestion: (tempId: string | null) => void
  commitBatch: () => Promise<void>
  reset: () => void
}

// ─── Initial State ────────────────────────────────────────────────

const initialState = {
  step: 1 as PipelineStep,
  batchName: '',
  rawContent: '',
  detectedFormat: '',
  batch: null as IngestBatch | null,
  selectedId: null as string | null,
  isProcessing: false,
  processingStatus: {
    phase: 'idle' as const,
    message: '',
    progress: 0,
  },
  commitResult: null as CommitResult | null,
}

// ─── Helper: Convert ParsedRawQuestion → ParsedQuestion ───────────

function rawToParsed(
  raw: ParsedRawQuestion,
  format: string,
  batchId: string
): ParsedQuestion {
  const fullText = raw.rawBlock
  const { subject, confidence: subjectConf } = classifySubject(fullText)
  const chapter = classifyChapter(fullText, subject)
  const difficulty = classifyDifficulty(fullText, raw.options.length)
  const year = extractYear(fullText)

  const issues: IngestIssue[] = []

  if (!raw.answerLabel) {
    issues.push({
      type: 'missing-answer',
      message: 'No answer marker found in this question block.',
      severity: 'warning',
    })
  }

  if (raw.options.length < 2) {
    issues.push({
      type: 'ambiguous-options',
      message: `Only ${raw.options.length} option(s) detected. Expected 2–5.`,
      severity: 'error',
    })
  }

  if (raw.questionText.length < 5) {
    issues.push({
      type: 'low-confidence',
      message: 'Question text is very short — may be incomplete or malformed.',
      severity: 'warning',
    })
  }

  const needsReview = issues.some((i) => i.severity === 'error') || !raw.answerLabel

  // Build the partial Question object
  const correctOptions: Option[] = raw.options.map((opt) => ({
    ...opt,
    isCorrect: opt.id.toUpperCase() === (raw.answerLabel?.toUpperCase() || ''),
  }))

  const partialQ: Partial<Question> = {
    text: raw.questionText,
    options: correctOptions,
    explanation: raw.explanationText,
    type: 'mcq',
    difficulty,
    subject,
    chapter,
    year,
    tags: [],
    status: 'pending',
    reportCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ingestBatchId: batchId,
  }

  return {
    tempId: raw.tempId,
    rawText: raw.rawBlock,
    parsedQuestion: normalizeQuestion(partialQ) as Partial<Question>,
    confidence: subjectConf,
    issues,
    needsReview,
    autoClassified: true,
  }
}

// ─── Store ──────────────────────────────────────────────────────────

export const useIngestorStore = create<IngestorState>()(
  immer((set, get) => ({
    ...initialState,

    // ── Step 1 Actions ──

    setRawContent: (content: string) => {
      set((s) => {
        s.rawContent = content
        s.detectedFormat = content.trim() ? detectFormat(content) : ''
        s.processingStatus = { phase: 'idle', message: '', progress: 0 }
        s.commitResult = null
        if (content.trim()) {
          s.step = 1
        }
      })
    },

    setBatchName: (name: string) => {
      set((s) => {
        s.batchName = name
      })
    },

    goBack: () => {
      set((s) => {
        s.step = Math.max(1, (s.step - 1) as PipelineStep)
        s.commitResult = null
      })
    },

    goForward: () => {
      set((s) => {
        s.step = Math.min(3, (s.step + 1) as PipelineStep)
      })
    },

    // ── Step 2: Run Pipeline ──

    runPipeline: async () => {
      const { rawContent } = get()
      if (!rawContent.trim()) return

      set((s) => {
        s.isProcessing = true
        s.step = 2
        s.processingStatus = { phase: 'parsing', message: 'Parsing raw text...', progress: 10 }
      })

      try {
        // Phase 1: Parse
        const format = detectFormat(rawContent)
        const rawQuestions: ParsedRawQuestion[] = parseText(rawContent)

        set((s) => {
          s.detectedFormat = format
          s.processingStatus = { phase: 'parsing', message: `Parsed ${rawQuestions.length} raw questions`, progress: 30 }
        })

        // Phase 2: Normalize & Classify
        const batchId = nanoid(10)
        const parsedQuestions: ParsedQuestion[] = rawQuestions.map((raw) =>
          rawToParsed(raw, format, batchId)
        )

        set((s) => {
          s.processingStatus = { phase: 'classifying', message: 'Classifying subjects & detecting duplicates...', progress: 50 }
        })

        // Phase 3: Deduplicate against existing DB
        let existingQuestions: Question[] = []
        try {
          await initDB()
          existingQuestions = await getAllQuestions()
        } catch {
          // DB may not be initialized yet — proceed without dedup check
        }

        const duplicates = findDuplicates(parsedQuestions, existingQuestions)

        // Mark duplicates in parsed questions
        const duplicateIds = new Set<string>()
        for (const report of duplicates) {
          duplicateIds.add(report.question1.tempId)
        }

        for (const pq of parsedQuestions) {
          if (duplicateIds.has(pq.tempId)) {
            pq.issues.push({
              type: 'duplicate',
              message: 'Possible duplicate of an existing question in the database.',
              severity: 'warning',
            })
            pq.needsReview = true
          }
        }

        set((s) => {
          s.processingStatus = { phase: 'deduplicating', message: 'Building batch...', progress: 80 }
        })

        // Build the IngestBatch
        const readyCount = parsedQuestions.filter((pq) => !pq.needsReview).length
        const now = Date.now()

        const batch: IngestBatch = {
          id: batchId,
          name: get().batchName || `Batch ${new Date().toLocaleDateString()}`,
          sourceType: 'text-paste',
          rawContent,
          status: 'review',
          parsedQuestions,
          metadata: {
            totalRaw: rawQuestions.length,
            parsed: parsedQuestions.length,
            readyToCommit: readyCount,
            duplicatesFound: duplicates.length,
          },
          createdAt: now,
        }

        set((s) => {
          s.batch = batch
          s.selectedId = parsedQuestions.length > 0 ? parsedQuestions[0].tempId : null
          s.isProcessing = false
          s.processingStatus = { phase: 'done', message: `Pipeline complete — ${parsedQuestions.length} questions ready`, progress: 100 }
        })
      } catch (err) {
        set((s) => {
          s.isProcessing = false
          s.processingStatus = {
            phase: 'error',
            message: err instanceof Error ? err.message : 'Unknown error during pipeline',
            progress: 0,
          }
        })
      }
    },

    // ── Step 3: Review Actions ──

    updateParsedQuestion: (tempId: string, updates: Partial<ParsedQuestion>) => {
      set((s) => {
        if (!s.batch) return
        const idx = s.batch.parsedQuestions.findIndex((pq) => pq.tempId === tempId)
        if (idx < 0) return
        Object.assign(s.batch.parsedQuestions[idx], updates)
      })
    },

    approveParsedQuestion: (tempId: string) => {
      set((s) => {
        if (!s.batch) return
        const pq = s.batch.parsedQuestions.find((q) => q.tempId === tempId)
        if (pq) {
          pq.needsReview = false
          pq.issues = pq.issues.filter((i) => i.type !== 'duplicate')
        }
        s.batch.metadata.readyToCommit = s.batch.parsedQuestions.filter(
          (q) => !q.needsReview
        ).length
      })
    },

    rejectParsedQuestion: (tempId: string) => {
      set((s) => {
        if (!s.batch) return
        s.batch.parsedQuestions = s.batch.parsedQuestions.filter(
          (q) => q.tempId !== tempId
        )
        s.batch.metadata.parsed = s.batch.parsedQuestions.length
        s.batch.metadata.readyToCommit = s.batch.parsedQuestions.filter(
          (q) => !q.needsReview
        ).length
        if (s.selectedId === tempId) {
          s.selectedId = s.batch.parsedQuestions.length > 0
            ? s.batch.parsedQuestions[0].tempId
            : null
        }
      })
    },

    approveAllReady: () => {
      set((s) => {
        if (!s.batch) return
        for (const pq of s.batch.parsedQuestions) {
          if (!pq.issues.some((i) => i.severity === 'error')) {
            pq.needsReview = false
          }
        }
        s.batch.metadata.readyToCommit = s.batch.parsedQuestions.filter(
          (q) => !q.needsReview
        ).length
      })
    },

    selectQuestion: (tempId: string | null) => {
      set((s) => {
        s.selectedId = tempId
      })
    },

    // ── Commit ──

    commitBatch: async () => {
      const { batch } = get()
      if (!batch) return

      set((s) => {
        s.isProcessing = true
        s.commitResult = null
      })

      try {
        await initDB()

        const approved = batch.parsedQuestions.filter((pq) => !pq.needsReview)
        const questions: Question[] = []

        for (const pq of approved) {
          const pqData = pq.parsedQuestion
          if (!pqData || !pqData.text) continue

          const question: Question = {
            id: nanoid(12),
            text: pqData.text,
            options: pqData.options || [],
            explanation: pqData.explanation,
            type: pqData.type || 'mcq',
            difficulty: pqData.difficulty || 'medium',
            subject: pqData.subject || 'general-knowledge',
            chapter: pqData.chapter,
            topic: pqData.topic,
            year: pqData.year,
            source: 'ingest',
            tags: pqData.tags || [],
            status: 'approved',
            reportCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ingestBatchId: batch.id,
          }
          questions.push(question)
        }

        await addQuestions(questions)

        // Update batch status
        set((s) => {
          if (s.batch) {
            s.batch.status = 'committed'
          }
          s.isProcessing = false
          s.commitResult = {
            success: true,
            created: questions.length,
            skipped: batch.parsedQuestions.length - questions.length,
          }
        })
      } catch (err) {
        set((s) => {
          s.isProcessing = false
          s.commitResult = {
            success: false,
            created: 0,
            skipped: batch.parsedQuestions.length,
            error: err instanceof Error ? err.message : 'Failed to commit batch',
          }
        })
      }
    },

    // ── Reset ──

    reset: () => {
      set((s) => {
        s.step = 1
        s.batchName = ''
        s.rawContent = ''
        s.detectedFormat = ''
        s.batch = null
        s.selectedId = null
        s.isProcessing = false
        s.processingStatus = { phase: 'idle', message: '', progress: 0 }
        s.commitResult = null
      })
    },
  }))
)
