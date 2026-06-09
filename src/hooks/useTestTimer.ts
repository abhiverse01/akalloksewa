'use client'

/**
 * useTestTimer — Precision countdown timer for the test engine
 *
 * Uses requestAnimationFrame for smooth second-by-second updates.
 * Checks wall-clock time for drift prevention (if the tab was backgrounded).
 * Auto-submits when the timer reaches zero.
 *
 * The display is derived directly from the store's timeRemaining —
 * no local state is needed.
 */

import { useEffect, useMemo } from 'react'
import { useTestStore } from '@/stores/testStore'

export interface TimerDisplay {
  formatted: string
  urgency: 'normal' | 'warning' | 'critical'
}

const WARNING_THRESHOLD = 300   // 5 minutes
const CRITICAL_THRESHOLD = 120  // 2 minutes

/**
 * Format seconds into HH:MM:SS or MM:SS string.
 */
function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(sec)}`
  }
  return `${pad(m)}:${pad(sec)}`
}

function getUrgency(remaining: number): 'normal' | 'warning' | 'critical' {
  if (remaining <= CRITICAL_THRESHOLD) return 'critical'
  if (remaining <= WARNING_THRESHOLD) return 'warning'
  return 'normal'
}

export function useTestTimer(): TimerDisplay {
  const timerRunning = useTestStore((s) => s.timerRunning)
  const timeRemaining = useTestStore((s) => s.timeRemaining)
  const status = useTestStore((s) => s.status)

  // Derive display from the store's timeRemaining
  const display = useMemo<TimerDisplay>(() => ({
    formatted: formatTime(timeRemaining),
    urgency: getUrgency(timeRemaining),
  }), [timeRemaining])

  // Main rAF loop — ticks the store's timer and auto-submits at zero
  useEffect(() => {
    if (!timerRunning || status !== 'active') {
      return
    }

    let rafId: number
    let lastTick = Date.now()

    const loop = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastTick) / 1000)

      if (elapsed >= 1) {
        // Read latest state from the store
        const { timeRemaining: currentRemaining, tickTimer, submitTest } =
          useTestStore.getState()

        const ticks = Math.min(elapsed, currentRemaining)

        if (ticks > 0) {
          for (let i = 0; i < ticks; i++) {
            tickTimer()
          }
          lastTick = now

          // Auto-submit when timer hits 0
          if (currentRemaining - ticks <= 0) {
            submitTest().catch((err) => {
              console.error('[useTestTimer] Auto-submit failed:', err)
            })
            return // stop the loop
          }
        }
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [timerRunning, status])

  return display
}
