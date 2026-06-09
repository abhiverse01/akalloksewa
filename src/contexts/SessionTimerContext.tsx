'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useSessionTimer } from '@/hooks/useSessionTimer'

interface SessionTimerContextValue {
  startSession: () => void
  stopSession: () => void
  resetSession: () => void
  elapsed: string
  elapsedSeconds: number
  isActive: boolean
}

const SessionTimerContext = createContext<SessionTimerContextValue | null>(null)

export function SessionTimerProvider({ children }: { children: React.ReactNode }) {
  const timer = useSessionTimer()

  const value = useMemo<SessionTimerContextValue>(
    () => ({
      startSession: timer.startSession,
      stopSession: timer.stopSession,
      resetSession: timer.resetSession,
      elapsed: timer.elapsed,
      elapsedSeconds: timer.elapsedSeconds,
      isActive: timer.isActive,
    }),
    [timer]
  )

  return (
    <SessionTimerContext.Provider value={value}>
      {children}
    </SessionTimerContext.Provider>
  )
}

export function useSessionTimerContext(): SessionTimerContextValue {
  const ctx = useContext(SessionTimerContext)
  if (!ctx) {
    throw new Error('useSessionTimerContext must be used within a <SessionTimerProvider>')
  }
  return ctx
}
