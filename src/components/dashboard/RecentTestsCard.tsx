'use client'

import { motion } from 'framer-motion'
import { useDB } from '@/hooks/useDB'
import { useEffect, useState } from 'react'
import { getRecentTestSessions } from '@/lib/db/tests'
import { formatTime } from '@/hooks/useDB'
import { cn } from '@/lib/utils'
import type { TestSession } from '@/types/test'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function RecentTestsCard() {
  const { isReady } = useDB()
  const [tests, setTests] = useState<TestSession[]>([])

  useEffect(() => {
    if (!isReady) return
    getRecentTestSessions(5).then(setTests)
  }, [isReady])

  return (
    <motion.div variants={fadeUp} className="bento-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>Recent Tests</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border-subtle text-left">
              <th className="px-5 py-2 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Date</th>
              <th className="px-5 py-2 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Name</th>
              <th className="px-5 py-2 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Score</th>
              <th className="px-5 py-2 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Accuracy</th>
              <th className="px-5 py-2 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {tests.length > 0 ? tests.map((t, i) => (
              <tr key={t.id} className={cn('border-t border-border-subtle', i > 0 && 'border-subtle')}>
                <td className="px-5 py-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(t.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-5 py-2.5 font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                  {t.config.name}
                </td>
                <td className="px-5 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.score ? `${t.score.correct}/${t.score.total}` : '—'}
                </td>
                <td className={cn(
                  'px-5 py-2.5 font-medium',
                  t.score && t.score.percentage >= 60 ? 'text-green-400' : 'text-red-400'
                )}>
                  {t.score ? `${t.score.percentage}%` : '—'}
                </td>
                <td className="px-5 py-2.5 text-xs t-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {t.endedAt ? formatTime(Math.floor((t.endedAt - t.startedAt) / 1000)) : '—'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No tests taken yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
