'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { initDB } from '@/lib/db/schema'

export function useDB() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    initDB()
      .then(() => setIsReady(true))
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
  }, [])

  return { isReady, error }
}

export function useTimer(initialSeconds: number, isPaused: boolean, onComplete?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isPaused) {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isPaused, clearTimer, onComplete])

  return timeRemaining
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function useKeyboard(keyMap: Record<string, () => void>) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.shiftKey && 'Shift',
        e.altKey && 'Alt',
        e.key,
      ]
        .filter(Boolean)
        .join('+')

      const handler = keyMap[key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyMap])
}
