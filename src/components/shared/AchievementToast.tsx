'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'

interface AchievementToastProps {
  achievement: {
    name: string
    description: string
    icon: string
  } | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!achievement) return

    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [achievement, onDismiss])

  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {achievement && (
          <motion.div
            key={achievement.name}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
              exit: { duration: 0.15 },
            }}
            className="pointer-events-auto"
          >
            <div className="relative flex items-center gap-3 p-4 rounded-xl shadow-lg bg-[var(--bg-surface)] border border-[var(--border-default)] border-l-4 border-l-[var(--gold-400)]">
              {/* Gold Trophy Icon */}
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(232,168,19,0.15)]">
                <Trophy
                  className="w-5 h-5 text-[var(--gold-400)]"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>

              {/* Achievement Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                  {achievement.icon} {achievement.name}
                </p>
                <p className="text-xs text-[var(--text-faint)] mt-0.5 leading-snug">
                  {achievement.description}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                aria-label="Dismiss achievement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
