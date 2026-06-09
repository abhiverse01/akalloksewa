'use client'

import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type StreakState = 'active' | 'at-risk' | 'broken'

function getDaysSince(timestamp: number): number {
  if (!timestamp) return Infinity
  const now = new Date()
  const then = new Date(timestamp)
  now.setHours(0, 0, 0, 0)
  then.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

function getStreakState(lastPracticeDate: number, currentStreak: number): StreakState {
  if (currentStreak > 0 && getDaysSince(lastPracticeDate) === 0) return 'active'
  if (lastPracticeDate > 0 && getDaysSince(lastPracticeDate) === 1) return 'at-risk'
  return 'broken'
}

export function StreakCard() {
  const user = useAuthStore((s) => s.user)
  const streak = user?.stats?.currentStreak ?? 0
  const longestStreak = user?.stats?.longestStreak ?? 0
  const lastPracticeDate = user?.stats?.lastPracticeDate ?? 0
  const state = getStreakState(lastPracticeDate, streak)
  const today = (new Date().getDay() + 6) % 7 // Mon=0

  return (
    <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center">
      <motion.p
        className="t-display-xl text-gold-400"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {state === 'active' ? '🔥' : '⏳'} {streak}
      </motion.p>
      <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
        {state === 'active'
          ? 'Day streak'
          : state === 'at-risk'
            ? 'Streak at risk!'
            : streak === 0
              ? 'Start your streak today'
              : 'Day streak'}
      </p>

      {state === 'at-risk' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-2 px-2 py-1 rounded"
          style={{ color: 'var(--gold-300)', background: 'rgba(232,168,19,0.1)' }}
        >
          Practice today to keep your streak!
        </motion.p>
      )}

      {streak > 0 && (
        <div className="flex items-center gap-1.5 mt-4">
          {DAY_LABELS.map((label, i) => {
            const streakStart = today - streak + 1
            const isActive = streak > 0 && i >= streakStart && i <= today
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <motion.div
                  className={`size-2.5 sm:size-2 rounded-full ${isActive ? 'bg-gold-400' : ''}`}
                  style={{ backgroundColor: isActive ? undefined : 'var(--border-subtle)' }}
                  animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
                <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {longestStreak > streak && streak > 0 && (
        <p className="t-caption mt-2" style={{ color: 'var(--text-faint)' }}>
          Personal best: {longestStreak}
        </p>
      )}
    </motion.div>
  )
}
