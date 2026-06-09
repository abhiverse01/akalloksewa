'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function LeaderboardCard() {
  const user = useAuthStore((s) => s.user)
  const totalTests = user?.stats?.totalTests ?? 0
  const avgScore = totalTests > 0
    ? Math.round(
        Object.values(user?.stats?.subjectAccuracy ?? {}).reduce((a: number, b: number) => a + b, 0) /
          Object.values(user?.stats?.subjectAccuracy ?? {}).length
      )
    : 0

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>Leaderboard</p>
        <Link href="/leaderboard" className="text-xs flex items-center gap-0.5" style={{ color: 'var(--ink-400)' }}>
          View all
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center mt-4">
        <Trophy size={28} style={{ color: 'var(--text-faint)' }} />
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-faint)' }}>
          {totalTests > 0
            ? 'Complete more tests to see rankings'
            : 'Take tests to appear on the leaderboard'}
        </p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
          {totalTests > 0
            ? `Average accuracy: ${avgScore}% across ${totalTests} test${totalTests > 1 ? 's' : ''}`
            : 'Your score will be compared with others'}
        </p>
      </div>
    </motion.div>
  )
}
