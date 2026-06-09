'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const QUESTION_COUNTS = ['10', '20', '50']

export function QuickTestCard() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState('10')

  const handleBegin = () => {
    const params = new URLSearchParams({ mode: 'drill', count: selectedCount })
    if (selectedSubject) params.set('subject', selectedSubject)
    router.push(`/practice/all?${params.toString()}`)
  }

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-md" style={{ color: 'var(--text-primary)' }}>Start a test</p>
      <p className="t-caption mt-1" style={{ color: 'var(--text-faint)' }}>Pick subject & question count</p>

      {/* Subject chips */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {LOKSEWA_SUBJECTS.slice(0, 5).map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
              selectedSubject === s.id
                ? 'border-ink-400 bg-ink-800 text-ink-200'
                : 'border-border-subtle hover:border-border-default'
            )}
            style={selectedSubject === s.id ? undefined : { color: 'var(--text-tertiary)' }}
          >
            {s.labelEn}
          </button>
        ))}
      </div>

      {/* Question count chips */}
      <div className="flex gap-1.5 mt-3">
        {QUESTION_COUNTS.map((count) => (
          <button
            key={count}
            onClick={() => setSelectedCount(count)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
              selectedCount === count
                ? 'border-ink-400 bg-ink-800 text-ink-200'
                : 'border-border-subtle hover:border-border-default'
            )}
            style={selectedCount === count ? undefined : { color: 'var(--text-tertiary)' }}
          >
            {count} Questions
          </button>
        ))}
      </div>

      {/* Begin button */}
      <button
        onClick={handleBegin}
        className="mt-4 w-full h-9 rounded-md bg-gold-400 text-ink-950 font-semibold text-sm hover:bg-gold-300 transition-colors btn-press"
      >
        Begin →
      </button>
    </motion.div>
  )
}
