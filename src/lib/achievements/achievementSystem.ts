// ── Achievement definitions and checking logic ──

import { getDBAsync } from '@/lib/db/schema'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // emoji
  condition: string // human-readable condition
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-question',    name: 'First Step',       description: 'Answered your first question',     icon: '🎯', condition: 'totalQuestionsAttempted === 1' },
  { id: 'ten-questions',     name: 'Getting Started',   description: 'Answered 10 questions',            icon: '📝', condition: 'totalQuestionsAttempted === 10' },
  { id: 'fifty-questions',   name: 'Half Century',      description: 'Answered 50 questions',            icon: '⭐', condition: 'totalQuestionsAttempted === 50' },
  { id: 'hundred-questions', name: 'Century',           description: 'Answered 100 questions',           icon: '💯', condition: 'totalQuestionsAttempted === 100' },
  { id: 'first-test',        name: 'Test Taker',        description: 'Completed your first test',       icon: '📋', condition: 'totalTests === 1' },
  { id: 'five-tests',        name: 'Test Veteran',      description: 'Completed 5 tests',               icon: '🏅', condition: 'totalTests === 5' },
  { id: 'streak-3',          name: 'Three in a Row',    description: '3-day practice streak',            icon: '🔥', condition: 'currentStreak === 3' },
  { id: 'streak-7',          name: 'Weekly Warrior',    description: '7-day practice streak',            icon: '⚔️', condition: 'currentStreak === 7' },
  { id: 'streak-30',         name: 'Monthly Master',    description: '30-day practice streak',           icon: '👑', condition: 'currentStreak === 30' },
  { id: 'accuracy-80',       name: 'Sharp Mind',        description: 'Reached 80% overall accuracy',     icon: '🧠', condition: 'overallAccuracy >= 0.8' },
  { id: 'accuracy-90',       name: 'Near Perfect',      description: 'Reached 90% overall accuracy',     icon: '💎', condition: 'overallAccuracy >= 0.9' },
  { id: 'subject-master',    name: 'Subject Master',    description: '90%+ accuracy in any subject',    icon: '📚', condition: 'anySubjectAccuracy >= 0.9' },
]

/** Internal stats shape passed to the evaluator */
export interface AchievementStats {
  totalQuestionsAttempted: number
  totalCorrect: number
  totalTests: number
  currentStreak: number
  subjectAccuracy: Record<string, number>
}

/**
 * Evaluate a single achievement's condition against current stats.
 * Returns `true` when the condition is met.
 */
function evaluateCondition(
  condition: string,
  stats: AchievementStats,
): boolean {
  const {
    totalQuestionsAttempted,
    totalCorrect,
    totalTests,
    currentStreak,
    subjectAccuracy,
  } = stats

  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? totalCorrect / totalQuestionsAttempted
      : 0

  const anySubjectAccuracy = Object.values(subjectAccuracy).length > 0
    ? Math.max(...Object.values(subjectAccuracy))
    : 0

  // Build a simple evaluation context
  const ctx: Record<string, number> = {
    totalQuestionsAttempted,
    totalCorrect,
    totalTests,
    currentStreak,
    overallAccuracy,
    anySubjectAccuracy,
  }

  try {
    // Match patterns like "totalQuestionsAttempted === 1" or "overallAccuracy >= 0.8"
    const expr = condition.trim()
    const match = expr.match(
      /^(\w+)\s*(===|==|>=|<=|>|<|!==|!=)\s*([\d.]+)$/,
    )
    if (!match) return false

    const [, lhs, op, rhsStr] = match
    const lhsVal = ctx[lhs]
    if (lhsVal === undefined) return false

    const rhsVal = parseFloat(rhsStr)

    switch (op) {
      case '===':
      case '==':
        return lhsVal === rhsVal
      case '>=':
        return lhsVal >= rhsVal
      case '<=':
        return lhsVal <= rhsVal
      case '>':
        return lhsVal > rhsVal
      case '<':
        return lhsVal < rhsVal
      case '!==':
      case '!=':
        return lhsVal !== rhsVal
      default:
        return false
    }
  } catch {
    return false
  }
}

/**
 * Check all achievements against the provided stats and return
 * an array of *newly* triggered achievements (not previously saved).
 * Persisted to IndexedDB for future deduplication.
 */
export async function checkAchievements(
  stats: AchievementStats,
  userId: string,
): Promise<Achievement[]> {
  const db = await getDBAsync()
  if (!db) return []

  // 1. Fetch already-triggered achievement IDs for this user
  const existingKeys: string[] = []
  try {
    const tx = db.transaction('achievements', 'readonly')
    const index = tx.store.index('by-userId')
    let cursor = await index.openCursor(IDBKeyRange.only(userId))
    while (cursor) {
      existingKeys.push(cursor.value.type) // `type` stores the achievement id
      cursor = await cursor.continue()
    }
    await tx.done
  } catch (err) {
    console.error('[checkAchievements] Failed to read achievements:', err)
  }

  // 2. Evaluate each achievement definition
  const newlyTriggered: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already triggered
    if (existingKeys.includes(achievement.id)) continue

    if (evaluateCondition(achievement.condition, stats)) {
      newlyTriggered.push(achievement)

      // Persist to IndexedDB
      try {
        await db.put('achievements', {
          id: `${userId}_${achievement.id}`,
          userId,
          triggeredAt: Date.now(),
          type: achievement.id,
        })
      } catch (err) {
        console.error(
          `[checkAchievements] Failed to persist achievement "${achievement.id}":`,
          err,
        )
      }
    }
  }

  return newlyTriggered
}

/**
 * Get all previously triggered achievements for a user from IndexedDB.
 */
export async function getTriggeredAchievements(
  userId: string,
): Promise<Achievement[]> {
  const db = await getDBAsync()
  if (!db) return []

  const results: Achievement[] = []
  try {
    const tx = db.transaction('achievements', 'readonly')
    const index = tx.store.index('by-userId')
    let cursor = await index.openCursor(IDBKeyRange.only(userId))
    while (cursor) {
      const def = ACHIEVEMENTS.find((a) => a.id === cursor.value.type)
      if (def) {
        results.push({ ...def })
      }
      cursor = await cursor.continue()
    }
    await tx.done
  } catch (err) {
    console.error('[getTriggeredAchievements] Failed to read:', err)
  }

  return results
}
