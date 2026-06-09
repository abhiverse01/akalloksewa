'use client'

import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { SUBJECT_MAP } from '@/lib/constants'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function SubjectRadarCard() {
  const user = useAuthStore((s) => s.user)
  const subjectAccuracy = user?.stats?.subjectAccuracy ?? {}

  const chartData = Object.entries(subjectAccuracy)
    .filter(([, v]) => v > 0)
    .slice(0, 6)
    .map(([subject, accuracy]) => {
      const info = SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP]
      const label = info?.labelEn ?? subject
      return {
        subject: label.length > 12 ? label.slice(0, 10) + '…' : label,
        accuracy: Math.round(accuracy),
        fullMark: 100,
      }
    })

  if (chartData.length < 3) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
        <p className="t-body-sm" style={{ color: 'var(--text-faint)' }}>Need 3+ subjects with data</p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>Practice more to unlock your radar</p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>Subject Radar</p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--text-faint)', fontSize: 10 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Accuracy"
            dataKey="accuracy"
            stroke="var(--ink-400)"
            fill="rgba(51, 88, 196, 0.2)"
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
