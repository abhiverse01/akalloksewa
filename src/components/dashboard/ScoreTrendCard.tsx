'use client'

import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ScoreTrendCard() {
  const user = useAuthStore((s) => s.user)
  const stats = user?.stats

  // Build score trend from test data when available
  // For now we show an empty state since we need test session history from DB
  // The main dashboard page.tsx has the full ScoreTrendCard with real DB data
  const hasScoreData = stats && stats.totalTests > 0

  // Fallback: show progress bars per subject if we have subject accuracy
  const subjectEntries = Object.entries(stats?.subjectAccuracy ?? {}).filter(([, v]) => v > 0)
  const showSubjectBars = subjectEntries.length > 0 && !hasScoreData

  if (!hasScoreData && !showSubjectBars) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 180 }}>
        <div className="t-body-sm text-center" style={{ color: 'var(--text-faint)' }}>
          Complete 2+ tests to see trends
        </div>
        <p className="t-caption text-center mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
          Your score progression will appear here
        </p>
      </motion.div>
    )
  }

  // Show subject-level accuracy as bars when no test sessions yet
  if (showSubjectBars) {
    const data = subjectEntries.slice(0, 7).map(([subject, accuracy]) => ({
      subject,
      score: Math.round(accuracy),
    }))

    return (
      <motion.div variants={fadeUp} className="bento-card p-5">
        <p className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>Subject Accuracy</p>
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.subject}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-secondary)' }}>{d.subject}</span>
                <span className="text-xs font-semibold" style={{ color: d.score >= 60 ? 'var(--green-400)' : 'var(--red-400)' }}>{d.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-ink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  // This branch is reached when we have test session data
  // In the future, test sessions should be fetched from DB here
  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>Score Trend</p>
      <div className="t-body-sm text-center" style={{ color: 'var(--text-faint)' }}>Loading trends...</div>
    </motion.div>
  )
}
