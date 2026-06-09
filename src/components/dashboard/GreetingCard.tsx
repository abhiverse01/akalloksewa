'use client'

import { motion } from 'framer-motion'
import { PSC_EXAM_DATE } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function GreetingCard() {
  const authUser = useAuthStore((s) => s.user)
  const name = authUser?.displayName || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dailyGoal = 20
  /* Estimate from real IndexedDB stats (10% of total attempted, capped at daily goal) */
  const todayDone = authUser?.stats?.totalQuestionsAttempted ? Math.min(Math.floor(authUser.stats.totalQuestionsAttempted * 0.1), dailyGoal) : 0
  const pct = Math.round((todayDone / dailyGoal) * 100)

  const daysRemaining = PSC_EXAM_DATE.daysRemaining

  return (
    <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col justify-between">
      <div>
        <p className="t-display-lg" style={{ color: 'var(--text-primary)' }}>{greeting}, {name}.</p>
        <p className="t-body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {daysRemaining > 0
            ? `You're ${daysRemaining} days from the exam. Let's work.`
            : 'Exam season is here. Stay focused and keep practicing!'}
        </p>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Today&apos;s goal: {dailyGoal} questions</span>
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>{todayDone} / {dailyGoal} done</span>
        </div>
        <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-ink-500"
          />
        </div>
      </div>
    </motion.div>
  )
}

export function ExamCountdownCard() {
  const daysRemaining = PSC_EXAM_DATE.daysRemaining

  /* Simple prep progress estimate based on days elapsed vs total prep window */
  const totalPrepDays = 180
  const daysElapsed = totalPrepDays - daysRemaining
  const prepPct = Math.round(Math.min((daysElapsed / totalPrepDays) * 100, 100))

  return (
    <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center" style={{ background: "var(--ink-800)" }}>
      <p className="t-caption" style={{ color: 'var(--text-faint)' }}>PSC Exam</p>
      <p className="t-display-xl mt-1" style={{ color: 'var(--ink-200)' }}>{daysRemaining}</p>
      <p className="t-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>days remaining</p>
      <p className="t-caption mt-2" style={{ color: 'var(--text-faint)' }}>{PSC_EXAM_DATE.dateBS}</p>
      {/* Progress bar: preparation progress */}
      <div className="w-full mt-4">
        <div className="flex justify-between mb-1">
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Preparation</span>
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>{prepPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-ink-400"
            initial={{ width: 0 }}
            animate={{ width: `${prepPct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}
