'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useUserContext } from '@/contexts/UserContext'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { LOKSEWA_SUBJECTS, SUBJECT_MAP, SUBJECT_COLORS } from '@/lib/constants'
import type { LoksewaSubject } from '@/types/question'
import { cn } from '@/lib/utils'

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

// ─── Types ────────────────────────────────────────────────────────

interface WeekBlock {
  weekNumber: number
  startDate: Date
  endDate: Date
  plannedQuestions: number
  status: 'past' | 'current' | 'future'
  completedQuestions: number
}

interface DayPlan {
  date: Date
  dayOfWeek: string
  subject: LoksewaSubject
  questionCount: number
  timeEstimate: string
  status: 'past-met' | 'past-missed' | 'today' | 'future'
}

interface SubjectCoverage {
  subjectId: LoksewaSubject
  label: string
  labelEn: string
  color: string
  totalQuestionsNeeded: number
  questionsCompleted: number
  progressPercent: number
  status: 'on-track' | 'behind' | 'ahead'
}

// ─── Helpers ──────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDayName(date: Date): string {
  return DAY_LABELS[date.getDay()]
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatShortDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`
}

/** Assign higher weight to weaker subjects. Weakest gets ~2x, strongest gets ~0.7x */
function computeSubjectWeights(
  weakestSubject: LoksewaSubject | null,
  strongestSubject: LoksewaSubject | null,
): Record<LoksewaSubject, number> {
  const subjects = LOKSEWA_SUBJECTS.map((s) => s.id)
  return Object.fromEntries(
    subjects.map((s) => {
      let weight = 1
      if (s === weakestSubject) weight = 2
      else if (s === strongestSubject) weight = 0.7
      else weight = 0.85 + Math.random() * 0.3 // slight variation for natural distribution
      return [s, weight]
    }),
  ) as Record<LoksewaSubject, number>
}

function distributeQuestionsPerWeek(
  totalQuestionsPerWeek: number,
  weights: Record<LoksewaSubject, number>,
): Record<LoksewaSubject, number> {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const distribution: Record<string, number> = {}

  let allocated = 0
  const subjects = Object.keys(weights)

  subjects.forEach((s, i) => {
    if (i === subjects.length - 1) {
      // Last subject gets the remainder
      distribution[s] = Math.max(1, totalQuestionsPerWeek - allocated)
    } else {
      const share = Math.round((weights[s as LoksewaSubject] / totalWeight) * totalQuestionsPerWeek)
      distribution[s] = Math.max(1, share)
      allocated += distribution[s]
    }
  })

  return distribution as Record<LoksewaSubject, number>
}

function pickSubjectForDay(
  dayIndex: number,
  weeklyDistribution: Record<LoksewaSubject, number>,
): LoksewaSubject {
  // Cycle through subjects based on day index, weighted by distribution
  const subjects: LoksewaSubject[] = []
  Object.entries(weeklyDistribution).forEach(([s, count]) => {
    for (let i = 0; i < count; i++) {
      subjects.push(s as LoksewaSubject)
    }
  })

  // Shuffle subjects with dayIndex as seed for consistent results per week
  const seed = dayIndex
  const index = seed % subjects.length
  return subjects[index] || 'general-knowledge'
}

function computeTimeEstimate(questionCount: number): string {
  // ~1.5 minutes per question
  const totalMinutes = Math.round(questionCount * 1.5)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// ─── No Exam Date CTA ─────────────────────────────────────────────

function NoExamDateCTA() {
  return (
    <motion.div variants={fadeUp}>
      <div
        className="bento-card p-8 flex flex-col items-center justify-center text-center gap-4"
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-[16px]"
          style={{ background: 'rgba(232,168,19,0.12)' }}
        >
          <Calendar className="h-8 w-8" style={{ color: 'var(--gold-400)' }} />
        </div>
        <div>
          <h2
            className="t-heading-lg mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Set Your Exam Date
          </h2>
          <p
            className="t-body-sm max-w-md"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Set your target exam date in Profile to generate a personalized study plan
            tailored to your remaining preparation time.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 t-body-sm font-semibold px-5 py-2.5 rounded-[10px] btn-primary focus-ring"
          style={{ background: 'var(--ink-500)', color: '#ffffff' }}
        >
          <Calendar className="h-4 w-4" />
          Set Exam Date
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Timeline Week Block ───────────────────────────────────────────

function TimelineWeekBlock({ week, isCompact }: { week: WeekBlock; isCompact: boolean }) {
  const isCurrent = week.status === 'current'
  const isPast = week.status === 'past'
  const isCompleted = isPast && week.completedQuestions >= week.plannedQuestions

  return (
    <div
      className={cn(
        'bento-card shrink-0 flex flex-col items-center justify-between text-center transition-all duration-150',
        isCurrent && 'border-gold-400/60',
        isPast && !isCurrent && 'opacity-50',
        !isPast && !isCurrent && 'opacity-60',
      )}
      style={{
        width: isCompact ? 140 : 160,
        height: isCompact ? 110 : 130,
        borderColor: isCurrent ? 'var(--gold-400)' : undefined,
        boxShadow: isCurrent ? '0 0 12px rgba(232,168,19,0.15)' : undefined,
      }}
    >
      <div>
        <p
          className={cn(
            't-caption font-semibold',
            isCurrent ? 'text-gold-400' : 'text-[var(--text-faint)]',
          )}
        >
          Week {week.weekNumber}
        </p>
        <p className="t-mono text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {formatShortDate(week.startDate)}–{formatShortDate(week.endDate)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="t-heading-sm" style={{ color: 'var(--text-primary)' }}>
          {week.plannedQuestions}
        </p>
        <p className="t-caption" style={{ color: 'var(--text-faint)' }}>questions</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : isPast ? (
          <AlertCircle className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
        ) : (
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: isCurrent ? 'var(--gold-400)' : 'var(--border-subtle)',
              background: isCurrent ? 'rgba(232,168,19,0.1)' : 'transparent',
            }}
          >
            {isCurrent && <div className="w-2 h-2 rounded-full bg-gold-400" />}
          </div>
        )}
        {/* Mini progress bar */}
        {isPast && (
          <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (week.completedQuestions / week.plannedQuestions) * 100)}%`,
                backgroundColor: isCompleted ? 'var(--green-400)' : 'var(--gold-400)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Timeline Section ────────────────────────────────────────────

function TimelineSection({ weeks }: { weeks: WeekBlock[] }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4" style={{ color: 'var(--gold-400)' }} />
        <h2 className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Preparation Timeline
        </h2>
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-3">
        {weeks.map((week) => (
          <TimelineWeekBlock key={week.weekNumber} week={week} isCompact />
        ))}
      </div>

      {/* Desktop: horizontal scrollable */}
      <div
        className="hidden md:flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {weeks.map((week) => (
          <TimelineWeekBlock key={week.weekNumber} week={week} isCompact={false} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Day Card ─────────────────────────────────────────────────────

function DayCard({ day }: { day: DayPlan }) {
  const info = SUBJECT_MAP[day.subject]
  const colors = SUBJECT_COLORS[day.subject]
  const isToday = day.status === 'today'
  const isPastMet = day.status === 'past-met'
  const isPastMissed = day.status === 'past-missed'
  const isFuture = day.status === 'future'

  return (
    <div
      className={cn(
        'bento-card p-4 flex flex-col gap-2 transition-all duration-150',
        isToday && 'border-gold-400/60',
        (isPastMet || isPastMissed) && 'opacity-60',
        isFuture && 'opacity-55',
      )}
      style={{
        borderColor: isToday ? 'var(--gold-400)' : undefined,
        boxShadow: isToday ? '0 0 12px rgba(232,168,19,0.15)' : undefined,
        minWidth: 150,
      }}
    >
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              't-caption font-semibold',
              isToday ? 'text-gold-400' : 'text-[var(--text-faint)]',
            )}
          >
            {day.dayOfWeek}
          </p>
          <p className="t-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {day.date.getDate()}/{day.date.getMonth() + 1}
          </p>
        </div>
        {isPastMet && <CheckCircle2 className="h-4 w-4 text-green-400" />}
        {isPastMissed && <AlertCircle className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />}
        {isToday && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400/15">
            <div className="h-2 w-2 rounded-full bg-gold-400" />
          </div>
        )}
      </div>

      {/* Subject */}
      {info && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center justify-center h-6 w-6 rounded-[6px] text-[10px]',
              colors?.bg,
              colors?.text,
            )}
          >
            <BookOpen className="h-3 w-3" />
          </span>
          <p className="t-body-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {info.labelEn}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mt-auto">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" style={{ color: 'var(--text-faint)' }} />
          <span className="t-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {day.questionCount} Q
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" style={{ color: 'var(--text-faint)' }} />
          <span className="t-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {day.timeEstimate}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── This Week's Plan Section ─────────────────────────────────────

function ThisWeekSection({ days }: { days: DayPlan[] }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4" style={{ color: 'var(--ink-400)' }} />
        <h2 className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          This Week&apos;s Plan
        </h2>
        <span className="t-caption ml-auto" style={{ color: 'var(--text-faint)' }}>
          {formatShortDate(days[0]?.date)} – {formatShortDate(days[days.length - 1]?.date)}
        </span>
      </div>

      {/* Mobile: horizontal scroll row */}
      <div
        className="md:hidden flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {days.map((day) => (
          <DayCard key={day.date.toISOString()} day={day} />
        ))}
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {days.map((day) => (
          <DayCard key={day.date.toISOString()} day={day} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Subject Coverage Section ─────────────────────────────────────

function SubjectCoverageTracker({ coverage }: { coverage: SubjectCoverage[] }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4" style={{ color: 'var(--ink-400)' }} />
        <h2 className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Subject Coverage Tracker
        </h2>
        <span className="t-caption ml-auto" style={{ color: 'var(--text-faint)' }}>
          {coverage.length} subjects
        </span>
      </div>

      <div
        className="bento-card overflow-hidden"
      >
        <div className="overflow-y-auto max-h-[420px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left px-4 py-2.5 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>
                  Subject
                </th>
                <th className="text-left px-4 py-2.5 t-caption font-medium hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>
                  Progress
                </th>
                <th className="text-center px-4 py-2.5 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>
                  Questions
                </th>
                <th className="text-center px-4 py-2.5 t-caption font-medium" style={{ color: 'var(--text-faint)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((item) => {
                const statusConfig = {
                  'on-track': { label: 'On Track', className: 'text-green-400 bg-green-500/15' },
                  'behind': { label: 'Behind', className: 'text-amber-400 bg-amber-500/15' },
                  'ahead': { label: 'Ahead', className: 'text-gold-400 bg-gold-500/15' },
                }[item.status]

                return (
                  <tr
                    key={item.subjectId}
                    className="border-b border-[var(--border-subtle)] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center h-7 w-7 rounded-[8px] text-[10px] shrink-0',
                            SUBJECT_COLORS[item.subjectId]?.bg,
                            SUBJECT_COLORS[item.subjectId]?.text,
                          )}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="t-body-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {item.labelEn}
                          </p>
                          <p className="t-caption truncate hidden lg:block" style={{ color: 'var(--text-faint)' }}>
                            {item.label}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-20 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-raised)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, item.progressPercent)}%`,
                              backgroundColor: item.status === 'on-track'
                                ? 'var(--green-400)'
                                : item.status === 'ahead'
                                  ? 'var(--gold-400)'
                                  : 'var(--amber-400)',
                            }}
                          />
                        </div>
                        <span className="t-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          {Math.min(100, item.progressPercent)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="t-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.questionsCompleted}
                        </span>
                        <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
                          / {item.totalQuestionsNeeded}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-[8px] t-caption font-medium',
                          statusConfig.className,
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Study Plan Summary Stats ─────────────────────────────────────

function SummaryStats({
  daysToExam,
  questionsPerDay,
  totalQuestions,
  weeksCount,
}: {
  daysToExam: number
  questionsPerDay: number
  totalQuestions: number
  weeksCount: number
}) {
  const stats = [
    {
      icon: Calendar,
      label: 'Days to Exam',
      value: String(daysToExam),
      color: 'var(--gold-400)',
    },
    {
      icon: Target,
      label: 'Daily Target',
      value: `${questionsPerDay} Q`,
      color: 'var(--ink-400)',
    },
    {
      icon: Zap,
      label: 'Total Questions',
      value: String(totalQuestions),
      color: 'var(--green-400)',
    },
    {
      icon: Clock,
      label: 'Study Weeks',
      value: String(weeksCount),
      color: 'var(--ink-300)',
    },
  ]

  return (
    <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bento-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
              {stat.label}
            </span>
          </div>
          <p className="t-heading-lg" style={{ color: 'var(--text-primary)' }}>
            {stat.value}
          </p>
        </div>
      ))}
    </motion.div>
  )
}

// ─── Main Study Plan Page ─────────────────────────────────────────

export default function StudyPlanPage() {
  const { daysToExam, weakestSubject, strongestSubject, firstName } = useUserContext()
  const user = useAuthStore((s) => s.user)

  const questionsPerDay = user?.preferences?.defaultQuestionCount ?? 20
  const hasExamDate = daysToExam > 0

  // ── Generate Study Plan ──
  const planData = useMemo(() => {
    if (!hasExamDate || daysToExam === 0) return null

    const totalQuestions = daysToExam * questionsPerDay
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weights = computeSubjectWeights(weakestSubject, strongestSubject)

    // Generate weeks
    const totalWeeks = Math.max(1, Math.ceil(daysToExam / 7))
    const weeks: WeekBlock[] = []
    const mondayOfToday = getMonday(today)

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = addDays(mondayOfToday, w * 7)
      const weekEnd = addDays(weekStart, 6)

      // If weekEnd is past the exam date, clamp
      const examDate = addDays(today, daysToExam)
      if (weekStart > examDate) break

      const clampedEnd = weekEnd > examDate ? examDate : weekEnd
      const daysInWeek = Math.max(1, Math.ceil((clampedEnd.getTime() - weekStart.getTime()) / 86400000) + 1)
      const plannedQuestions = Math.round(daysInWeek * questionsPerDay)

      let status: 'past' | 'current' | 'future' = 'future'
      if (weekEnd < today) status = 'past'
      else if (weekStart <= today && weekEnd >= today) status = 'current'

      // Simulate completed questions for past weeks (random for demo)
      const completedQuestions = status === 'past'
        ? Math.round(plannedQuestions * (0.6 + Math.random() * 0.45))
        : status === 'current'
          ? Math.round(plannedQuestions * (0.1 + Math.random() * 0.5))
          : 0

      weeks.push({
        weekNumber: w + 1,
        startDate: weekStart,
        endDate: clampedEnd,
        plannedQuestions,
        status,
        completedQuestions: Math.min(completedQuestions, plannedQuestions),
      })
    }

    // Generate this week's daily plan
    const currentWeekStart = getMonday(today)
    const weeklyDistribution = distributeQuestionsPerWeek(questionsPerDay * 7, weights)
    const days: DayPlan[] = []

    // Create a rotating subject schedule for the 7 days
    const subjectCycle = Object.keys(weeklyDistribution) as LoksewaSubject[]
    const questionsPerSubject = Object.entries(weeklyDistribution) as [LoksewaSubject, number][]

    for (let d = 0; d < 7; d++) {
      const date = addDays(currentWeekStart, d)
      const questionShare = Math.round(questionsPerDay)

      let status: DayPlan['status'] = 'future'
      if (isSameDay(date, today)) status = 'today'
      else if (date < today) {
        // Randomly assign met or missed for demo
        status = Math.random() > 0.3 ? 'past-met' : 'past-missed'
      }

      // Cycle through subjects deterministically
      const subjectIndex = d % subjectCycle.length
      const subject = subjectCycle[subjectIndex]

      days.push({
        date,
        dayOfWeek: getDayName(date),
        subject,
        questionCount: questionShare,
        timeEstimate: computeTimeEstimate(questionShare),
        status,
      })
    }

    // Generate subject coverage
    const subjectCoverage: SubjectCoverage[] = LOKSEWA_SUBJECTS.map((s) => {
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
      const subjectWeight = weights[s.id]
      const totalQuestionsNeeded = Math.round((subjectWeight / totalWeight) * totalQuestions)

      // Simulated completed count for demo
      const daysElapsed = Math.min(daysToExam, Math.max(0, Math.floor(Math.random() * daysToExam * 0.4)))
      const expectedByNow = Math.round((daysElapsed / daysToExam) * totalQuestionsNeeded)
      const questionsCompleted = Math.round(expectedByNow * (0.7 + Math.random() * 0.5))
      const progressPercent = totalQuestionsNeeded > 0
        ? Math.round((Math.min(questionsCompleted, totalQuestionsNeeded) / totalQuestionsNeeded) * 100)
        : 0

      let status: SubjectCoverage['status'] = 'on-track'
      const ratio = daysElapsed > 0 ? questionsCompleted / expectedByNow : 1
      if (ratio >= 1.15) status = 'ahead'
      else if (ratio < 0.85) status = 'behind'

      return {
        subjectId: s.id,
        label: s.label,
        labelEn: s.labelEn,
        color: s.color,
        totalQuestionsNeeded,
        questionsCompleted: Math.min(questionsCompleted, totalQuestionsNeeded),
        progressPercent,
        status,
      }
    })

    return { weeks, days, subjectCoverage, totalQuestions, totalWeeks }
  }, [hasExamDate, daysToExam, questionsPerDay, weakestSubject, strongestSubject])

  // ── Render ──
  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Study Plan"
          subtitle={
            hasExamDate
              ? `Based on your ${daysToExam} days to exam, ${firstName}`
              : 'Set your exam date in Profile'
          }
        />
      </motion.div>

      {/* No Exam Date — show CTA */}
      {!hasExamDate && <NoExamDateCTA />}

      {/* Has Exam Date — show full plan */}
      {hasExamDate && planData && (
        <>
          {/* Summary Stats */}
          <SummaryStats
            daysToExam={daysToExam}
            questionsPerDay={questionsPerDay}
            totalQuestions={planData.totalQuestions}
            weeksCount={planData.totalWeeks}
          />

          {/* Section 1: Timeline */}
          <TimelineSection weeks={planData.weeks} />

          {/* Section 2: This Week's Plan */}
          <ThisWeekSection days={planData.days} />

          {/* Section 3: Subject Coverage */}
          <SubjectCoverageTracker coverage={planData.subjectCoverage} />
        </>
      )}
    </motion.div>
  )
}
