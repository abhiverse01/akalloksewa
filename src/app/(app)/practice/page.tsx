'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  History,
  Sparkles,
} from 'lucide-react'
import { useDB } from '@/hooks/useDB'
import { getQuestionCountBySubject } from '@/lib/db/questions'
import {
  LOKSEWA_SUBJECTS,
  DIFFICULTY_LABELS,
  SUBJECT_COLORS,
  SUBJECT_MAP,
} from '@/lib/constants'
import type { LoksewaSubject } from '@/types/question'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════
   Practice Listing Page — GODMODE spec
   
   "Disciplined Ambition" aesthetic:
   - Hairline dividers, not box shadows
   - ink-*, gold-*, surface-*, border-subtle/default/strong, txt-* tokens
   - r-md max on interactive elements
   - Typography scale: t-heading-*, t-body-*, t-caption, t-mono
   ═══════════════════════════════════════════════════════════════ */

// ─── Animation Variants ───────────────────────────────────────────

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
}

// ─── Curated Question Sets (static data) ────────────────────────

interface CuratedSet {
  id: string
  name: string
  subjectId: LoksewaSubject
  questionCount: number
  difficulty: string
}

const CURATED_SETS: CuratedSet[] = [
  { id: 'constitution-past-paper', name: 'PSC 2080 Past Paper', subjectId: 'constitution', questionCount: 50, difficulty: 'medium' },
  { id: 'constitution-deep-dive', name: 'Constitution Deep Dive', subjectId: 'constitution', questionCount: 40, difficulty: 'hard' },
  { id: 'general-knowledge', name: 'GK Quick Fire', subjectId: 'general-knowledge', questionCount: 30, difficulty: 'easy' },
  { id: 'governance', name: 'Governance Grind', subjectId: 'governance', questionCount: 35, difficulty: 'medium' },
  { id: 'history', name: 'History Revolution', subjectId: 'history', questionCount: 25, difficulty: 'medium' },
  { id: 'mathematics', name: 'Math Speed Run', subjectId: 'mathematics', questionCount: 20, difficulty: 'hard' },
  { id: 'law', name: 'Law Fundamentals', subjectId: 'law', questionCount: 30, difficulty: 'easy' },
  { id: 'ethics', name: 'Ethics Dilemmas', subjectId: 'ethics', questionCount: 25, difficulty: 'hard' },
]

// ─── Recent Practice type ────────────────────────────────────────

interface RecentPractice {
  id: string
  subjectId: LoksewaSubject
  questionIndex: number
  totalQuestions: number
  updatedAt: number
}

// ─── Skeleton ────────────────────────────────────────────────────

function PracticeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Skeleton className="md:col-span-3 h-[280px] rounded-[14px]" />
        <Skeleton className="md:col-span-2 h-[280px] rounded-[14px]" />
      </div>

      {/* Curated sets */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24 rounded-md" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-[220px] rounded-[14px] shrink-0" />
          ))}
        </div>
      </div>

      {/* Recent practice */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-[80px] rounded-[14px]" />
      </div>
    </div>
  )
}

// ─── Difficulty Dots ─────────────────────────────────────────────

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const info = DIFFICULTY_LABELS[difficulty]
  const dots = info?.dots ?? 2
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: i < dots ? info?.color.includes('green')
              ? 'var(--green-400)'
              : info?.color.includes('amber')
                ? 'var(--amber-400)'
                : 'var(--red-400)' : 'var(--border-subtle)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Subject Chip ───────────────────────────────────────────────

function SubjectChip({
  subjectId,
  selected,
  onClick,
}: {
  subjectId: LoksewaSubject
  selected: boolean
  onClick: () => void
}) {
  const info = SUBJECT_MAP[subjectId]
  const colors = SUBJECT_COLORS[subjectId]
  if (!info) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] t-body-sm btn-press',
        'transition-all duration-150 focus-ring',
        selected
          ? 'text-white border border-transparent'
          : 'border border-border-subtle bg-surface hover:border-border-default hover:bg-surface-raised',
      )}
      style={
        selected
          ? { background: 'var(--ink-500)' }
          : { color: 'var(--text-secondary)' }
      }
    >
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-[6px] text-[10px]',
          colors?.bg,
          !selected ? colors?.text : 'bg-white/20 text-white',
        )}
      >
        <BookOpen className="h-3 w-3" />
      </span>
      {info.labelEn}
    </button>
  )
}

// ─── Free Practice Card ──────────────────────────────────────────

function FreePracticeCard({
  subjects,
  subjectCounts,
}: {
  subjects: LoksewaSubject[]
  subjectCounts: Record<string, number>
}) {
  const [selectedSubject, setSelectedSubject] = useState<LoksewaSubject | null>(null)
  const [expanded, setExpanded] = useState(false)

  const displaySubjects = useMemo(() => {
    if (!selectedSubject) return subjects.slice(0, expanded ? subjects.length : 6)
    return subjects
  }, [subjects, selectedSubject, expanded])

  const filteredSubjects = selectedSubject
    ? subjects.filter((s) => s === selectedSubject)
    : subjects

  const totalCount = useMemo(() => {
    if (selectedSubject) return subjectCounts[selectedSubject] ?? 0
    return Object.values(subjectCounts).reduce((a, b) => a + b, 0)
  }, [selectedSubject, subjectCounts])

  return (
    <motion.div
      variants={fadeUp}
      className="bento-card p-6 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 80%, var(--ink-400), transparent 60%)',
        }}
      />

      <div className="relative z-10">
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px]"
            style={{ background: 'rgba(37,64,160,0.12)' }}
          >
            <BookOpen className="h-5 w-5" style={{ color: 'var(--ink-400)' }} />
          </div>
          <div>
            <h2 className="t-heading-lg" style={{ color: 'var(--text-primary)' }}>
              Free Practice
            </h2>
            <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
              Practice at your own pace
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-tertiary)' }}>
          No timer, no pressure. See explanations immediately. Perfect for learning.
        </p>

        {/* Subject Chips */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {displaySubjects.map((s) => (
              <SubjectChip
                key={s}
                subjectId={s}
                selected={selectedSubject === s}
                onClick={() =>
                  setSelectedSubject((prev) => (prev === s ? null : s))
                }
              />
            ))}
          </div>

          {!expanded && subjects.length > 6 && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium btn-press"
              style={{ color: 'var(--ink-400)' }}
            >
              <ChevronDown className="h-3 w-3" />
              +{subjects.length - 6} more
            </button>
          )}
          {expanded && subjects.length > 6 && (
            <button
              onClick={() => setExpanded(false)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium btn-press"
              style={{ color: 'var(--ink-400)' }}
            >
              <ChevronUp className="h-3 w-3" />
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-10 mt-5 flex items-center justify-between">
        <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
          {totalCount} question{totalCount !== 1 ? 's' : ''} available
        </span>
        <Link
          href={`/practice/all?mode=free${selectedSubject ? `&subject=${selectedSubject}` : ''}`}
          className="inline-flex items-center gap-2 t-body-sm font-semibold px-5 py-2.5 rounded-[10px] btn-primary focus-ring"
          style={{ background: 'var(--ink-500)', color: '#ffffff' }}
        >
          Start Free Practice
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Subject Drill Card ──────────────────────────────────────────

function SubjectDrillCard({ subjects }: { subjects: LoksewaSubject[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [questionCount, setQuestionCount] = useState<number>(20)

  const questionOptions = [20, 30, 50]

  return (
    <motion.div
      variants={fadeUp}
      className="bento-card p-6 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 80% 20%, var(--gold-400), transparent 60%)',
        }}
      />

      <div className="relative z-10">
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px]"
            style={{ background: 'rgba(232,168,19,0.12)' }}
          >
            <Target className="h-5 w-5" style={{ color: 'var(--gold-400)' }} />
          </div>
          <div>
            <h2 className="t-heading-lg" style={{ color: 'var(--text-primary)' }}>
              Subject Drill
            </h2>
            <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
              Deep dive into one subject
            </p>
          </div>
        </div>

        {/* Subject Selector */}
        <div className="mt-4">
          <label className="t-caption block mb-1.5" style={{ color: 'var(--text-faint)' }}>
            Subject
          </label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger
              className="w-full h-10 rounded-[10px]"
              style={{
                background: 'var(--bg-base)',
                borderColor: 'var(--border-subtle)',
                color: selectedSubject ? 'var(--text-primary)' : 'var(--text-faint)',
              }}
            >
              <SelectValue placeholder="Choose a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => {
                const info = SUBJECT_MAP[s]
                return (
                  <SelectItem key={s} value={s}>
                    {info?.labelEn ?? s}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Question Count Chips */}
        <div className="mt-4">
          <label className="t-caption block mb-1.5" style={{ color: 'var(--text-faint)' }}>
            Questions
          </label>
          <div className="flex gap-2">
            {questionOptions.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={cn(
                  'px-4 py-2 rounded-[10px] t-body-sm font-medium btn-press',
                  'transition-all duration-150 focus-ring border',
                  questionCount === count
                    ? 'text-white border-transparent'
                    : 'border-border-subtle bg-surface hover:border-border-default hover:bg-surface-raised',
                )}
                style={
                  questionCount === count
                    ? { background: 'var(--ink-500)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-10 mt-5">
        <Link
          href={`/practice/all?mode=drill&subject=${selectedSubject}&count=${questionCount}`}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 t-body-sm font-semibold',
            'px-5 py-2.5 rounded-[10px] btn-press transition-all duration-150 focus-ring',
            selectedSubject
              ? 'text-white'
              : 'cursor-not-allowed',
          )}
          style={{
            background: selectedSubject ? 'var(--ink-500)' : 'var(--border-subtle)',
            color: selectedSubject ? '#ffffff' : 'var(--text-faint)',
          }}
          onClick={(e) => {
            if (!selectedSubject) e.preventDefault()
          }}
        >
          <Zap className="h-4 w-4" />
          Start Drill
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Curated Set Card ─────────────────────────────────────────────

function CuratedSetCard({ set }: { set: CuratedSet }) {
  const info = SUBJECT_MAP[set.subjectId]
  const colors = SUBJECT_COLORS[set.subjectId]
  const diffInfo = DIFFICULTY_LABELS[set.difficulty]

  return (
    <Link href={`/practice/${set.id}`} className="group block shrink-0">
      <div
        className="bento-card p-4 flex flex-col justify-between transition-all duration-150 hover:border-border-default"
        style={{ width: 220, height: 140 }}
      >
        {/* Top: badge + difficulty */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] t-caption',
              colors?.bg,
              colors?.text,
            )}
          >
            <BookOpen className="h-3 w-3" />
            {info?.labelEn ?? set.subjectId}
          </span>
          <DifficultyDots difficulty={set.difficulty} />
        </div>

        {/* Middle: name */}
        <div className="mt-auto">
          <h3
            className="t-heading-md truncate group-hover:text-ink-300 transition-colors duration-150"
            style={{ color: 'var(--text-primary)' }}
          >
            {set.name}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="t-mono text-xs" style={{ color: 'var(--text-faint)' }}>
              {set.questionCount} questions
            </span>
            {diffInfo && (
              <span
                className={cn('t-caption px-1.5 py-0.5 rounded', diffInfo.color)}
              >
                {diffInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Curated Sets Row ────────────────────────────────────────────

function CuratedSetsRow() {
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Curated Sets
        </h2>
        <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--gold-400)' }} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {CURATED_SETS.map((set, i) => (
          <CuratedSetCard key={`${set.id}-${i}`} set={set} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Recent Practice Section ──────────────────────────────────────

function RecentPracticeSection({
  recentPractice,
}: {
  recentPractice: RecentPractice[]
}) {
  if (recentPractice.length === 0) {
    return (
      <motion.div variants={fadeUp}>
        <h2 className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>
          Continue where you left off
        </h2>

        <div
          className="bento-card p-8 flex flex-col items-center justify-center text-center"
        >
          <History className="h-10 w-10 mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
            No recent practice sessions
          </p>
          <p className="t-caption mt-1" style={{ color: 'var(--text-faint)' }}>
            Start a practice session and it will appear here
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp}>
      <h2 className="t-heading-sm mb-4" style={{ color: 'var(--text-faint)' }}>
        Continue where you left off
      </h2>

      <div className="space-y-2">
        {recentPractice.slice(0, 3).map((rp) => {
          const info = SUBJECT_MAP[rp.subjectId]
          const colors = SUBJECT_COLORS[rp.subjectId]
          return (
            <Link key={rp.id} href={`/practice/${rp.subjectId}?resume=${rp.questionIndex}`}>
              <div
                className="bento-card p-4 flex items-center justify-between group transition-all duration-150 hover:border-border-default btn-press"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[8px]',
                      colors?.bg,
                      colors?.text,
                    )}
                  >
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="t-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {info?.labelEn ?? rp.subjectId}
                    </p>
                    <p className="t-caption" style={{ color: 'var(--text-faint)' }}>
                      Question {rp.questionIndex + 1} of {rp.totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="t-mono text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(((rp.questionIndex + 1) / rp.totalQuestions) * 100)}%
                  </span>
                  <span
                    className="inline-flex items-center gap-1 t-body-sm font-medium"
                    style={{ color: 'var(--ink-400)' }}
                  >
                    Resume
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Practice Page ──────────────────────────────────────────

export default function PracticePage() {
  const { isReady } = useDB()
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({})
  const [recentPractice] = useState<RecentPractice[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('akal_recent_practice')
      if (stored) {
        const parsed: RecentPractice[] = JSON.parse(stored)
        return parsed.sort((a, b) => b.updatedAt - a.updatedAt)
      }
    } catch {
      // Ignore localStorage errors
    }
    return []
  })

  useEffect(() => {
    if (!isReady) return
    LOKSEWA_SUBJECTS.forEach(async (s) => {
      const count = await getQuestionCountBySubject(s.id)
      setSubjectCounts((prev) => ({ ...prev, [s.id]: count }))
    })
  }, [isReady])

  const subjectsWithQuestions = useMemo(() => {
    return LOKSEWA_SUBJECTS.filter((s) => (subjectCounts[s.id] ?? 0) > 0).map((s) => s.id)
  }, [subjectCounts])

  if (!isReady) return <PracticeSkeleton />

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>
          Practice
        </h1>
        <p className="t-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Choose how you want to practice.
        </p>
      </motion.div>

      {/* ── Two Mode Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3">
          <FreePracticeCard
            subjects={subjectsWithQuestions}
            subjectCounts={subjectCounts}
          />
        </div>
        <div className="md:col-span-2">
          <SubjectDrillCard subjects={LOKSEWA_SUBJECTS.map((s) => s.id)} />
        </div>
      </div>

      {/* ── Curated Sets ── */}
      <CuratedSetsRow />

      {/* ── Recent Practice ── */}
      <RecentPracticeSection recentPractice={recentPractice} />
    </motion.div>
  )
}
