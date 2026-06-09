'use client'

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getDBAsync } from '@/lib/db/schema'
import type { LoksewaSubject } from '@/types/question'
import type { AnalyticsEvent } from '@/types/analytics'

// ─── Types ─────────────────────────────────────────────────────────────────────

type StreakStatus = 'none' | 'at-risk' | 'active' | 'hot'
type ExamUrgency = 'none' | 'plenty' | 'moderate' | 'urgent' | 'critical'

interface UserContextValue {
  firstName: string
  streakStatus: StreakStatus
  daysToExam: number
  examUrgency: ExamUrgency
  todaysPracticeCount: number
  todaysGoalMet: boolean
  overallAccuracy: number
  weakestSubject: LoksewaSubject | null
  strongestSubject: LoksewaSubject | null
  refreshStats: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStreakStatus(streak: number): StreakStatus {
  if (streak === 0) return 'none'
  if (streak === 1) return 'at-risk'
  if (streak <= 6) return 'active'
  return 'hot'
}

function computeExamUrgency(daysToExam: number): ExamUrgency {
  if (daysToExam <= 0) return 'critical'
  if (daysToExam <= 14) return 'urgent'
  if (daysToExam <= 45) return 'moderate'
  if (daysToExam <= 90) return 'plenty'
  return 'none'
}

function computeDaysToExam(targetDate?: number): number {
  if (!targetDate) return 0
  return Math.max(0, Math.ceil((targetDate - Date.now()) / 86400000))
}

function computeOverallAccuracy(totalCorrect: number, totalAttempted: number): number {
  if (totalAttempted === 0) return 0
  return Math.round((totalCorrect / totalAttempted) * 100)
}

function findExtremes(
  subjectAccuracy: Record<string, number>
): { weakest: LoksewaSubject | null; strongest: LoksewaSubject | null } {
  const entries = Object.entries(subjectAccuracy).filter(([, v]) => v > 0)
  if (entries.length === 0) return { weakest: null, strongest: null }

  const sorted = entries.sort((a, b) => a[1] - b[1])
  return {
    weakest: sorted[0][0] as LoksewaSubject,
    strongest: sorted[sorted.length - 1][0] as LoksewaSubject,
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const [refreshKey, setRefreshKey] = useState(0)
  const [todaysPracticeCount, setTodaysPracticeCount] = useState(0)

  const refreshStats = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // Fetch today's practice count from IndexedDB analytics events
  useEffect(() => {
    async function loadTodaysCount() {
      try {
        const db = await getDBAsync()
        if (!db) return
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const events = await db.getAllFromIndex('analyticsEvents', 'by-timestamp', IDBKeyRange.lowerBound(todayStart.getTime()))
        const count = (events as unknown as AnalyticsEvent[]).filter(e => e.type === 'practice').length
        setTodaysPracticeCount(count)
      } catch (err) {
        console.error('[UserContext] Failed to load todays count:', err)
      }
    }
    loadTodaysCount()
  }, [refreshKey])

  const value = useMemo<UserContextValue>(() => {
    const displayName = user?.displayName ?? ''
    const firstName = displayName.split(' ')[0] || 'User'
    const streak = user?.stats?.currentStreak ?? 0
    const daysToExam = computeDaysToExam(user?.profile?.targetDate)

    const totalCorrect = user?.stats?.totalCorrect ?? 0
    const totalAttempted = user?.stats?.totalQuestionsAttempted ?? 0

    const extremes = findExtremes(user?.stats?.subjectAccuracy ?? {})

    const todaysGoalMet = todaysPracticeCount >= (user?.preferences?.defaultQuestionCount ?? 20)

    return {
      firstName,
      streakStatus: computeStreakStatus(streak),
      daysToExam,
      examUrgency: computeExamUrgency(daysToExam),
      todaysPracticeCount,
      todaysGoalMet,
      overallAccuracy: computeOverallAccuracy(totalCorrect, totalAttempted),
      weakestSubject: extremes.weakest,
      strongestSubject: extremes.strongest,
      refreshStats,
    }
  }, [user, refreshStats, todaysPracticeCount])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUserContext must be used within a <UserProvider>')
  }
  return ctx
}
