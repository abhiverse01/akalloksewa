import { nanoid } from 'nanoid'
import type { Question, LoksewaSubject, Difficulty, QuestionStatus } from '@/types/question'
import { initDB } from './schema'

// ── Filter & Result Interfaces ────────────────────────────────────────────────

export interface QuestionFilters {
  subject?: LoksewaSubject | LoksewaSubject[]
  difficulty?: Difficulty
  status?: QuestionStatus
  year?: number
  tags?: string[]
  searchText?: string
  limit?: number
  offset?: number
}

export interface QuestionQueryResult {
  questions: Question[]
  total: number
  hasMore: boolean
}

export interface QuestionStats {
  total: number
  bySubject: Record<string, number>
  byDifficulty: Record<string, number>
  approved: number
  pending: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesSearch(question: Question, query: string): boolean {
  const lower = query.toLowerCase()
  // Search across question text, options, and tags
  if (question.text.toLowerCase().includes(lower)) return true
  if (question.explanation?.toLowerCase().includes(lower)) return true
  for (const opt of question.options) {
    if (opt.text.toLowerCase().includes(lower)) return true
  }
  for (const tag of question.tags) {
    if (tag.toLowerCase().includes(lower)) return true
  }
  return false
}

// ── Core CRUD ─────────────────────────────────────────────────────────────────

/**
 * Get a paginated, filtered list of questions.
 * Uses an IDB index for the primary filter (subject), then applies
 * remaining filters and full-text search in memory.
 */
export async function getQuestions(filters: QuestionFilters = {}): Promise<QuestionQueryResult> {
  try {
    const db = await initDB()
    let results: Question[]

    // Use index for primary subject filter when available
    const subjects = Array.isArray(filters.subject)
      ? filters.subject
      : filters.subject
        ? [filters.subject]
        : undefined

    if (subjects && subjects.length === 1) {
      results = await db.getAllFromIndex('questions', 'by-subject', subjects[0])
    } else if (subjects && subjects.length > 1) {
      // Multiple subjects — fetch each and deduplicate
      const sets: Question[][] = []
      for (const subj of subjects) {
        const batch = await db.getAllFromIndex('questions', 'by-subject', subj)
        sets.push(batch)
      }
      results = sets.flat()
      // Deduplicate by id (in case of overlap)
      const seen = new Set<string>()
      results = results.filter((q) => {
        if (seen.has(q.id)) return false
        seen.add(q.id)
        return true
      })
    } else {
      results = await db.getAll('questions')
    }

    // In-memory secondary filters
    if (filters.difficulty) {
      results = results.filter((q) => q.difficulty === filters.difficulty)
    }
    if (filters.status) {
      results = results.filter((q) => q.status === filters.status)
    }
    if (filters.year !== undefined) {
      results = results.filter((q) => q.year === filters.year)
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((q) =>
        filters.tags!.some((tag) => q.tags.includes(tag))
      )
    }

    // Full-text search across question text + options + tags
    if (filters.searchText && filters.searchText.trim()) {
      results = results.filter((q) => matchesSearch(q, filters.searchText!.trim()))
    }

    const total = results.length
    const offset = filters.offset ?? 0
    const limit = filters.limit ?? total
    const paginated = results.slice(offset, offset + limit)

    return {
      questions: paginated,
      total,
      hasMore: offset + limit < total,
    }
  } catch (err) {
    console.error('[questions.getQuestions] Error:', err)
    return { questions: [], total: 0, hasMore: false }
  }
}

/**
 * Get a single question by its ID.
 */
export async function getQuestion(id: string): Promise<Question | null> {
  try {
    const db = await initDB()
    const question = await db.get('questions', id)
    return question ?? null
  } catch (err) {
    console.error('[questions.getQuestion] Error:', err)
    return null
  }
}

/**
 * Get N random questions, optionally filtered.
 * Uses Fisher-Yates shuffle for unbiased randomization.
 */
export async function getRandomQuestions(
  count: number,
  filters: QuestionFilters = {}
): Promise<Question[]> {
  try {
    const { questions } = await getQuestions(filters)

    if (questions.length <= count) {
      return questions
    }

    // Fisher-Yates shuffle
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, count)
  } catch (err) {
    console.error('[questions.getRandomQuestions] Error:', err)
    return []
  }
}

/**
 * Create a new question with auto-generated ID and timestamps.
 */
export async function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'reportCount'>): Promise<Question | null> {
  try {
    const db = await initDB()
    const now = Date.now()
    const question: Question = {
      ...data,
      id: nanoid(12),
      reportCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    await db.put('questions', question)
    return question
  } catch (err) {
    console.error('[questions.createQuestion] Error:', err)
    return null
  }
}

/**
 * Partially update a question. Accepts a subset of Question fields
 * and automatically bumps updatedAt.
 */
export async function updateQuestion(
  id: string,
  patch: Partial<Omit<Question, 'id' | 'createdAt'>>
): Promise<Question | null> {
  try {
    const db = await initDB()
    const existing = await db.get('questions', id)
    if (!existing) {
      console.error(`[questions.updateQuestion] Question ${id} not found`)
      return null
    }

    const updated: Question = {
      ...existing,
      ...patch,
      id,              // preserve original id
      createdAt: existing.createdAt, // preserve original createdAt
      updatedAt: Date.now(),
    }
    await db.put('questions', updated)
    return updated
  } catch (err) {
    console.error('[questions.updateQuestion] Error:', err)
    return null
  }
}

/**
 * Delete a question by ID. Returns true if deleted, false if not found.
 */
export async function deleteQuestion(id: string): Promise<boolean> {
  try {
    const db = await initDB()
    const existing = await db.get('questions', id)
    if (!existing) return false
    await db.delete('questions', id)
    return true
  } catch (err) {
    console.error('[questions.deleteQuestion] Error:', err)
    return false
  }
}

/**
 * Bulk-create questions in a single transaction.
 * Returns counts of created vs errors.
 */
export async function bulkCreateQuestions(
  questions: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'reportCount'>[]
): Promise<{ created: number; errors: number }> {
  try {
    const db = await initDB()
    const tx = db.transaction('questions', 'readwrite')
    let created = 0
    let errors = 0
    const now = Date.now()

    for (const data of questions) {
      try {
        const question: Question = {
          ...data,
          id: nanoid(12),
          reportCount: 0,
          createdAt: now,
          updatedAt: now,
        }
        await tx.store.put(question)
        created++
      } catch (err) {
        console.error('[questions.bulkCreateQuestions] Error inserting one question:', err)
        errors++
      }
    }

    await tx.done
    return { created, errors }
  } catch (err) {
    console.error('[questions.bulkCreateQuestions] Transaction error:', err)
    return { created: 0, errors: questions.length }
  }
}

/**
 * Report a question. Increments reportCount and flags it when >= 2.
 */
export async function reportQuestion(id: string): Promise<Question | null> {
  try {
    const db = await initDB()
    const existing = await db.get('questions', id)
    if (!existing) {
      console.error(`[questions.reportQuestion] Question ${id} not found`)
      return null
    }

    const newReportCount = existing.reportCount + 1
    const updated: Question = {
      ...existing,
      reportCount: newReportCount,
      status: newReportCount >= 2 ? 'flagged' : existing.status,
      updatedAt: Date.now(),
    }
    await db.put('questions', updated)
    return updated
  } catch (err) {
    console.error('[questions.reportQuestion] Error:', err)
    return null
  }
}

/**
 * Get aggregate statistics about the question bank.
 */
export async function getQuestionStats(): Promise<QuestionStats> {
  try {
    const db = await initDB()
    const all = await db.getAll('questions')

    const bySubject: Record<string, number> = {}
    const byDifficulty: Record<string, number> = {}
    let approved = 0
    let pending = 0

    for (const q of all) {
      // By subject
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
      // By difficulty
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1
      // By status
      if (q.status === 'approved') approved++
      else if (q.status === 'pending') pending++
    }

    return {
      total: all.length,
      bySubject,
      byDifficulty,
      approved,
      pending,
    }
  } catch (err) {
    console.error('[questions.getQuestionStats] Error:', err)
    return {
      total: 0,
      bySubject: {},
      byDifficulty: {},
      approved: 0,
      pending: 0,
    }
  }
}

// ── Legacy Aliases (kept for backward compatibility) ──────────────────────────

export async function getAllQuestions(): Promise<Question[]> {
  try {
    const db = await initDB()
    return await db.getAll('questions')
  } catch (err) {
    console.error('[questions.getAllQuestions] Error:', err)
    return []
  }
}

export async function getQuestionsBySubject(subject: LoksewaSubject): Promise<Question[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex('questions', 'by-subject', subject)
  } catch (err) {
    console.error('[questions.getQuestionsBySubject] Error:', err)
    return []
  }
}

export async function getApprovedQuestions(): Promise<Question[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex('questions', 'by-status', 'approved')
  } catch (err) {
    console.error('[questions.getApprovedQuestions] Error:', err)
    return []
  }
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  try {
    const db = await initDB()
    return await db.get('questions', id)
  } catch (err) {
    console.error('[questions.getQuestionById] Error:', err)
    return undefined
  }
}

export async function addQuestion(question: Question): Promise<void> {
  try {
    const db = await initDB()
    await db.put('questions', question)
  } catch (err) {
    console.error('[questions.addQuestion] Error:', err)
  }
}

export async function addQuestions(questions: Question[]): Promise<void> {
  try {
    const db = await initDB()
    const tx = db.transaction('questions', 'readwrite')
    for (const q of questions) {
      await tx.store.put(q)
    }
    await tx.done
  } catch (err) {
    console.error('[questions.addQuestions] Error:', err)
  }
}

export async function getQuestionCount(): Promise<number> {
  try {
    const db = await initDB()
    return await db.count('questions')
  } catch (err) {
    console.error('[questions.getQuestionCount] Error:', err)
    return 0
  }
}

export async function getQuestionCountBySubject(subject: LoksewaSubject): Promise<number> {
  try {
    const db = await initDB()
    return await db.countFromIndex('questions', 'by-subject', subject)
  } catch (err) {
    console.error('[questions.getQuestionCountBySubject] Error:', err)
    return 0
  }
}

export async function searchQuestions(
  filters: {
    subject?: LoksewaSubject
    difficulty?: Difficulty
    year?: number
    tags?: string[]
    status?: QuestionStatus
    limit?: number
    offset?: number
  }
): Promise<Question[]> {
  try {
    const result = await getQuestions(filters)
    return result.questions
  } catch (err) {
    console.error('[questions.searchQuestions] Error:', err)
    return []
  }
}
