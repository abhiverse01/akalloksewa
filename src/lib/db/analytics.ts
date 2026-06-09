import { nanoid } from 'nanoid'
import { subDays, startOfDay, endOfDay, format, differenceInDays } from 'date-fns'
import type { AnalyticsEvent } from '@/types/analytics'
import type { SubjectPerformance } from '@/types/analytics'
import type { LoksewaSubject } from '@/types/question'
import type { UserRecord } from '@/types/auth'
import { initDB } from './schema'

// ── Logging ──────────────────────────────────────────────────────────────────

/**
 * Log a practice event AND update the user's aggregated stats.
 *
 * This does two things atomically:
 * 1. Inserts an AnalyticsEvent record
 * 2. Updates the user's stats field (streak, accuracy, totals)
 */
export async function logPracticeEvent(
  userId: string,
  questionId: string,
  subject?: LoksewaSubject,
  isCorrect?: boolean,
  timeSpentSeconds?: number
): Promise<AnalyticsEvent | null> {
  try {
    const db = await initDB()

    // 1. Create the analytics event
    const now = Date.now()
    const event: AnalyticsEvent = {
      id: nanoid(12),
      type: 'practice',
      subject,
      score: isCorrect !== undefined ? (isCorrect ? 1 : 0) : undefined,
      timeTaken: timeSpentSeconds,
      questionCount: 1,
      timestamp: now,
    }
    await db.put('analyticsEvents', event)

    // 2. Update user stats
    const user = await db.get('users', userId)
    if (user) {
      const today = startOfDay(new Date()).getTime()
      const lastPractice = startOfDay(new Date(user.stats.lastPracticeDate)).getTime()
      const dayDiff = differenceInDays(now, user.stats.lastPracticeDate)

      let newStreak = user.stats.currentStreak
      if (dayDiff === 0) {
        // Already practiced today — streak stays the same
      } else if (dayDiff === 1) {
        newStreak += 1
      } else if (dayDiff > 1) {
        newStreak = 1 // Streak reset
      }

      const newLongestStreak = Math.max(newStreak, user.stats.longestStreak)
      const newTotal = user.stats.totalQuestionsAttempted + 1
      const newCorrect = isCorrect ? user.stats.totalCorrect + 1 : user.stats.totalCorrect
      const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0

      // Update per-subject accuracy
      const subjectAccuracy = { ...user.stats.subjectAccuracy }
      if (subject) {
        const key = subject as string
        // Simple running accuracy — weighted average approach
        const prevTotal = subjectAccuracy[`${key}:total`] ?? 0
        const prevCorrect = subjectAccuracy[`${key}:correct`] ?? 0
        const newSubTotal = prevTotal + 1
        const newSubCorrect = isCorrect ? prevCorrect + 1 : prevCorrect
        subjectAccuracy[key] = newSubTotal > 0 ? (newSubCorrect / newSubTotal) * 100 : 0
        subjectAccuracy[`${key}:total`] = newSubTotal
        subjectAccuracy[`${key}:correct`] = newSubCorrect
      }

      await db.put('users', {
        ...user,
        stats: {
          ...user.stats,
          totalQuestionsAttempted: newTotal,
          totalCorrect: newCorrect,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastPracticeDate: now,
          subjectAccuracy,
          totalStudyMinutes: user.stats.totalStudyMinutes + Math.floor((timeSpentSeconds ?? 0) / 60),
        },
      })
    }

    return event
  } catch (err) {
    console.error('[analytics.logPracticeEvent] Error:', err)
    return null
  }
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

/**
 * Get activity heatmap data for the last N days.
 * Returns a Record where keys are date strings in 'yyyy-MM-dd' format
 * and values are the count of events on that day.
 */
export async function getActivityHeatmap(
  userId: string,
  days: number = 365
): Promise<Record<string, number>> {
  try {
    const db = await initDB()
    const now = new Date()
    const cutoff = subDays(now, days - 1)
    const cutoffMs = startOfDay(cutoff).getTime()

    const allEvents = await db.getAll('analyticsEvents')
    const filtered = allEvents.filter((e) => e.timestamp >= cutoffMs)

    const heatmap: Record<string, number> = {}

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = subDays(now, days - 1 - i)
      const key = format(date, 'yyyy-MM-dd')
      heatmap[key] = 0
    }

    // Count events per day
    for (const event of filtered) {
      const key = format(new Date(event.timestamp), 'yyyy-MM-dd')
      if (key in heatmap) {
        heatmap[key]++
      }
    }

    return heatmap
  } catch (err) {
    console.error('[analytics.getActivityHeatmap] Error:', err)
    return {}
  }
}

// ── Score Trend ───────────────────────────────────────────────────────────────

/**
 * Get the score trend from the last N completed test events.
 */
export async function getScoreTrend(
  userId?: string,
  limit: number = 20
): Promise<{ score: number; timestamp: number; questionCount?: number }[]> {
  try {
    const db = await initDB()
    const allEvents = await db.getAllFromIndex('analyticsEvents', 'by-timestamp')

    const testEvents = allEvents
      .filter((e) => e.type === 'test' && e.score !== undefined)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    return testEvents.map((e) => ({
      score: e.score!,
      timestamp: e.timestamp,
      questionCount: e.questionCount,
    }))
  } catch (err) {
    console.error('[analytics.getScoreTrend] Error:', err)
    return []
  }
}

// ── Subject Performance ───────────────────────────────────────────────────────

/**
 * Get per-subject performance metrics including accuracy and trend direction.
 */
export async function getSubjectPerformance(
  userId?: string
): Promise<SubjectPerformance[]> {
  try {
    const db = await initDB()
    const allEvents = await db.getAll('analyticsEvents')

    // Filter to practice events with subject
    const practiceEvents = allEvents.filter(
      (e) => e.type === 'practice' && e.subject !== undefined && e.score !== undefined
    )

    // Group by subject
    const subjectMap = new Map<string, { total: number; correct: number; recent: number[] }>()

    for (const event of practiceEvents) {
      const key = event.subject as string

      if (!subjectMap.has(key)) {
        subjectMap.set(key, { total: 0, correct: 0, recent: [] })
      }

      const data = subjectMap.get(key)!
      data.total++
      if (event.score === 1) data.correct++
      data.recent.push(event.timestamp)
    }

    // Build performance results with trend calculation
    const results: SubjectPerformance[] = []

    for (const [subject, data] of subjectMap.entries()) {
      const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0

      // Calculate trend: compare recent 50% vs older 50%
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (data.recent.length >= 10) {
        data.recent.sort((a, b) => a - b)
        const mid = Math.floor(data.recent.length / 2)

        // Get accuracy for older half vs newer half
        const olderTimestamps = new Set(data.recent.slice(0, mid))
        const newerTimestamps = new Set(data.recent.slice(mid))

        let olderCorrect = 0
        let olderTotal = 0
        let newerCorrect = 0
        let newerTotal = 0

        for (const event of practiceEvents) {
          if (event.subject !== subject || event.score === undefined) continue
          if (olderTimestamps.has(event.timestamp)) {
            olderTotal++
            if (event.score === 1) olderCorrect++
          }
          if (newerTimestamps.has(event.timestamp)) {
            newerTotal++
            if (event.score === 1) newerCorrect++
          }
        }

        const olderAccuracy = olderTotal > 0 ? (olderCorrect / olderTotal) * 100 : 0
        const newerAccuracy = newerTotal > 0 ? (newerCorrect / newerTotal) * 100 : 0

        if (newerAccuracy > olderAccuracy + 5) trend = 'up'
        else if (newerAccuracy < olderAccuracy - 5) trend = 'down'
        else trend = 'stable'
      }

      results.push({
        subject: subject as LoksewaSubject,
        totalQuestions: data.total,
        correct: data.correct,
        accuracy,
        trend,
      })
    }

    // Sort by accuracy ascending (worst first)
    return results.sort((a, b) => a.accuracy - b.accuracy)
  } catch (err) {
    console.error('[analytics.getSubjectPerformance] Error:', err)
    return []
  }
}

// ── Weak Topics ───────────────────────────────────────────────────────────────

/**
 * Get the user's weakest performing subjects/topics.
 * Returns subjects sorted by accuracy (worst first), limited to `limit`.
 */
export async function getWeakTopics(
  userId?: string,
  limit: number = 5
): Promise<SubjectPerformance[]> {
  try {
    const performance = await getSubjectPerformance(userId)
    return performance.slice(0, limit)
  } catch (err) {
    console.error('[analytics.getWeakTopics] Error:', err)
    return []
  }
}

// ── Today's Practice Count ────────────────────────────────────────────────────

/**
 * Get the number of practice events for today.
 */
export async function getTodaysPracticeCount(userId?: string): Promise<number> {
  try {
    const db = await initDB()
    const now = new Date()
    const dayStart = startOfDay(now).getTime()
    const dayEnd = endOfDay(now).getTime()

    const allEvents = await db.getAll('analyticsEvents')
    const todayEvents = allEvents.filter(
      (e) => e.type === 'practice' && e.timestamp >= dayStart && e.timestamp <= dayEnd
    )

    return todayEvents.length
  } catch (err) {
    console.error('[analytics.getTodaysPracticeCount] Error:', err)
    return 0
  }
}

// ── Generic Event Helpers ────────────────────────────────────────────────────

/**
 * Log a test completion event.
 */
export async function logTestEvent(
  userId: string,
  score: number,
  questionCount: number,
  timeTakenSeconds: number,
  subject?: LoksewaSubject
): Promise<AnalyticsEvent | null> {
  try {
    const db = await initDB()

    const event: AnalyticsEvent = {
      id: nanoid(12),
      type: 'test',
      subject,
      score,
      timeTaken: timeTakenSeconds,
      questionCount,
      timestamp: Date.now(),
    }
    await db.put('analyticsEvents', event)

    // Update user's total tests count
    const user = await db.get('users', userId)
    if (user) {
      await db.put('users', {
        ...user,
        stats: {
          ...user.stats,
          totalTests: user.stats.totalTests + 1,
          totalStudyMinutes: user.stats.totalStudyMinutes + Math.floor(timeTakenSeconds / 60),
        },
      })
    }

    return event
  } catch (err) {
    console.error('[analytics.logTestEvent] Error:', err)
    return null
  }
}

/**
 * Get all analytics events, sorted by most recent first.
 */
export async function getAllEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('analyticsEvents')
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  } catch (err) {
    console.error('[analytics.getAllEvents] Error:', err)
    return []
  }
}

// ── Legacy Aliases (kept for backward compatibility) ──────────────────────────

export async function addAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const db = await initDB()
    await db.put('analyticsEvents', event)
  } catch (err) {
    console.error('[analytics.addAnalyticsEvent] Error:', err)
  }
}

export async function getEventsByType(type: string): Promise<AnalyticsEvent[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex('analyticsEvents', 'by-type', type)
  } catch (err) {
    console.error('[analytics.getEventsByType] Error:', err)
    return []
  }
}

export async function getRecentEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
  try {
    const db = await initDB()
    const all = await db.getAllFromIndex('analyticsEvents', 'by-timestamp')
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  } catch (err) {
    console.error('[analytics.getRecentEvents] Error:', err)
    return []
  }
}

export async function getEventsInDateRange(start: number, end: number): Promise<AnalyticsEvent[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('analyticsEvents')
    return all.filter((e) => e.timestamp >= start && e.timestamp <= end)
  } catch (err) {
    console.error('[analytics.getEventsInDateRange] Error:', err)
    return []
  }
}
