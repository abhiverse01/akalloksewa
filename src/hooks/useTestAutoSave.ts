'use client'

/**
 * useTestAutoSave — Auto-saves test progress at regular intervals
 * and on tab visibility changes (when the user switches away).
 *
 * Requires an active sessionId. When sessionId is empty the hook is a no-op.
 */

import { useEffect } from 'react'
import { useTestStore } from '@/stores/testStore'
import { saveTestProgress } from '@/lib/db/tests'

const SAVE_INTERVAL_MS = 5_000 // 5 seconds

export function useTestAutoSave(sessionId: string) {
  const status = useTestStore((s) => s.status)

  useEffect(() => {
    if (!sessionId) return
    if (status !== 'active' && status !== 'paused') return

    let cancelled = false

    const performSave = () => {
      if (cancelled) return
      // Read latest state directly from the store (no stale closure)
      const { answers, markedForReview, skipped } = useTestStore.getState()
      saveTestProgress(sessionId, {
        answers: { ...answers },
        markedForReview: [...markedForReview],
        skipped: [...skipped],
      }).catch((err) => {
        console.error('[useTestAutoSave] Save failed:', err)
      })
    }

    // Periodic save
    const interval = setInterval(performSave, SAVE_INTERVAL_MS)

    // Save on visibility change (user leaves tab)
    const handleVisibility = () => {
      if (document.hidden) {
        performSave()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Save on beforeunload (page close / navigate away)
    const handleBeforeUnload = () => {
      performSave()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionId, status])
}
