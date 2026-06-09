'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Target,
  Flame,
  TrendingUp,
  Activity,
  X,
  BookOpen,
  Play,
  Info,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getAllTestSessions } from '@/lib/db/tests'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'
import type { TestSession } from '@/types/test'
import Link from 'next/link'

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// ── Benchmark levels ──
const BENCHMARKS = [
  { level: 'Beginner', scoreRange: '0 – 500', color: 'var(--text-faint)', bg: 'var(--bg-raised)' },
  { level: 'Intermediate', scoreRange: '501 – 2,000', color: 'var(--green-400)', bg: 'var(--green-500/10)' },
  { level: 'Advanced', scoreRange: '2,001 – 5,000', color: 'var(--ink-300)', bg: 'var(--ink-500/10)' },
  { level: 'Expert', scoreRange: '5,001 – 10,000', color: 'var(--gold-400)', bg: 'var(--gold-400/10)' },
]

// ── Helper: compute score from test session ──
function computeTestScore(session: TestSession): number {
  if (!session.score) return 0
  return session.score.percentage
}

export default function LeaderboardPage() {
  const { user, hydrated } = useAuthStore()
  const [showBanner, setShowBanner] = useState(true)
  const [testSessions, setTestSessions] = useState<TestSession[]>([])
  const [loadingTests, setLoadingTests] = useState(true)

  const stats = user?.stats
  const totalScore = stats
    ? stats.totalQuestionsAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAttempted) * 10000)
      : 0
    : 0
  const accuracy = stats
    ? stats.totalQuestionsAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAttempted) * 100)
      : 0
    : 0
  const tests = stats?.totalTests || 0
  const streak = stats?.currentStreak || 0

  // ── Load test sessions ──
  const loadTests = useCallback(async () => {
    try {
      const sessions = await getAllTestSessions()
      setTestSessions(sessions.filter((s) => s.status === 'completed' && s.score))
    } catch {
      setTestSessions([])
    } finally {
      setLoadingTests(false)
    }
  }, [])

  useEffect(() => {
    if (hydrated) loadTests()
  }, [hydrated, loadTests])

  // ── Top 5 test scores ──
  const topScores = testSessions
    .map((s) => ({
      id: s.id,
      score: s.score?.percentage || 0,
      total: s.score?.total || 0,
      correct: s.score?.correct || 0,
      date: s.startedAt,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // ── Subject rankings ──
  const subjectRankings = Object.entries(stats?.subjectAccuracy || {})
    .map(([subjectId, acc]) => ({
      subjectId,
      accuracy: Math.round(acc * 100),
      info: LOKSEWA_SUBJECTS.find((s) => s.id === subjectId),
    }))
    .sort((a, b) => b.accuracy - a.accuracy)

  // ── Determine user's benchmark ──
  function getUserBenchmark() {
    if (totalScore <= 500) return 'Beginner'
    if (totalScore <= 2000) return 'Intermediate'
    if (totalScore <= 5000) return 'Advanced'
    return 'Expert'
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-6">
      {/* ── Transparency Banner ── */}
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-[14px]"
          style={{ background: 'var(--amber-900)', border: '1px solid var(--amber-700)' }}
        >
          <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--amber-500)' }} />
          <div className="flex-1 min-w-0">
            <p className="t-body-sm font-medium" style={{ color: 'var(--amber-500)' }}>
              Local-Only Data — Phase 1
            </p>
            <p className="t-caption mt-0.5" style={{ color: 'var(--amber-300)' }}>
              Your stats are stored locally on this device only. No data is shared or compared with other users.
              Benchmarks are reference ranges for self-assessment.
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-md transition-colors hover:bg-amber-500/10"
          >
            <X className="h-4 w-4" style={{ color: 'var(--amber-500)' }} />
          </button>
        </motion.div>
      )}

      {/* ── My Rank Card ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-[14px] overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="p-5 flex items-center gap-4 flex-wrap">
          {/* Rank badge */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full shrink-0"
            style={{ background: 'var(--gold-400/15)', border: '2px solid var(--gold-400)' }}
          >
            <Crown className="h-6 w-6" style={{ color: 'var(--gold-400)' }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>
                #1 (You)
              </h2>
              <Badge className="t-caption bg-gold-400/15 text-gold-400 border-0 rounded-full px-2.5">
                {getUserBenchmark()}
              </Badge>
            </div>
            <p className="t-body-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {user?.displayName || 'Student'} — Personal Performance
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Target className="h-3.5 w-3.5" style={{ color: 'var(--ink-400)' }} />
                <span className="t-mono text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {totalScore.toLocaleString()}
                </span>
              </div>
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Total Score</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--green-400)' }} />
                <span className="t-mono text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {accuracy}%
                </span>
              </div>
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Accuracy</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Activity className="h-3.5 w-3.5" style={{ color: 'var(--ink-300)' }} />
                <span className="t-mono text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {tests}
                </span>
              </div>
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Tests</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Flame className="h-3.5 w-3.5" style={{ color: 'var(--amber-400)' }} />
                <span className="t-mono text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {streak}
                </span>
              </div>
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Streak</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Two Column: Benchmark Table + Subject Rankings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Benchmark Table ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-[14px] overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="p-4 hairline-b flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: 'var(--gold-400)' }} />
            <span className="t-heading-sm" style={{ color: 'var(--text-tertiary)' }}>Score Benchmarks</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <TableHead className="t-caption" style={{ color: 'var(--text-faint)' }}>Level</TableHead>
                <TableHead className="t-caption text-right" style={{ color: 'var(--text-faint)' }}>Score Range</TableHead>
                <TableHead className="t-caption text-right" style={{ color: 'var(--text-faint)' }}>Your Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BENCHMARKS.map((b) => {
                const isCurrentLevel = getUserBenchmark() === b.level
                return (
                  <TableRow
                    key={b.level}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isCurrentLevel ? 'var(--ink-500/8)' : 'transparent',
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: b.color }}
                        />
                        <span className="t-body-sm font-medium" style={{ color: isCurrentLevel ? 'var(--ink-300)' : 'var(--text-primary)' }}>
                          {b.level}
                        </span>
                        {isCurrentLevel && (
                          <span className="t-caption px-1.5 py-0.5 rounded" style={{ background: 'var(--ink-500/15)', color: 'var(--ink-300)' }}>
                            YOU
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="t-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {b.scoreRange}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isCurrentLevel ? (
                        <Badge className="t-mono text-xs bg-ink-500/15 text-ink-300 border-0">
                          {totalScore.toLocaleString()} pts
                        </Badge>
                      ) : (
                        <span className="t-mono text-xs" style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </motion.div>

        {/* ── Subject Rankings ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-[14px] overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="p-4 hairline-b flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: 'var(--ink-400)' }} />
            <span className="t-heading-sm" style={{ color: 'var(--text-tertiary)' }}>Subject Accuracy</span>
          </div>

          {subjectRankings.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
              <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                No subject data yet
              </p>
              <p className="t-caption mt-1 mb-3" style={{ color: 'var(--text-faint)' }}>
                Complete practice sessions to see your accuracy per subject
              </p>
              <Link href="/practice">
                <Button className="btn-press gap-2 bg-gold-400 hover:bg-gold-500 text-ink-950 font-semibold rounded-[10px] h-9 text-sm">
                  <Play className="h-3.5 w-3.5" />
                  Start Practicing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {subjectRankings.map((item, idx) => (
                <div key={item.subjectId} className="flex items-center gap-3 px-4 py-3">
                  {/* Rank number */}
                  <span className="t-mono text-xs w-5 text-center shrink-0" style={{ color: 'var(--text-faint)' }}>
                    {idx + 1}
                  </span>

                  {/* Subject name */}
                  <div className="flex-1 min-w-0">
                    <span className="t-body-sm truncate block" style={{ color: 'var(--text-primary)' }}>
                      {item.info?.labelEn || item.subjectId}
                    </span>
                    <span className="t-caption block" style={{ color: 'var(--text-faint)' }}>
                      {item.info?.label || ''}
                    </span>
                  </div>

                  {/* Accuracy bar */}
                  <div className="flex items-center gap-2 shrink-0 w-28">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.accuracy}%`,
                          background:
                            item.accuracy >= 80
                              ? 'var(--green-400)'
                              : item.accuracy >= 60
                              ? 'var(--gold-400)'
                              : item.accuracy >= 40
                              ? 'var(--amber-400)'
                              : 'var(--red-400)',
                        }}
                      />
                    </div>
                    <span className="t-mono text-xs w-8 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {item.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Personal Records ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-[14px] overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="p-4 hairline-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" style={{ color: 'var(--gold-400)' }} />
            <span className="t-heading-sm" style={{ color: 'var(--text-tertiary)' }}>Personal Records</span>
          </div>
          <span className="t-caption" style={{ color: 'var(--text-faint)' }}>Top 5 Test Scores</span>
        </div>

        {loadingTests ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : topScores.length === 0 ? (
          <div className="p-8 text-center">
            <Medal className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
            <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
              No completed tests yet
            </p>
            <p className="t-caption mt-1 mb-3" style={{ color: 'var(--text-faint)' }}>
              Take a test to set your first record
            </p>
            <Link href="/practice">
              <Button className="btn-press gap-2 bg-ink-500 hover:bg-ink-600 text-white font-semibold rounded-[10px] h-9 text-sm">
                <Play className="h-3.5 w-3.5" />
                Take a Test
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {topScores.map((record, idx) => {
              const medalIcon =
                idx === 0 ? <Crown className="h-4 w-4" style={{ color: 'var(--gold-400)' }} /> :
                idx === 1 ? <Medal className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} /> :
                idx === 2 ? <Award className="h-4 w-4" style={{ color: 'var(--amber-400)' }} /> :
                null

              return (
                <div key={record.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Rank */}
                  <div className="w-5 flex items-center justify-center shrink-0">
                    {medalIcon || (
                      <span className="t-mono text-xs" style={{ color: 'var(--text-faint)' }}>{idx + 1}</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-1 min-w-0">
                    <span className="t-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {record.score}%
                    </span>
                    <span className="t-caption ml-2" style={{ color: 'var(--text-faint)' }}>
                      {record.correct}/{record.total} correct
                    </span>
                  </div>

                  {/* Date */}
                  <span className="t-caption shrink-0" style={{ color: 'var(--text-faint)' }}>
                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
