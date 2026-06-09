'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'akal_session_start'

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} min`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m} min`
  return `${h}h ${m}m`
}

function getInitialState(): { elapsedSeconds: number; startTime: number | null } {
  if (typeof window === 'undefined') return { elapsedSeconds: 0, startTime: null }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const start = parseInt(stored, 10)
      if (!isNaN(start)) {
        return { elapsedSeconds: Math.floor((Date.now() - start) / 1000), startTime: start }
      }
    }
  } catch {
    // sessionStorage unavailable
  }
  return { elapsedSeconds: 0, startTime: null }
}

export function useSessionTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const initializedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Tick interval
  useEffect(() => {
    if (isActive && startTimeRef.current !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const startSession = useCallback(() => {
    // On first call, check sessionStorage to resume
    if (!initializedRef.current) {
      initializedRef.current = true
      const init = getInitialState()
      if (init.startTime !== null) {
        startTimeRef.current = init.startTime
        setElapsedSeconds(init.elapsedSeconds)
        setIsActive(true)
        return
      }
    }

    if (startTimeRef.current !== null) return // already running
    const now = Date.now()
    startTimeRef.current = now
    try {
      sessionStorage.setItem(STORAGE_KEY, String(now))
    } catch {
      // sessionStorage unavailable
    }
    setIsActive(true)
  }, [])

  const stopSession = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    startTimeRef.current = null
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // sessionStorage unavailable
    }
    setIsActive(false)
    setElapsedSeconds(0)
  }, [])

  const resetSession = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // sessionStorage unavailable
    }
    startTimeRef.current = null
    setIsActive(false)
    setElapsedSeconds(0)
  }, [])

  return {
    elapsed: formatElapsed(elapsedSeconds),
    elapsedSeconds,
    isActive,
    startSession,
    stopSession,
    resetSession,
  }
}
