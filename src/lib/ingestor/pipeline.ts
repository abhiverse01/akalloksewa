/**
 * Pipeline — Full pipeline orchestrator
 * Orchestrates all 6 stages of the ingestor pipeline:
 * RAW INPUT → PARSE → EXTRACT → NORMALIZE → CLASSIFY → DEDUPLICATE → REVIEW
 */

import type {
  IngestBatch,
  ParsedQuestion,
  RawQuestion,
  BatchMetadata,
  DuplicateReport,
} from '@/types/ingestor'
import type { Question } from '@/types/question'
import { detectFormat, parseText, markCorrectOption } from './parser'
import { extractQuestions, extractSingleQuestion } from './extractor'
import { normalizeQuestion } from './normalizer'
import {
  classifySubject,
  classifyChapter,
  classifyDifficulty,
  extractYear,
} from './classifier'
import { findDuplicates } from './deduplicator'

// ─── Pipeline Stage Types ───────────────────────────────────────────

export type PipelineStage =
  | 'parse'
  | 'extract'
  | 'normalize'
  | 'classify'
  | 'deduplicate'
  | 'complete'

export interface PipelineResult {
  batch: IngestBatch
  duplicates: DuplicateReport[]
  stageResults: {
    parse: { input: string; rawCount: number }
    extract: { parsedCount: number; avgConfidence: number }
    normalize: { normalized: number }
    classify: { autoClassified: number }
    deduplicate: { duplicateCount: number }
  }
}

// ─── Batch Creation ─────────────────────────────────────────────────

export function createBatch(
  name: string,
  sourceType: IngestBatch['sourceType'],
  rawContent: string
): IngestBatch {
  return {
    id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name,
    sourceType,
    rawContent,
    status: 'parsing',
    parsedQuestions: [],
    metadata: {
      totalRaw: 0,
      parsed: 0,
      readyToCommit: 0,
      duplicatesFound: 0,
    },
    createdAt: Date.now(),
  }
}

// ─── Stage 1: Parse ───────────────────────────────────────────────

function runParseStage(
  rawContent: string
): { rawQuestions: RawQuestion[]; format: string } {
  const format = detectFormat(rawContent)
  let rawQuestions = parseText(rawContent, format)

  // Mark correct options
  rawQuestions = rawQuestions.map((rq) => markCorrectOption(rq))

  return { rawQuestions, format }
}

// ─── Stage 2: Extract ───────────────────────────────────────────────

function runExtractStage(
  rawQuestions: RawQuestion[]
): ParsedQuestion[] {
  return extractQuestions(rawQuestions)
}

// ─── Stage 3: Normalize ────────────────────────────────────────────

function runNormalizeStage(parsedQuestions: ParsedQuestion[]): ParsedQuestion[] {
  return parsedQuestions.map((pq) => {
    if (!pq.parsedQuestion) return pq
    return {
      ...pq,
      parsedQuestion: normalizeQuestion(pq.parsedQuestion),
    }
  })
}

// ─── Stage 4: Classify ─────────────────────────────────────────────

function runClassifyStage(parsedQuestions: ParsedQuestion[]): ParsedQuestion[] {
  return parsedQuestions.map((pq) => {
    if (!pq.parsedQuestion) return pq

    const text = pq.parsedQuestion.text || pq.rawText

    // Classify subject
    const { subject, confidence } = classifySubject(text)

    // Classify chapter
    const chapter = classifyChapter(text, subject)

    // Classify difficulty
    const difficulty = classifyDifficulty(text, pq.parsedQuestion.options?.length)

    // Extract year
    const year = extractYear(text)

    // Update the parsed question with classifications
    const updatedQuestion: Partial<Question> = {
      ...pq.parsedQuestion,
      subject: confidence > 0.2 ? subject : pq.parsedQuestion.subject,
      chapter: chapter || pq.parsedQuestion.chapter,
      difficulty: difficulty,
      year: year || pq.parsedQuestion.year,
    }

    return {
      ...pq,
      parsedQuestion: updatedQuestion,
      autoClassified: true,
    }
  })
}

// ─── Stage 5: Deduplicate ───────────────────────────────────────────

function runDeduplicateStage(
  parsedQuestions: ParsedQuestion[],
  _existingDB: Question[]
): { questions: ParsedQuestion[]; duplicates: DuplicateReport[] } {
  const duplicates = findDuplicates(parsedQuestions, [])

  // Mark duplicate questions
  const duplicateIds = new Set<string>()
  for (const dup of duplicates) {
    duplicateIds.add(dup.question1.tempId)
  }

  const updatedQuestions = parsedQuestions.map((pq) => {
    const isDuplicate = duplicateIds.has(pq.tempId)
    return {
      ...pq,
      issues: [
        ...pq.issues,
        ...(isDuplicate
          ? [
              {
                type: 'duplicate' as const,
                message: `Possible duplicate detected (similarity: ${duplicates.find((d) => d.question1.tempId === pq.tempId)?.similarity.toFixed(2)})`,
                severity: 'warning' as const,
              },
            ]
          : []),
      ],
    }
  })

  return { questions: updatedQuestions, duplicates }
}

// ─── Main Pipeline ───────────────────────────────────────────────────

/**
 * Run the complete ingestor pipeline on a batch
 * This orchestrates all 6 stages sequentially
 */
export function runPipeline(
  batch: IngestBatch,
  existingDB: Question[] = []
): PipelineResult {
  const stageResults = {
    parse: { input: batch.rawContent, rawCount: 0 },
    extract: { parsedCount: 0, avgConfidence: 0 },
    normalize: { normalized: 0 },
    classify: { autoClassified: 0 },
    deduplicate: { duplicateCount: 0 },
  }

  // Stage 1: Parse
  const { rawQuestions, format } = runParseStage(batch.rawContent)
  stageResults.parse = { input: batch.rawContent.substring(0, 100) + '...', rawCount: rawQuestions.length }

  // Update batch status
  let currentBatch: IngestBatch = {
    ...batch,
    status: 'parsing',
    metadata: { ...batch.metadata, totalRaw: rawQuestions.length },
  }

  // Stage 2: Extract
  let parsedQuestions = runExtractStage(rawQuestions)
  const avgConfidence =
    parsedQuestions.length > 0
      ? parsedQuestions.reduce((sum, pq) => sum + pq.confidence, 0) / parsedQuestions.length
      : 0
  stageResults.extract = { parsedCount: parsedQuestions.length, avgConfidence }

  currentBatch = {
    ...currentBatch,
    status: 'classifying',
    parsedQuestions,
    metadata: {
      ...currentBatch.metadata,
      parsed: parsedQuestions.length,
    },
  }

  // Stage 3: Normalize
  parsedQuestions = runNormalizeStage(parsedQuestions)
  stageResults.normalize = { normalized: parsedQuestions.length }

  // Stage 4: Classify
  parsedQuestions = runClassifyStage(parsedQuestions)
  const autoClassified = parsedQuestions.filter((pq) => pq.autoClassified).length
  stageResults.classify = { autoClassified }

  currentBatch = {
    ...currentBatch,
    parsedQuestions,
    metadata: {
      ...currentBatch.metadata,
      readyToCommit: parsedQuestions.filter((pq) => !pq.needsReview).length,
    },
  }

  // Stage 5: Deduplicate
  const { questions: deduplicatedQuestions, duplicates } = runDeduplicateStage(
    parsedQuestions,
    existingDB
  )
  stageResults.deduplicate = { duplicateCount: duplicates.length }

  // Final batch state
  const finalBatch: IngestBatch = {
    ...currentBatch,
    status: 'review',
    parsedQuestions: deduplicatedQuestions,
    metadata: {
      ...currentBatch.metadata,
      duplicatesFound: duplicates.length,
      readyToCommit: deduplicatedQuestions.filter(
        (pq) => !pq.needsReview && pq.issues.every((i) => i.severity !== 'error')
      ).length,
    },
  }

  return {
    batch: finalBatch,
    duplicates,
    stageResults,
  }
}

// ─── Single Question Pipeline (for adding one question manually) ───

export function runSingleQuestionPipeline(
  questionText: string,
  options: { text: string; isCorrect: boolean }[],
  explanation?: string
): ParsedQuestion {
  const rawQuestion: RawQuestion = {
    rawText: questionText,
    questionText,
    options: options.map((o, i) => ({
      id: String.fromCharCode(65 + i),
      text: o.text,
      isCorrect: o.isCorrect,
    })),
    correctAnswer: options.find((o) => o.isCorrect)
      ? String.fromCharCode(65 + options.findIndex((o) => o.isCorrect))
      : undefined,
    explanation,
    format: detectFormat(questionText),
  }

  const parsed = extractSingleQuestion(rawQuestion, 0)

  // Normalize
  const normalized = normalizeQuestion(parsed.parsedQuestion || {})

  // Classify
  const text = normalized.text || questionText
  const { subject, confidence } = classifySubject(text)
  const chapter = classifyChapter(text, subject)
  const difficulty = classifyDifficulty(text, options.length)
  const year = extractYear(text)

  return {
    ...parsed,
    parsedQuestion: {
      ...normalized,
      subject: confidence > 0.2 ? subject : undefined,
      chapter: chapter || undefined,
      difficulty,
      year: year || undefined,
    },
    autoClassified: true,
  }
}

// ─── Batch Metadata Helpers ────────────────────────────────────────

export function generateBatchName(
  sourceType: IngestBatch['sourceType'],
  questionCount: number
): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const sourceLabel =
    sourceType === 'text-paste'
      ? 'Text Paste'
      : sourceType === 'file-upload'
        ? 'File Upload'
        : sourceType === 'manual'
          ? 'Manual Entry'
          : 'Import'
  return `${sourceLabel} — ${questionCount} Qs — ${timestamp}`
}
