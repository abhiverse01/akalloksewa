'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  BarChart3,
  Target,
  Flame,
  Calendar,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { useDB } from '@/hooks/useDB'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthStore } from '@/stores/authStore'
import { getRecentEvents } from '@/lib/db/analytics'
import { getRecentTestSessions } from '@/lib/db/tests'
import { LOKSEWA_SUBJECTS, SUBJECT_MAP } from '@/lib/constants'
import type { AnalyticsEvent } from '@/types/analytics'
import type { TestSession } from '@/types/test'
import type { LoksewaSubject } from '@/types/question'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Build real heatmap data from analytics events (52 weeks × 7 days)
function buildHeatmapData(events: AnalyticsEvent[]): number[][] {
  // Count events per calendar day
  const dayCounts: Record<string, number> = {}
  events.forEach((e) => {
    const d = new Date(e.timestamp)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    dayCounts[key] = (dayCounts[key] || 0) + 1
  })

  // Build a 52-week grid ending on today, aligned to Sunday start
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - (51 * 7 + today.getDay()))
  startDate.setHours(0, 0, 0, 0)

  const weeks: number[][] = []
  for (let w = 0; w < 52; w++) {
    const week: number[] = []
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(startDate)
      dayDate.setDate(dayDate.getDate() + w * 7 + d)
      const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`
      week.push(dayCounts[key] || 0)
    }
    weeks.push(week)
  }
  return weeks
}

function HeatmapCell({ count }: { count: number }) {
  let bgColor = 'var(--bg-raised)'
  if (count > 0 && count <= 5) bgColor = 'var(--ink-800)'
  else if (count > 5 && count <= 15) bgColor = 'var(--ink-600)'
  else if (count > 15 && count <= 30) bgColor = 'var(--ink-400)'
  else if (count > 30) bgColor = 'var(--ink-200)'

  return (
    <div className="w-[12px] h-[12px] rounded-[4px] transition-colors" style={{ backgroundColor: bgColor }} />
  )
}

export default function AnalyticsPage() {
  const { isReady } = useDB()
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [tests, setTests] = useState<TestSession[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const isMobile = useIsMobile()
  const [activePoint, setActivePoint] = useState<{ date: string; score: number; accuracy: number } | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [evts, testSessions] = await Promise.all([
        getRecentEvents(200),
        getRecentTestSessions(50),
      ])
      setEvents(evts)
      setTests(testSessions)
    } catch {
      // empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isReady) loadData()
  }, [isReady, loadData])

  // KPIs
  const totalQuestions = events.filter((e) => e.type === 'practice').length
  const totalTests = tests.length
  const avgScore = tests.length > 0 ? Math.round(tests.reduce((s, t) => s + (t.score?.percentage || 0), 0) / tests.length) : 0
  const streak = user?.stats?.currentStreak ?? 0

  // Performance over time
  const performanceData = useMemo(() => {
    return tests.map((t) => ({
      date: new Date(t.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: t.score?.percentage || 0,
      accuracy: t.score?.percentage || 0,
    }))
  }, [tests])

  // Subject breakdown
  const subjectMap: Record<string, { total: number; correct: number }> = {}
  tests.forEach((t) => {
    t.score?.subjectBreakdown?.forEach((sb) => {
      if (!subjectMap[sb.subject]) subjectMap[sb.subject] = { total: 0, correct: 0 }
      subjectMap[sb.subject].total += sb.total
      subjectMap[sb.subject].correct += sb.correct
    })
  })
  const radarData = Object.entries(subjectMap).slice(0, 6).map(([subject, v]) => ({
    subject: SUBJECT_MAP[subject as LoksewaSubject]?.labelEn || subject,
    accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
  }))

  const subjectTableData = Object.entries(subjectMap)
    .map(([subject, v]) => ({
      subject: SUBJECT_MAP[subject as LoksewaSubject]?.labelEn || subject,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      total: v.total,
      correct: v.correct,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  // Heatmap — mobile: last 16 weeks only
  const heatmapData = useMemo(() => buildHeatmapData(events), [events])
  const visibleHeatmapData = useMemo(() => isMobile ? heatmapData.slice(-16) : heatmapData, [heatmapData, isMobile])
  const mobileMonthLabels = useMemo(() => {
    if (!isMobile) return []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (51 * 7 + today.getDay()))
    startDate.setHours(0, 0, 0, 0)
    const mobileStartWeek = 52 - 16
    const labels: { label: string; col: number }[] = []
    let prevMonth = -1
    for (let w = mobileStartWeek; w < 52; w++) {
      const weekDate = new Date(startDate)
      weekDate.setDate(weekDate.getDate() + w * 7 + 3)
      const month = weekDate.getMonth()
      if (month !== prevMonth) {
        prevMonth = month
        labels.push({
          label: weekDate.toLocaleDateString('en-US', { month: 'short' }),
          col: w - mobileStartWeek,
        })
      }
    }
    return labels
  }, [isMobile, heatmapData])

  // Weak topics — derive lastPracticed from actual test sessions
  const weakTopics = useMemo(() => {
    return subjectTableData.filter((s) => s.accuracy < 60).map((s) => {
      const subjectKey = Object.entries(SUBJECT_MAP).find(
        ([, v]) => v.labelEn === s.subject
      )?.[0] || s.subject
      const lastTest = tests
        .filter((t) => t.score?.subjectBreakdown?.some((sb) => sb.subject === subjectKey))
        .sort((a, b) => b.startedAt - a.startedAt)[0]
      const daysAgo = lastTest
        ? Math.max(1, Math.floor((Date.now() - lastTest.startedAt) / 86400000))
        : 0
      return {
        topic: s.subject,
        subject: s.subject,
        attempts: s.total,
        accuracy: s.accuracy,
        lastPracticed: daysAgo,
      }
    })
  }, [subjectTableData, tests])

  // Web Share API helper
  async function shareResult(score: number, testName: string) {
    const shareData = {
      title: 'My AkalLoksewa Test Result',
      text: `I scored ${score}% on ${testName} — practicing on AkalLoksewa!`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error — fall back to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
    }
  }

  // Set initial active point to last data point for mobile tooltip
  useEffect(() => {
    if (isMobile && performanceData.length > 0) {
      const last = performanceData[performanceData.length - 1]
      setActivePoint(last)
    }
  }, [isMobile, performanceData])

  if (loading) return <AnalyticsSkeleton />

  return (
    <motion.div
      variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-12"
    >
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="t-display-lg text-[var(--text-primary)]">Your Progress Report</h1>
          <p className="t-body-sm text-[var(--text-tertiary)] mt-1">
            Track preparation, identify gaps, and improve systematically
          </p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] p-1">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`t-caption px-3 py-1.5 rounded-[8px] transition-all ${
                dateRange === range ? 'bg-[var(--bg-raised)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range}`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* SECTION 1 — KPIs */}
      <motion.div variants={fadeUp} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 [-webkit-overflow-scrolling:touch]">
        <div className="min-w-[170px] flex-shrink-0 snap-start rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-ink-300" />
            <span className="t-caption text-[var(--text-tertiary)]">Questions Practiced</span>
          </div>
          <p className="t-display-lg text-[var(--text-primary)]">{totalQuestions}</p>
        </div>
        <div className="min-w-[170px] flex-shrink-0 snap-start rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-400" />
            <span className="t-caption text-[var(--text-tertiary)]">Tests Completed</span>
          </div>
          <p className="t-display-lg text-[var(--text-primary)]">{totalTests}</p>
        </div>
        <div className="min-w-[170px] flex-shrink-0 snap-start rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4" style={{ color: avgScore >= 70 ? '#10a368' : avgScore >= 50 ? '#e8a813' : '#e03030' }} />
            <span className="t-caption text-[var(--text-tertiary)]">Avg Score</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`t-display-lg ${avgScore >= 70 ? 'text-green-400' : avgScore >= 50 ? 'text-gold-400' : avgScore > 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
              {totalTests > 0 ? `${avgScore}%` : '—'}
            </p>
            {totalTests > 0 && (
              <button
                onClick={() => shareResult(avgScore, 'AkalLoksewa Mock Tests')}
                className="h-8 w-8 flex items-center justify-center rounded-[8px] hover:bg-[var(--bg-raised)] transition-colors active:scale-[0.96] focus-ring"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Share average score"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="min-w-[170px] flex-shrink-0 snap-start rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-gold-400" />
            <span className="t-caption text-[var(--text-tertiary)]">Current Streak</span>
          </div>
          <p className="t-display-lg text-gold-400">{streak}</p>
        </div>
      </motion.div>

      {/* SECTION 2 — Performance Over Time */}
      <motion.div variants={fadeUp}>
        <p className="t-heading-sm text-[var(--text-tertiary)] mb-4">Performance Over Time</p>
        <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          {tests.length > 0 ? (
            <>
              {/* Mobile always-visible tooltip */}
              {isMobile && activePoint && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="t-caption text-[var(--text-tertiary)]">{activePoint.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="t-mono text-sm" style={{ color: '#3358c4' }}>{activePoint.score}%</span>
                    <span className="t-mono text-sm text-gold-400">{activePoint.accuracy}%</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                <AreaChart data={performanceData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }} onClick={(data) => {
                  if (isMobile && data?.activePayload?.[0]) {
                    setActivePoint(data.activePayload[0] as { date: string; score: number; accuracy: number })
                  }
                }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3358c4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3358c4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-faint)' }} />
                  {!isMobile && <RTooltip contentStyle={{ background: 'var(--bg-raised)', border: 'var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />}
                  <Area type="monotone" dataKey="score" stroke="#3358c4" strokeWidth={2} fill="url(#scoreGrad)" dot={isMobile} activeDot={{ r: 4, strokeWidth: 2, fill: '#3358c4' }} />
                  <Area type="monotone" dataKey="accuracy" stroke="#f5c442" strokeWidth={1.5} strokeDasharray="6 3" fill="none" dot={isMobile} activeDot={{ r: 4, strokeWidth: 2, fill: '#f5c442' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-ink-400 rounded" />
                  <span className="t-caption text-[var(--text-faint)]">Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-gold-300 rounded" style={{ borderTop: '1.5px dashed #f5c442', height: 0 }} />
                  <span className="t-caption text-[var(--text-faint)]">Accuracy</span>
                </div>
              </div>
            </>
          ) : (
            <p className="t-body-sm text-[var(--text-tertiary)] text-center py-16">Complete mock tests to see performance trends</p>
          )}
        </div>
      </motion.div>

      {/* SECTION 3 — Subject Breakdown */}
      <motion.div variants={fadeUp}>
        <p className="t-heading-sm text-[var(--text-tertiary)] mb-4">Subject Breakdown</p>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Radar dataKey="accuracy" stroke="#3358c4" fill="#2540a0" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="t-body-sm text-[var(--text-tertiary)] text-center py-16">Practice more to see subject data</p>
            )}
          </div>

          {/* Table */}
          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="overflow-y-auto max-h-[340px] lg:max-h-[340px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Subject</th>
                    <th className="text-right px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectTableData.map((row) => (
                    <tr key={row.subject} className="border-b border-[var(--border-subtle)] lg:h-auto" style={{ height: 52 }}>
                      <td className="px-4 py-2.5 lg:py-2.5 t-body-sm text-[var(--text-primary)] flex items-center" style={{ minHeight: 52 }}>{row.subject}</td>
                      <td className="px-4 py-2.5 lg:py-2.5" style={{ minHeight: 52 }}>
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 lg:w-16 h-1.5 lg:h-1 rounded-full bg-[var(--bg-raised)] overflow-hidden">
                            <div className={`h-full rounded-full ${row.accuracy >= 70 ? 'bg-green-400' : row.accuracy >= 50 ? 'bg-gold-400' : 'bg-red-400'}`} style={{ width: `${row.accuracy}%` }} />
                          </div>
                          <span className="t-mono text-[11px] text-[var(--text-secondary)]">{row.accuracy}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 4 — Activity Heatmap */}
      <motion.div variants={fadeUp}>
        <p className="t-heading-sm text-[var(--text-tertiary)] mb-4">Activity Heatmap</p>
        <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 lg:p-5 overflow-x-auto">
          {isMobile ? (
            <>
              {/* Mobile month labels */}
              <div className="flex mb-1" style={{ paddingLeft: 20 }}>
                {mobileMonthLabels.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      left: 0,
                      width: 12 * (i < mobileMonthLabels.length - 1 ? mobileMonthLabels[i + 1].col - m.col : 16 - m.col),
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      flexShrink: 0,
                    }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              {/* Mobile heatmap grid */}
              <div className="flex gap-[2px]">
                {/* Day labels */}
                <div className="flex flex-col gap-[2px]" style={{ width: 18 }}>
                  {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
                    <div key={i} style={{ height: 10, fontSize: 10, color: 'var(--text-faint)', lineHeight: '10px' }}>
                      {d}
                    </div>
                  ))}
                </div>
                {/* Cells */}
                {visibleHeatmapData.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((count, di) => (
                      <div
                        key={di}
                        className={`w-[10px] h-[10px] rounded-[3px] transition-colors ${
                          count === 0 ? 'bg-[var(--bg-raised)]' :
                          count <= 5 ? 'bg-ink-800' :
                          count <= 15 ? 'bg-ink-600' :
                          count <= 30 ? 'bg-ink-400' :
                          'bg-ink-200'
                        }`}
                        title={`${count} questions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Desktop month labels (top) */}
              <div className="flex min-w-fit mb-1" style={{ paddingLeft: 28 }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, mi) => (
                  <div key={m} className="t-caption" style={{ width: (52 * 14 / 12), color: 'var(--text-faint)' }}>
                    {mi % 2 === 0 ? m : ''}
                  </div>
                ))}
              </div>
              {/* Desktop heatmap grid with weekday labels */}
              <div className="flex gap-[2px] min-w-fit">
                {/* Weekday labels */}
                <div className="flex flex-col gap-[2px]" style={{ width: 24 }}>
                  {['', 'Mo', '', 'We', '', 'Fr', ''].map((d, i) => (
                    <div key={i} className="heatmap-weekday" style={{ height: 12 }}>
                      {d}
                    </div>
                  ))}
                </div>
                {/* Heatmap cells */}
                {heatmapData.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((count, di) => (
                      <div
                        key={di}
                        className={`w-[12px] h-[12px] rounded-[4px] transition-colors ${
                          count === 0 ? 'bg-[var(--bg-raised)]' :
                          count <= 5 ? 'bg-ink-800' :
                          count <= 15 ? 'bg-ink-600' :
                          count <= 30 ? 'bg-ink-400' :
                          'bg-ink-200'
                        }`}
                        title={`${count} questions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="t-caption text-[var(--text-faint)]">Less</span>
            <div className={`rounded-[4px] ${isMobile ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]'} bg-[var(--bg-raised)]`} />
            <div className={`rounded-[4px] ${isMobile ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]'} bg-ink-800`} />
            <div className={`rounded-[4px] ${isMobile ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]'} bg-ink-600`} />
            <div className={`rounded-[4px] ${isMobile ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]'} bg-ink-400`} />
            <div className={`rounded-[4px] ${isMobile ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]'} bg-ink-200`} />
            <span className="t-caption text-[var(--text-faint)]">More</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 5 — Weak Topics */}
      <motion.div variants={fadeUp}>
        <p className="t-heading-sm text-[var(--text-tertiary)] mb-4">Weak Topics</p>
        <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          {weakTopics.length > 0 ? (
            isMobile ? (
              <div className="divide-y divide-[var(--border-subtle)]">
                {weakTopics.map((topic) => (
                  <div key={topic.topic} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        <span className="t-body-sm text-[var(--text-primary)]">{topic.topic}</span>
                      </div>
                      <span className="t-mono text-red-400">{topic.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="t-caption text-[var(--text-faint)]">{topic.attempts} attempts</span>
                        <span className="t-caption text-[var(--text-faint)]">{topic.lastPracticed > 0 ? `${topic.lastPracticed}d ago` : '—'}</span>
                      </div>
                      <Link
                        href={`/practice?subject=${encodeURIComponent(topic.subject)}`}
                        className="t-caption text-ink-300 hover:text-ink-200 transition-colors"
                      >
                        Practice Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Topic</th>
                    <th className="text-left px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Subject</th>
                    <th className="text-center px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Attempts</th>
                    <th className="text-center px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Accuracy</th>
                    <th className="text-right px-4 py-2.5 t-caption text-[var(--text-faint)] font-medium">Last Practiced</th>
                  </tr>
                </thead>
                <tbody>
                  {weakTopics.map((topic) => (
                    <tr key={topic.topic} className="border-b border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5 t-body-sm text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                        {topic.topic}
                      </td>
                      <td className="px-4 py-2.5 t-body-sm text-[var(--text-tertiary)]">{topic.subject}</td>
                      <td className="px-4 py-2.5 text-center t-mono text-[var(--text-secondary)]">{topic.attempts}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="t-mono text-red-400">{topic.accuracy}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-right flex items-center justify-end gap-2">
                        <span className="t-caption text-[var(--text-faint)]">{topic.lastPracticed > 0 ? `${topic.lastPracticed}d ago` : '—'}</span>
                        <Link
                          href={`/practice?subject=${encodeURIComponent(topic.subject)}`}
                          className="t-caption text-ink-300 hover:text-ink-200 transition-colors"
                        >
                          Practice Now
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <p className="t-body-sm text-[var(--text-tertiary)] text-center py-12">Keep practicing to identify weak areas</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-72 skeleton-shimmer rounded-[10px]" />
        <div className="h-4 w-64 skeleton-shimmer rounded-[10px]" />
      </div>
      {/* KPIs — scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-hidden lg:grid lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[170px] flex-shrink-0 h-28 rounded-[14px] skeleton-shimmer lg:min-w-0" />
        ))}
      </div>
      <div className="h-64 rounded-[14px] skeleton-shimmer" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-[14px] skeleton-shimmer" />
        <div className="h-72 rounded-[14px] skeleton-shimmer" />
      </div>
    </div>
  )
}
