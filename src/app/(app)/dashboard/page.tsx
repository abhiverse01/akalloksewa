'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDB } from '@/hooks/useDB'
import { initDB } from '@/lib/db/schema'
import { SUBJECT_MAP } from '@/lib/constants'
import { EXAM_TARGETS } from '@/types/auth'
import type { TestSession } from '@/types/test'
import type { ExamTarget } from '@/types/auth'
import { cn } from '@/lib/utils'
import {
  Flame,
  Play,
  Zap,
  Trophy,
  Target,
  ArrowRight,
  Settings,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  BookOpen,
  Medal,
  Shield,
  ClipboardList,
  Map,
  StickyNote,
} from 'lucide-react'

// ─── Animation Variants ─────────────────────────────────────────────

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ─── Helpers ─────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour <= 11) return 'Good morning'
  if (hour >= 12 && hour <= 17) return 'Good afternoon'
  if (hour >= 18 && hour <= 23) return 'Good evening'
  return 'Still at it'
}

function getFirstName(displayName: string): string {
  return displayName.split(' ')[0]
}

function getDaysSince(timestamp: number): number {
  if (!timestamp) return Infinity
  const now = new Date()
  const then = new Date(timestamp)
  now.setHours(0, 0, 0, 0)
  then.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type StreakState = 'active' | 'at-risk' | 'broken'

function getStreakState(lastPracticeDate: number, currentStreak: number): StreakState {
  if (currentStreak > 0 && getDaysSince(lastPracticeDate) === 0) return 'active'
  if (lastPracticeDate > 0 && getDaysSince(lastPracticeDate) === 1) return 'at-risk'
  return 'broken'
}

function getWeakestSubject(subjectAccuracy: Record<string, number>): string {
  let weakest = 'General Knowledge'
  let lowest = Infinity
  for (const [subject, accuracy] of Object.entries(subjectAccuracy)) {
    if (accuracy < lowest) {
      lowest = accuracy
      const info = SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP]
      weakest = info?.labelEn ?? subject
    }
  }
  return weakest
}

function getWeakAreas(subjectAccuracy: Record<string, number>): { subject: string; accuracy: number }[] {
  const entries = Object.entries(subjectAccuracy)
    .map(([subject, accuracy]) => {
      const info = SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP]
      return { subject: info?.labelEn ?? subject, accuracy }
    })
    .sort((a, b) => a.accuracy - b.accuracy)
  return entries.slice(0, 2)
}

function getExamLabel(targetExam?: ExamTarget): string {
  if (!targetExam) return 'the exam'
  const found = EXAM_TARGETS.find((e) => e.value === targetExam)
  return found ? found.label : 'the exam'
}

// ─── Skeleton ───────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bento-card animate-pulse col-span-1 md:col-span-4"
            style={{
              height: i < 3 ? 190 : 230,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Inline Card Components ────────────────────────────────────────

function GreetingCard({
  firstName,
  streakState,
  currentStreak,
  totalQuestions,
  totalTests,
  hasTargetDate,
  daysRemaining,
  examLabel,
  todaysPracticeCount = 0,
  hasActiveTest = false,
  activeTest,
}: {
  firstName: string
  streakState: StreakState
  currentStreak: number
  totalQuestions: number
  totalTests: number
  hasTargetDate: boolean
  daysRemaining: number | null
  examLabel: string
  todaysPracticeCount?: number
  hasActiveTest?: boolean
  activeTest?: TestSession
}) {
  const greeting = getGreeting()

  const motivationLine = useMemo(() => {
    if (totalTests === 0 && totalQuestions === 0) return 'Start your first question to begin your journey.'
    if (totalTests === 0) return 'Practice is building your foundation. Ready for a test?'
    if (streakState === 'active' && currentStreak >= 7) return `${currentStreak}-day streak. You're on fire!`
    if (streakState === 'active') return `You're on a ${currentStreak}-day streak. Keep the momentum!`
    if (streakState === 'at-risk') return 'Practice today to keep your streak alive!'
    if (totalQuestions > 100) return `${totalQuestions} questions deep. The data is on your side.`
    return 'Every question counts. Start where you left off.'
  }, [streakState, currentStreak, totalTests, totalQuestions])

  const subtext = useMemo(() => {
    const parts: string[] = []
    if (totalQuestions > 0) parts.push(`${totalQuestions.toLocaleString()} questions attempted`)
    if (totalTests > 0) parts.push(`${totalTests} tests completed`)
    if (hasTargetDate && daysRemaining !== null) parts.push(`${daysRemaining} days to ${examLabel}`)
    return parts.join(' · ')
  }, [totalQuestions, totalTests, hasTargetDate, daysRemaining, examLabel])

  return (
    <motion.div
      variants={fadeUp}
      className="bento-card p-6 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Subtle decorative gradient */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, var(--ink-400), transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <p className="t-display-xl" style={{ color: 'var(--text-primary)' }}>
          {greeting},<br />
          <span style={{ color: 'var(--gold-400)' }}>{firstName}</span>.
        </p>
        <p className="t-body mt-3" style={{ color: 'var(--text-secondary)' }}>
          {motivationLine}
        </p>
      </div>

      {/* ── Desktop stats pills ── */}
      <div className="relative z-10 mt-5 flex items-center gap-2">
        {totalQuestions > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'var(--bg-base)' }}>
            <BookOpen size={13} style={{ color: 'var(--text-faint)' }} />
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              {totalQuestions.toLocaleString()} Q&apos;s
            </span>
          </div>
        )}
        {totalTests > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'var(--bg-base)' }}>
            <BarChart3 size={13} style={{ color: 'var(--text-faint)' }} />
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              {totalTests} tests
            </span>
          </div>
        )}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(232,168,19,0.1)' }}>
            <Flame size={13} style={{ color: 'var(--gold-400)' }} />
            <span className="t-caption" style={{ color: 'var(--gold-400)' }}>
              {currentStreak}
            </span>
          </div>
        )}
      </div>

      {/* ── Mobile-only: Exam countdown + daily goal + quick action ── */}
      <div className="relative z-10 mt-4 md:hidden space-y-3">
        {/* Exam countdown pill */}
        {hasTargetDate && daysRemaining !== null && (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} style={{ color: 'var(--gold-400)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--gold-400)' }}>
              {daysRemaining} days to {examLabel}
            </span>
          </div>
        )}

        {/* Daily goal progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {todaysPracticeCount} / 20 questions today
            </span>
            <span className="text-xs" style={{ color: todaysPracticeCount >= 20 ? 'var(--green-400)' : 'var(--text-faint)' }}>
              {todaysPracticeCount >= 20 ? 'Goal met! 🎉' : `${Math.min(todaysPracticeCount * 5, 100)}%`}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todaysPracticeCount / 20) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: todaysPracticeCount >= 20 ? 'var(--green-400)' : 'var(--gold-400)' }}
            />
          </div>
        </div>

        {/* Quick action button */}
        <Link
          href={hasActiveTest ? '/test' : '/practice'}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm transition-colors btn-press"
          style={{
            background: hasActiveTest ? 'rgba(232,168,19,0.15)' : 'var(--ink-800)',
            border: hasActiveTest ? '1px solid rgba(232,168,19,0.3)' : '1px solid var(--border-subtle)',
            color: hasActiveTest ? 'var(--gold-400)' : 'var(--text-primary)',
          }}
        >
          {hasActiveTest ? (
            <>
              <Play size={15} />
              Continue
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              <Zap size={15} />
              Practice Now
              <ArrowRight size={14} />
            </>
          )}
        </Link>
      </div>
    </motion.div>
  )
}

function StreakCard({
  currentStreak,
  longestStreak,
  lastPracticeDate,
}: {
  currentStreak: number
  longestStreak: number
  lastPracticeDate: number
}) {
  const state = getStreakState(lastPracticeDate, currentStreak)
  const today = (new Date().getDay() + 6) % 7 // Mon=0

  const badge = useMemo(() => {
    if (currentStreak >= 30) return { label: 'Committed Aspirant', goldRing: true }
    if (currentStreak >= 7) return { label: 'Weekly Warrior', goldRing: false }
    return null
  }, [currentStreak])

  return (
    <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center">
      {/* Streak number */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStreak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="t-display-xl"
            style={{ color: state === 'active' ? 'var(--gold-400)' : 'var(--text-tertiary)' }}
          >
            {state === 'active' ? '🔥' : '⏳'} {currentStreak}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
        {state === 'active'
          ? 'Day streak'
          : state === 'at-risk'
            ? 'Streak at risk!'
            : currentStreak === 0
              ? 'Start your streak today'
              : 'Day streak'}
      </p>

      {/* At-risk warning */}
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

      {/* 7 day dots */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-1.5 mt-4">
          {DAY_LABELS.map((label, i) => {
            const isActive = i <= today && i >= (today - currentStreak + 1)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="size-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--gold-400)' : 'var(--border-subtle)',
                  }}
                />
                <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 px-2 py-0.5 rounded-full t-caption',
          )}
          style={{
            color: 'var(--gold-400)',
            background: badge.goldRing ? 'rgba(232,168,19,0.15)' : 'rgba(232,168,19,0.08)',
            boxShadow: badge.goldRing ? '0 0 0 1.5px var(--gold-400)' : 'none',
          }}
        >
          {badge.goldRing && <Medal size={10} />}
          {badge.label}
        </div>
      )}

      {/* Encouragement for low streak */}
      {currentStreak > 0 && currentStreak < 7 && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Keep going!
        </p>
      )}

      {/* Personal best */}
      {longestStreak > currentStreak && currentStreak > 0 && (
        <p className="t-caption mt-2" style={{ color: 'var(--text-faint)' }}>
          Personal best: {longestStreak}
        </p>
      )}

      {/* Motivational micro-copy for streaks */}
      {currentStreak >= 30 && (
        <p className="text-xs mt-2" style={{ color: 'var(--gold-300)', fontFamily: 'var(--font-fraunces), Georgia, serif', fontStyle: 'italic' }}>
          One month of dedication. Respect.
        </p>
      )}
      {currentStreak >= 14 && currentStreak < 30 && (
        <p className="text-xs mt-2" style={{ color: 'var(--gold-300)', fontFamily: 'var(--font-fraunces), Georgia, serif', fontStyle: 'italic' }}>
          Two weeks strong. This is becoming a habit.
        </p>
      )}
      {currentStreak >= 7 && currentStreak < 14 && (
        <p className="text-xs mt-2" style={{ color: 'var(--gold-300)', fontFamily: 'var(--font-fraunces), Georgia, serif', fontStyle: 'italic' }}>
          Weekly Warrior! Consistency is your superpower.
        </p>
      )}
    </motion.div>
  )
}

function QuickTestCard({
  hasActiveTest,
  activeTest,
  weakestSubject,
}: {
  hasActiveTest: boolean
  activeTest?: TestSession
  weakestSubject: string
}) {
  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-md" style={{ color: 'var(--text-primary)' }}>
        Quick Actions
      </p>

      <div className="mt-4 space-y-2.5">
        {/* Continue Test */}
        <AnimatePresence>
          {hasActiveTest && activeTest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Link
                href="/test"
                className="flex items-center justify-between p-3 rounded-lg transition-colors btn-press"
                style={{
                  background: 'rgba(232,168,19,0.12)',
                  border: '1px solid rgba(232,168,19,0.25)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Play size={16} style={{ color: 'var(--gold-400)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--gold-300)' }}>
                      Continue Test
                    </p>
                    <p className="text-xs" style={{ color: 'var(--gold-400)', opacity: 0.7 }}>
                      {activeTest.config.name} · {activeTest.questions.length} Q&apos;s
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--gold-400)' }} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Practice */}
        <Link
          href="/practice"
          className="flex items-center justify-between p-3 rounded-lg transition-colors btn-press"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Zap size={16} style={{ color: 'var(--ink-400)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Practice 20 Questions
              </p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {weakestSubject}
              </p>
            </div>
          </div>
          <span
            className="text-sm font-medium btn-press"
            style={{ color: 'var(--ink-500)' }}
          >
            Start →
          </span>
        </Link>

        {/* Daily Challenge */}
        <Link
          href="/practice?mode=daily"
          className="flex items-center justify-between p-3 rounded-lg transition-colors btn-press"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Trophy size={16} style={{ color: 'var(--ink-400)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Daily Challenge
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  Today&apos;s 10-Question Challenge
                </p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(37,64,160,0.1)',
                    color: 'var(--ink-300)',
                  }}
                >
                  ~8 min
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
        </Link>
      </div>
    </motion.div>
  )
}

function SubjectRadarCard({ subjectAccuracy }: { subjectAccuracy: Record<string, number> }) {
  const chartData = useMemo(() => {
    const entries = Object.entries(subjectAccuracy)
    if (entries.length < 3) return null
    return entries
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
  }, [subjectAccuracy])

  // We use a simple SVG-based radar since we need to keep inline
  // For now render a simplified bar version if chartData exists, else empty state
  if (!chartData) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 220 }}>
        <Target size={32} style={{ color: 'var(--text-faint)' }} />
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-faint)' }}>
          Need 3+ subjects with data
        </p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
          Practice more questions to unlock your radar
        </p>
      </motion.div>
    )
  }

  const maxValue = 100
  const centerX = 100
  const centerY = 100
  const radius = 75
  const levels = 5

  // Generate radar polygon points
  const angleStep = (2 * Math.PI) / chartData.length
  const dataPoints = chartData.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (d.accuracy / maxValue) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    }
  })

  const gridLines = Array.from({ length: levels }, (_, level) => {
    const r = (radius * (level + 1)) / levels
    const points = chartData.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`
    }).join(' ')
    return points
  })

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  const labelPositions = chartData.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2
    return {
      x: centerX + (radius + 18) * Math.cos(angle),
      y: centerY + (radius + 18) * Math.sin(angle),
    }
  })

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
        Subject Radar
      </p>
      <div className="flex justify-center mt-2">
        <svg viewBox="0 0 200 200" width="200" height="200">
          {/* Grid rings */}
          {gridLines.map((points, i) => (
            <polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="0.5"
            />
          ))}
          {/* Axis lines */}
          {chartData.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2
            const x2 = centerX + radius * Math.cos(angle)
            const y2 = centerY + radius * Math.sin(angle)
            return (
              <line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="var(--border-subtle)"
                strokeWidth="0.5"
              />
            )
          })}
          {/* Data fill */}
          <motion.polygon
            points={dataPolygon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            fill="rgba(51, 88, 196, 0.15)"
            stroke="var(--ink-400)"
            strokeWidth="1.5"
            style={{ transformOrigin: '100px 100px' }}
          />
          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="var(--ink-400)"
            />
          ))}
          {/* Labels */}
          {labelPositions.map((pos, i) => (
            <text
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-faint)"
              fontSize="8"
            >
              {chartData[i].subject}
            </text>
          ))}
        </svg>
      </div>
    </motion.div>
  )
}

function ScoreTrendCard({ testSessions }: { testSessions: TestSession[] }) {
  const data = useMemo(() => {
    const completed = testSessions
      .filter((t) => t.status === 'completed' && t.score)
      .sort((a, b) => a.startedAt - b.startedAt)
      .slice(-10)
    return completed.map((t, i) => ({
      label: `T${i + 1}`,
      score: t.score!.percentage,
      correct: t.score!.correct,
      total: t.score!.total,
    }))
  }, [testSessions])

  if (data.length < 2) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 220 }}>
        <TrendingUp size={32} style={{ color: 'var(--text-faint)' }} />
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-faint)' }}>
          Complete 2+ tests to see trends
        </p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
          Your score progression will appear here
        </p>
      </motion.div>
    )
  }

  const maxScore = 100
  const chartWidth = 100
  const chartHeight = 60
  const padding = { top: 5, right: 5, bottom: 20, left: 5 }
  const plotW = chartWidth - padding.left - padding.right
  const plotH = chartHeight - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2)
    const y = padding.top + plotH - (d.score / maxScore) * plotH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + plotH} L${points[0].x},${padding.top + plotH} Z`

  // Reference lines at 60%, 80%
  const refLines = [
    { pct: 60, label: '60%' },
    { pct: 80, label: '80%' },
  ]

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Score Trend
        </p>
        {data.length > 0 && (
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
            Last {data.length} tests
          </span>
        )}
      </div>

      <div className="relative" style={{ height: 160 }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ink-400)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--ink-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Reference lines */}
          {refLines.map((ref) => {
            const y = padding.top + plotH - (ref.pct / maxScore) * plotH
            return (
              <g key={ref.label}>
                <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="var(--border-subtle)" strokeWidth="0.3" strokeDasharray="2 2" />
                <text x={padding.left + plotW + 1} y={y + 1} fill="var(--text-faint)" fontSize="3" dominantBaseline="middle">
                  {ref.label}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#scoreGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--ink-400)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="var(--ink-400)"
              initial={{ r: 0 }}
              animate={{ r: 1.5 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            />
          ))}
        </svg>

        {/* Labels below SVG */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {points.map((p, i) => (
            <div key={i} className="flex flex-col items-center" style={{ width: `${100 / points.length}%` }}>
              <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest score highlight */}
      {data.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Latest</span>
            <span
              className="text-sm font-semibold"
              style={{
                color: data[data.length - 1].score >= 60 ? 'var(--green-400)' : 'var(--red-400)',
              }}
            >
              {data[data.length - 1].score}%
            </span>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              ({data[data.length - 1].correct}/{data[data.length - 1].total})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {data.length >= 2 && (() => {
              const diff = data[data.length - 1].score - data[data.length - 2].score
              if (diff === 0) return <span className="text-xs" style={{ color: 'var(--text-faint)' }}>→</span>
              return (
                <span
                  className="text-xs font-medium"
                  style={{ color: diff > 0 ? 'var(--green-400)' : 'var(--red-400)' }}
                >
                  {diff > 0 ? '↑' : '↓'}{Math.abs(diff)}%
                </span>
              )
            })()}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function WeakAreasCard({ subjectAccuracy }: { subjectAccuracy: Record<string, number> }) {
  const weakAreas = useMemo(() => getWeakAreas(subjectAccuracy), [subjectAccuracy])

  if (weakAreas.length === 0) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
        <Shield size={28} style={{ color: 'var(--text-faint)' }} />
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-faint)' }}>
          No data yet
        </p>
        <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
          Your weakest subjects will show here
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
        Weak Areas
      </p>
      <div className="mt-4 space-y-4">
        {weakAreas.map((area) => {
          const barColor = area.accuracy < 40 ? 'var(--red-400)' : area.accuracy < 55 ? 'var(--amber-400)' : 'var(--gold-400)'
          return (
            <div key={area.subject}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {area.subject}
                </span>
                <span className="text-sm font-semibold" style={{ color: barColor }}>
                  {Math.round(area.accuracy)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(area.accuracy)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ backgroundColor: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile-only CTA */}
      <Link
        href="/practice"
        className="md:hidden flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-colors btn-press"
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--ink-400)',
        }}
      >
        Practice 10 questions now
        <ArrowRight size={14} />
      </Link>
    </motion.div>
  )
}

function RecentTestsCard({ testSessions }: { testSessions: TestSession[] }) {
  const recentTests = useMemo(() => {
    return testSessions
      .filter((t) => t.status === 'completed')
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 5)
  }, [testSessions])

  return (
    <motion.div variants={fadeUp} className="bento-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Recent Tests
        </p>
        {recentTests.length > 0 && (
          <Link href="/analytics" className="text-xs flex items-center gap-0.5" style={{ color: 'var(--ink-400)' }}>
            <span className="md:hidden">View all</span>
            <span className="hidden md:inline">View analytics</span>{' '}
            <ChevronRight size={12} />
          </Link>
        )}
      </div>

      {recentTests.length > 0 ? (
        <>
          {/* Mobile compact card list — visible below sm, capped at 3 */}
          <div className="sm:hidden px-4 pb-2">
            {recentTests.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {t.config.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {new Date(t.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {t.endedAt && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                        {formatTime(Math.floor((t.endedAt - t.startedAt) / 1000))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.score ? `${t.score.correct}/${t.score.total}` : '—'}
                  </span>
                  {t.score && (
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: t.score.percentage >= 60 ? 'var(--green-400)' : 'var(--red-400)',
                      }}
                    >
                      {t.score.percentage}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table — visible sm+ */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <th className="px-5 py-2 text-left t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Date</th>
                  <th className="px-5 py-2 text-left t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Name</th>
                  <th className="px-5 py-2 text-left t-caption font-medium" style={{ color: 'var(--text-faint)' }}>Score</th>
                  <th className="px-5 py-2 text-left t-caption font-medium hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>Accuracy</th>
                  <th className="px-5 py-2 text-left t-caption font-medium hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{ borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <td className="px-5 py-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(t.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-2.5 font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                      {t.config.name}
                    </td>
                    <td className="px-5 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                      {t.score ? `${t.score.correct}/${t.score.total}` : '—'}
                    </td>
                    <td
                      className="px-5 py-2.5 font-medium hidden sm:table-cell"
                      style={{
                        color: t.score && t.score.percentage >= 60 ? 'var(--green-400)' : 'var(--red-400)',
                      }}
                    >
                      {t.score ? `${t.score.percentage}%` : '—'}
                    </td>
                    <td className="px-5 py-2.5 text-xs hidden sm:table-cell" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {t.endedAt ? formatTime(Math.floor((t.endedAt - t.startedAt) / 1000)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-10 text-center">
          <BarChart3 size={28} style={{ color: 'var(--text-faint)', margin: '0 auto' }} />
          <p className="t-body-sm mt-3" style={{ color: 'var(--text-faint)' }}>
            No tests taken yet
          </p>
          <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', opacity: 0.6 }}>
            Your completed tests will appear here
          </p>
        </div>
      )}
    </motion.div>
  )
}

function LeaderboardCard({ totalTests }: { rank?: number; totalTests: number }) {
  return (
    <motion.div variants={fadeUp} className="bento-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="t-heading-sm" style={{ color: 'var(--text-faint)' }}>
          Leaderboard
        </p>
        <Link
          href="/leaderboard"
          className="text-xs flex items-center gap-0.5"
          style={{ color: 'var(--ink-400)' }}
        >
          View all <ChevronRight size={12} />
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
          {totalTests > 0 ? `${totalTests} test${totalTests > 1 ? 's' : ''} completed` : 'Your score will be compared with others'}
        </p>
      </div>
    </motion.div>
  )
}

function ExamCountdownCard({
  targetDate,
  targetExam,
}: {
  targetDate?: number
  targetExam?: ExamTarget
}) {
  const examLabel = getExamLabel(targetExam)

  if (!targetDate) {
    return (
      <motion.div variants={fadeUp} className="bento-card p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
        <Calendar size={28} style={{ color: 'var(--text-faint)' }} />
        <p className="t-body-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
          Set your exam date
        </p>
        <Link
          href="/settings"
          className="mt-2 flex items-center gap-1 text-xs font-medium"
          style={{ color: 'var(--ink-400)' }}
        >
          <Settings size={12} />
          → Settings
        </Link>
      </motion.div>
    )
  }

  const now = Date.now()
  const daysRemaining = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)))
  const urgencyColor = daysRemaining < 7 ? 'var(--red-400)' : daysRemaining < 30 ? 'var(--amber-400)' : 'var(--ink-200)'

  return (
    <motion.div
      variants={fadeUp}
      className="bento-card p-5 flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--ink-800)' }}
    >
      <p className="t-caption" style={{ color: 'var(--text-faint)' }}>
        {examLabel}
      </p>
      <motion.p
        className="t-display-xl mt-1"
        style={{ color: urgencyColor }}
        animate={daysRemaining < 7 ? { scale: [1, 1.05, 1] } : {}}
        transition={daysRemaining < 7 ? { repeat: Infinity, duration: 2 } : {}}
      >
        {daysRemaining}
      </motion.p>
      <p className="t-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
        days remaining
      </p>

      {/* Progress indicator */}
      <div className="w-full mt-4">
        <div className="flex justify-between mb-1">
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Preparation</span>
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
            {daysRemaining < 30 ? 'Final push' : daysRemaining < 90 ? 'In progress' : 'On track'}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--ink-700)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: daysRemaining < 30 ? '75%' : daysRemaining < 90 ? '45%' : '25%',
            }}
            transition={{ duration: 0.8 }}
            style={{ backgroundColor: urgencyColor }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile-Only Components ──────────────────────────────────────────

function MobileStatsRow({
  currentStreak,
  overallAccuracy,
  daysRemaining,
}: {
  currentStreak: number
  overallAccuracy: number
  daysRemaining: number | null
}) {
  const accuracyColor = overallAccuracy >= 70 ? 'var(--green-400)' : overallAccuracy >= 50 ? 'var(--gold-400)' : 'var(--red-400)'
  const examColor = daysRemaining !== null && daysRemaining < 30 ? 'var(--amber-400)' : 'var(--text-primary)'

  return (
    <motion.div variants={fadeUp} className="md:hidden">
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {/* Card A: Day streak */}
        <div
          className="flex-shrink-0 rounded-xl p-3"
          style={{
            width: 120,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="text-lg" role="img" aria-label="fire">🔥</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--gold-400)' }}>
            {currentStreak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            day streak
          </p>
        </div>

        {/* Card B: Avg accuracy */}
        <div
          className="flex-shrink-0 rounded-xl p-3"
          style={{
            width: 120,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <BarChart3 size={18} style={{ color: 'var(--text-faint)' }} />
          <p className="text-xl font-bold mt-1" style={{ color: accuracyColor }}>
            {Math.round(overallAccuracy)}%
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            avg accuracy
          </p>
        </div>

        {/* Card C: Days to exam */}
        <div
          className="flex-shrink-0 rounded-xl p-3"
          style={{
            width: 120,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Calendar size={18} style={{ color: 'var(--text-faint)' }} />
          <p className="text-xl font-bold mt-1" style={{ color: examColor }}>
            {daysRemaining !== null ? daysRemaining : '—'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            days to exam
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MobileQuickActions() {
  const actions = [
    { label: 'Practice', icon: BookOpen, href: '/practice', color: 'var(--ink-400)' },
    { label: 'Mock Test', icon: ClipboardList, href: '/test', color: 'var(--ink-400)' },
    { label: 'Syllabus', icon: Map, href: '/syllabus', color: 'var(--ink-400)' },
    { label: 'My Notes', icon: StickyNote, href: '/notes', color: 'var(--ink-400)' },
  ]

  return (
    <motion.div variants={fadeUp} className="md:hidden">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="relative flex flex-col justify-between rounded-xl p-4 transition-colors btn-press overflow-hidden"
            style={{
              height: 160,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <action.icon size={22} style={{ color: action.color }} />
            {/* Subtle bottom gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(37,64,160,0.06), transparent)',
              }}
            />
            <span className="relative z-10 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Dashboard Page ────────────────────────────────────────────

export default function DashboardPage() {
  const { isReady } = useDB()
  const user = useAuthStore((s) => s.user)

  const [testSessions, setTestSessions] = useState<TestSession[]>([])
  const [activeTest, setActiveTest] = useState<TestSession | undefined>(undefined)

  useEffect(() => {
    if (!isReady) return
    // Load all test sessions and check for active ones
    const load = async () => {
      const db = await initDB()
      const allSessions = await db.getAll('testSessions')
      setTestSessions(allSessions)

      const active = allSessions.find((s) => s.status === 'active')
      setActiveTest(active ?? undefined)
    }
    load()
  }, [isReady])

  // Fallback defaults for when user is null (shouldn't happen in app route, but safety)
  const displayName = user?.displayName ?? 'Aspirant'
  const firstName = getFirstName(displayName)
  const stats = user?.stats
  const profile = user?.profile

  const currentStreak = stats?.currentStreak ?? 0
  const longestStreak = stats?.longestStreak ?? 0
  const lastPracticeDate = stats?.lastPracticeDate ?? 0
  const totalQuestions = stats?.totalQuestionsAttempted ?? 0
  const totalTests = stats?.totalTests ?? 0
  const subjectAccuracy = stats?.subjectAccuracy ?? {}
  const targetDate = profile?.targetDate
  const targetExam = profile?.targetExam

  const streakState = useMemo(
    () => getStreakState(lastPracticeDate, currentStreak),
    [lastPracticeDate, currentStreak],
  )

  const weakestSubject = useMemo(
    () => getWeakestSubject(subjectAccuracy),
    [subjectAccuracy],
  )

  const overallAccuracy = totalQuestions > 0
    ? ((stats?.totalCorrect ?? 0) / totalQuestions) * 100
    : 0

  const daysRemainingCalc = targetDate
    ? Math.max(0, Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  if (!isReady) return <DashboardSkeleton />

  return (
    <div className="space-y-6 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-8">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* ── Greeting Card (both) ── */}
        <div className="col-span-1 md:col-span-5">
          <GreetingCard
            firstName={firstName}
            streakState={streakState}
            currentStreak={currentStreak}
            totalQuestions={totalQuestions}
            totalTests={totalTests}
            hasTargetDate={!!targetDate}
            daysRemaining={daysRemainingCalc}
            examLabel={getExamLabel(targetExam)}
            todaysPracticeCount={0}
            hasActiveTest={!!activeTest}
            activeTest={activeTest}
          />
        </div>

        {/* ── Mobile Stats Row (mobile only) ── */}
        <MobileStatsRow
          currentStreak={currentStreak}
          overallAccuracy={overallAccuracy}
          daysRemaining={daysRemainingCalc}
        />

        {/* ── Mobile Quick Actions (mobile only) ── */}
        <MobileQuickActions />

        {/* ── Streak Card (desktop only — replaced by stats row on mobile) ── */}
        <div className="col-span-1 md:col-span-3 hidden md:block">
          <StreakCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            lastPracticeDate={lastPracticeDate}
          />
        </div>

        {/* ── Quick Actions (desktop only — replaced by 2×2 grid on mobile) ── */}
        <div className="col-span-1 md:col-span-4 hidden md:block">
          <QuickTestCard
            hasActiveTest={!!activeTest}
            activeTest={activeTest}
            weakestSubject={weakestSubject}
          />
        </div>

        {/* ── Subject Radar (both, order:3 on mobile) ── */}
        <div className="col-span-1 md:col-span-4 order-[3] md:order-none">
          <SubjectRadarCard subjectAccuracy={subjectAccuracy} />
        </div>

        {/* ── Score Trend (desktop only) ── */}
        <div className="col-span-1 md:col-span-5 hidden md:block">
          <ScoreTrendCard testSessions={testSessions} />
        </div>

        {/* ── Weak Areas (both, order:1 on mobile) ── */}
        <div className="col-span-1 md:col-span-3 order-[1] md:order-none">
          <WeakAreasCard subjectAccuracy={subjectAccuracy} />
        </div>

        {/* ── Recent Tests (both, order:2 on mobile) ── */}
        <div className="col-span-1 md:col-span-6 order-[2] md:order-none">
          <RecentTestsCard testSessions={testSessions} />
        </div>

        {/* ── Leaderboard (desktop only) ── */}
        <div className="col-span-1 md:col-span-3 hidden md:block">
          <LeaderboardCard totalTests={totalTests} />
        </div>

        {/* ── Exam Countdown (desktop only — merged into GreetingCard on mobile) ── */}
        <div className="col-span-1 md:col-span-3 hidden md:block">
          <ExamCountdownCard targetDate={targetDate} targetExam={targetExam} />
        </div>
      </motion.div>
    </div>
  )
}
