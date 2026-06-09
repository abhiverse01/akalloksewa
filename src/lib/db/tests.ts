import { nanoid } from 'nanoid'
import type { TestSession, TestConfig, TestScore, SubjectScore } from '@/types/test'
import type { LoksewaSubject, Question } from '@/types/question'
import { initDB } from './schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fisher-Yates in-place shuffle */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Shuffle options within each question (shuffles the option IDs + text but preserves isCorrect mapping) */
function shuffleQuestionOptions(question: Question): Question {
  if (question.type !== 'mcq') return question
  const shuffled = shuffleArray(question.options)
  return { ...question, options: shuffled }
}

// ── Score Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate the score for a test session.
 *
 * Scoring rules:
 *  - Correct answer: +1 mark
 *  - Wrong answer: negative mark if negative marking enabled (default 0.25)
 *  - Skipped question: 0 marks (no penalty)
 *  - Subject breakdown calculated per-subject
 */
export function calculateScore(session: TestSession): TestScore {
  const { questions, answers, skipped = [], config } = session

  const negativeValue = config.negativeMarking ? config.negativeMarkValue : 0

  let correct = 0
  let wrong = 0
  let skippedCount = 0
  let marks = 0
  const maxMarks = questions.length // 1 mark per question

  // Per-subject accumulation
  const subjectMap = new Map<LoksewaSubject, { correct: number; wrong: number; total: number; marks: number }>()

  for (const q of questions) {
    const subjectKey = q.subject

    if (!subjectMap.has(subjectKey)) {
      subjectMap.set(subjectKey, { correct: 0, wrong: 0, total: 0, marks: 0 })
    }
    const sub = subjectMap.get(subjectKey)!
    sub.total++

    if (skipped.includes(q.id)) {
      skippedCount++
      // 0 marks for skipped — no negative marking
      continue
    }

    const selectedOptionId = answers[q.id]
    if (!selectedOptionId) {
      // No answer recorded but not explicitly skipped — treat as skipped
      skippedCount++
      continue
    }

    const selectedOption = q.options.find((o) => o.id === selectedOptionId)
    const isCorrect = selectedOption?.isCorrect ?? false

    if (isCorrect) {
      correct++
      marks += 1
      sub.correct++
      sub.marks += 1
    } else {
      wrong++
      marks -= negativeValue
      sub.wrong++
      sub.marks -= negativeValue
    }
  }

  const percentage = maxMarks > 0 ? Math.max(0, (marks / maxMarks) * 100) : 0

  const subjectBreakdown: SubjectScore[] = Array.from(subjectMap.entries()).map(
    ([subject, data]) => ({
      subject,
      correct: data.correct,
      wrong: data.wrong,
      total: data.total,
      marks: data.marks,
    })
  )

  const timeTaken = session.endedAt
    ? (session.endedAt - session.startedAt) / 1000 // seconds
    : 0

  return {
    total: questions.length,
    correct,
    wrong,
    skipped: skippedCount,
    marks,
    maxMarks,
    percentage,
    timeTaken,
    subjectBreakdown,
  }
}

// ── Session Management ────────────────────────────────────────────────────────

/**
 * Create a new test session.
 * Gets random questions from the bank matching config criteria,
 * optionally shuffles them and their options, and stores the session.
 */
export async function createTestSession(
  config: TestConfig,
  userId?: string
): Promise<TestSession | null> {
  try {
    const db = await initDB()

    // Check if there's already an active session
    const activeSessions = await db.getAllFromIndex('testSessions', 'by-status', 'active')
    if (activeSessions.length > 0) {
      // Return the existing active session instead of creating a new one
      return activeSessions[0]
    }

    // Fetch questions based on config
    let pool: Question[] = []

    if (config.subjects.length > 0) {
      for (const subject of config.subjects) {
        const batch = await db.getAllFromIndex('questions', 'by-subject', subject)
        // Only include approved questions
        pool.push(...batch.filter((q) => q.status === 'approved'))
      }
    } else {
      pool = await db.getAll('questions')
      pool = pool.filter((q) => q.status === 'approved')
    }

    // Filter by difficulty if specified
    if (config.difficulty && config.difficulty.length > 0) {
      pool = pool.filter((q) => config.difficulty!.includes(q.difficulty))
    }

    // Shuffle the pool and take the requested number
    const shuffledPool = shuffleArray(pool)
    const questions = shuffledPool.slice(0, config.questionCount)

    if (questions.length === 0) {
      console.error('[tests.createTestSession] No questions available for the given config')
      return null
    }

    // Shuffle options within questions if configured
    const finalQuestions = config.shuffleOptions
      ? questions.map(shuffleQuestionOptions)
      : questions

    const now = Date.now()
    const session: TestSession = {
      id: nanoid(12),
      config,
      questions: config.shuffleQuestions ? shuffleArray(finalQuestions) : finalQuestions,
      answers: {},
      markedForReview: [],
      skipped: [],
      startedAt: now,
      status: 'active',
    }

    await db.put('testSessions', session)
    return session
  } catch (err) {
    console.error('[tests.createTestSession] Error:', err)
    return null
  }
}

/**
 * Save test progress (answers, marked for review, skipped, time remaining).
 * Accepts a partial patch and merges with existing session data.
 */
export async function saveTestProgress(
  sessionId: string,
  patch: Partial<Pick<TestSession, 'answers' | 'markedForReview' | 'skipped' | 'status'>>
): Promise<TestSession | null> {
  try {
    const db = await initDB()
    const existing = await db.get('testSessions', sessionId)
    if (!existing) {
      console.error(`[tests.saveTestProgress] Session ${sessionId} not found`)
      return null
    }

    const updated: TestSession = {
      ...existing,
      ...patch,
      id: sessionId,           // preserve id
      config: existing.config, // preserve config
      questions: existing.questions, // preserve questions
      startedAt: existing.startedAt, // preserve startedAt
    }

    await db.put('testSessions', updated)
    return updated
  } catch (err) {
    console.error('[tests.saveTestProgress] Error:', err)
    return null
  }
}

/**
 * Find and return the currently active session for a user.
 * Since sessions aren't user-specific in the current schema,
 * this returns the first active session found.
 */
export async function recoverActiveSession(_userId?: string): Promise<TestSession | null> {
  try {
    const db = await initDB()
    const sessions = await db.getAllFromIndex('testSessions', 'by-status', 'active')
    return sessions[0] ?? null
  } catch (err) {
    console.error('[tests.recoverActiveSession] Error:', err)
    return null
  }
}

/**
 * Submit a test — calculates the score, marks session as completed,
 * and returns the TestScore.
 */
export async function submitTest(sessionId: string): Promise<TestScore | null> {
  try {
    const db = await initDB()
    const session = await db.get('testSessions', sessionId)
    if (!session) {
      console.error(`[tests.submitTest] Session ${sessionId} not found`)
      return null
    }

    if (session.status === 'completed') {
      // Already submitted, return existing score
      return session.score ?? calculateScore(session)
    }

    const now = Date.now()
    const score = calculateScore({ ...session, endedAt: now })

    const completedSession: TestSession = {
      ...session,
      endedAt: now,
      status: 'completed',
      score,
    }

    await db.put('testSessions', completedSession)
    return score
  } catch (err) {
    console.error('[tests.submitTest] Error:', err)
    return null
  }
}

/**
 * Get completed test history for a user, sorted by most recent first.
 */
export async function getUserTests(
  userId?: string,
  limit: number = 20
): Promise<TestSession[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('testSessions')
    const completed = all
      .filter((s) => s.status === 'completed')
      .sort((a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt))
      .slice(0, limit)
    return completed
  } catch (err) {
    console.error('[tests.getUserTests] Error:', err)
    return []
  }
}

/**
 * Alias for recoverActiveSession — get the currently active test.
 */
export async function getActiveTest(userId?: string): Promise<TestSession | null> {
  return recoverActiveSession(userId)
}

/**
 * Abandon a test session — marks it as 'abandoned'.
 */
export async function abandonTest(sessionId: string): Promise<boolean> {
  try {
    const db = await initDB()
    const session = await db.get('testSessions', sessionId)
    if (!session) {
      console.error(`[tests.abandonTest] Session ${sessionId} not found`)
      return false
    }

    await db.put('testSessions', {
      ...session,
      endedAt: Date.now(),
      status: 'abandoned',
    })
    return true
  } catch (err) {
    console.error('[tests.abandonTest] Error:', err)
    return false
  }
}

// ── Legacy Aliases (kept for backward compatibility) ──────────────────────────

export async function getAllTestSessions(): Promise<TestSession[]> {
  try {
    const db = await initDB()
    return await db.getAll('testSessions')
  } catch (err) {
    console.error('[tests.getAllTestSessions] Error:', err)
    return []
  }
}

export async function getTestSessionById(id: string): Promise<TestSession | undefined> {
  try {
    const db = await initDB()
    return await db.get('testSessions', id)
  } catch (err) {
    console.error('[tests.getTestSessionById] Error:', err)
    return undefined
  }
}

export async function getActiveTestSession(): Promise<TestSession | undefined> {
  try {
    const db = await initDB()
    const sessions = await db.getAllFromIndex('testSessions', 'by-status', 'active')
    return sessions[0]
  } catch (err) {
    console.error('[tests.getActiveTestSession] Error:', err)
    return undefined
  }
}

export async function saveTestSession(session: TestSession): Promise<void> {
  try {
    const db = await initDB()
    await db.put('testSessions', session)
  } catch (err) {
    console.error('[tests.saveTestSession] Error:', err)
  }
}

export async function deleteTestSession(id: string): Promise<void> {
  try {
    const db = await initDB()
    await db.delete('testSessions', id)
  } catch (err) {
    console.error('[tests.deleteTestSession] Error:', err)
  }
}

export async function getTestSessionCount(): Promise<number> {
  try {
    const db = await initDB()
    return await db.count('testSessions')
  } catch (err) {
    console.error('[tests.getTestSessionCount] Error:', err)
    return 0
  }
}

export async function getRecentTestSessions(limit: number = 5): Promise<TestSession[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('testSessions')
    const completed = all.filter((s) => s.status === 'completed')
    return completed.sort((a, b) => b.startedAt - a.startedAt).slice(0, limit)
  } catch (err) {
    console.error('[tests.getRecentTestSessions] Error:', err)
    return []
  }
}
