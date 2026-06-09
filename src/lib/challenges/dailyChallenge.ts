import type { Question, LoksewaSubject, Difficulty } from '@/types/question'
import { getDBAsync } from '@/lib/db/schema'

// ─── Mulberry32 Seeded PRNG ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate a numeric seed from a date string (YYYYMMDD) and userId.
 * Uses a simple hash to ensure different users get different challenges on the same day.
 */
function dateUserSeed(dateStr: string, userId: string): number {
  let hash = 0
  const combined = `${dateStr}:${userId}`
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return Math.abs(hash)
}

/**
 * Get today's date in YYYYMMDD format.
 */
function getTodayDateKey(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

/**
 * Shuffle an array in-place using Fisher-Yates with a seeded PRNG.
 */
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Pick a balanced mix of questions from weak subjects and across difficulties.
 *
 * @param pool - All approved questions to choose from
 * @param weakSubjects - Subjects the user is weakest in (prioritized)
 * @param subjectAccuracy - Map of subject → accuracy percentage
 * @param count - Total number of questions to return
 * @param rng - Seeded PRNG function
 */
function pickBalancedQuestions(
  pool: Question[],
  weakSubjects: LoksewaSubject[],
  subjectAccuracy: Record<string, number>,
  count: number,
  rng: () => number
): string[] {
  if (pool.length === 0) return []

  const weakSet = new Set(weakSubjects)
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'very-hard']

  // Partition questions: weak vs. strong
  const weakQuestions = pool.filter((q) => weakSet.has(q.subject))
  const strongQuestions = pool.filter((q) => !weakSet.has(q.subject))

  // Build difficulty buckets within each group
  type Bucket = Question[]
  const weakBuckets: Record<Difficulty, Bucket> = { easy: [], medium: [], hard: [], 'very-hard': [] }
  const strongBuckets: Record<Difficulty, Bucket> = { easy: [], medium: [], hard: [], 'very-hard': [] }

  for (const q of weakQuestions) {
    weakBuckets[q.difficulty].push(q)
  }
  for (const q of strongQuestions) {
    strongBuckets[q.difficulty].push(q)
  }

  // Shuffle each bucket
  for (const diff of difficulties) {
    weakBuckets[diff] = seededShuffle(weakBuckets[diff], rng)
    strongBuckets[diff] = seededShuffle(strongBuckets[diff], rng)
  }

  // Allocate: ~60% weak subjects, ~40% other, balanced across difficulties
  const weakCount = Math.ceil(count * 0.6)
  const strongCount = count - weakCount

  const selected: string[] = []
  const seenIds = new Set<string>()

  const pickFromBuckets = (
    buckets: Record<Difficulty, Bucket>,
    targetCount: number
  ) => {
    const perDiff = Math.ceil(targetCount / difficulties.length)
    for (const diff of difficulties) {
      let picked = 0
      for (const q of buckets[diff]) {
        if (picked >= perDiff) break
        if (!seenIds.has(q.id)) {
          selected.push(q.id)
          seenIds.add(q.id)
          picked++
        }
      }
    }
  }

  pickFromBuckets(weakBuckets, weakCount)
  pickFromBuckets(strongBuckets, strongCount)

  // Fill remaining slots if we're short
  if (selected.length < count) {
    const allShuffled = seededShuffle(pool, rng)
    for (const q of allShuffled) {
      if (selected.length >= count) break
      if (!seenIds.has(q.id)) {
        selected.push(q.id)
        seenIds.add(q.id)
      }
    }
  }

  return selected
}

/**
 * Generate a daily challenge for a specific user.
 *
 * Uses the current date as seed (plus userId) to produce a deterministic,
 * reproducible set of question IDs for the day. Prioritizes the user's
 * weak subjects and balances difficulty distribution.
 *
 * @param userId - The user's ID (used in seed for per-user uniqueness)
 * @param count  - Number of questions (default 10)
 * @param weakSubjects - User's weakest subjects (from stats)
 * @param subjectAccuracy - Subject accuracy map (from stats)
 * @returns Array of question IDs for today's challenge
 */
export async function generateDailyChallenge(
  userId: string,
  count: number = 10,
  weakSubjects: LoksewaSubject[] = [],
  subjectAccuracy: Record<string, number> = {}
): Promise<string[]> {
  const db = await getDBAsync()
  if (!db) return []

  const dateKey = getTodayDateKey()
  const seed = dateUserSeed(dateKey, userId)
  const rng = mulberry32(seed)

  // Fetch all approved questions
  const allQuestions = await db.getAllFromIndex('questions', 'by-status', 'approved')
  const approvedQuestions = allQuestions as unknown as Question[]

  if (approvedQuestions.length === 0) return []

  return pickBalancedQuestions(
    approvedQuestions,
    weakSubjects,
    subjectAccuracy,
    count,
    rng
  )
}
