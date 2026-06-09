'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { SUBJECT_MAP } from '@/lib/constants'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function getColor(accuracy: number) {
  if (accuracy < 40) return { bar: 'bg-red-400', text: 'text-red-400' }
  if (accuracy < 55) return { bar: 'bg-amber-400', text: 'text-amber-400' }
  return { bar: 'bg-gold-400', text: 'text-gold-400' }
}

export function WeakAreasCard() {
  const user = useAuthStore((s) => s.user)
  const subjectAccuracy = user?.stats?.subjectAccuracy ?? {}

  const weakAreas = Object.entries(subjectAccuracy)
    .map(([subject, accuracy]) => {
      const info = SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP]
      return {
        topic: info?.labelEn ?? subject,
        accuracy: Math.round(accuracy),
      }
    })
    .filter((a) => a.accuracy > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  if (weakAreas.length === 0) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 160 }}>
        <p className="t-body-sm" style={{ color: 'var(--text-faint)' }}>No data yet</p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>Practice more to see weak areas</p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>Weak Areas</p>
      <div className="space-y-3">
        {weakAreas.map((area, idx) => {
          const colors = getColor(area.accuracy)
          return (
            <motion.div
              key={area.topic}
              className="space-y-1.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{area.topic}</span>
                <span className={cn('text-sm font-semibold', colors.text)}>{area.accuracy}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.accuracy}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 + 0.2 }}
                  className={cn('h-full rounded-full', colors.bar)}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
