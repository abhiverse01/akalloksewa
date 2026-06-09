'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Upload,
  ClipboardCheck,
  Layers,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Database,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { SUBJECT_MAP } from '@/lib/constants'
import { useIngestorStore } from '@/stores/ingestorStore'

interface DashboardStats {
  totalQuestions: number
  approvedQuestions: number
  pendingQuestions: number
  subjectBreakdown: Record<string, number>
  recentBatches: { id: string; name: string; count: number; status: string; createdAt: number }[]
}

export default function IngestorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const currentBatch = useIngestorStore((s) => s.currentBatch)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ingestor/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      setStats({
        totalQuestions: 0,
        approvedQuestions: 0,
        pendingQuestions: 0,
        subjectBreakdown: {},
        recentBatches: [],
      })
    }
    setLoading(false)
  }, [])

  // Initial data load
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    ;(async () => {
      try {
        const res = await fetch('/api/ingestor/stats', { signal })
        const data = await res.json()
        if (!signal.aborted) setStats(data)
      } catch {
        if (!signal.aborted) setStats({
          totalQuestions: 0,
          approvedQuestions: 0,
          pendingQuestions: 0,
          subjectBreakdown: {},
          recentBatches: [],
        })
      }
      if (!signal.aborted) setLoading(false)
    })()

    return () => controller.abort()
  }, [])

  const handleSeedData = useCallback(async () => {
    setSeeding(true)
    try {
      await fetch('/api/ingestor/seed', { method: 'POST' })
      await loadStats()
    } catch {
      // Error handled silently
    }
    setSeeding(false)
  }, [loadStats])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ingestor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Question pipeline management — parse, classify, review, and commit MCQs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={loading ? undefined : stats?.totalQuestions}
          icon={<Layers className="h-4 w-4" />}
          color="text-primary"
        />
        <StatCard
          title="Approved"
          value={loading ? undefined : stats?.approvedQuestions}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="text-green-600"
        />
        <StatCard
          title="Pending Review"
          value={loading ? undefined : stats?.pendingQuestions}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-amber-600"
        />
        <StatCard
          title="Active Batch"
          value={currentBatch ? currentBatch.parsedQuestions.length : 0}
          icon={<Clock className="h-4 w-4" />}
          color="text-violet-600"
        />
      </div>

      {/* Subject Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Subject Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : stats && stats.totalQuestions > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.subjectBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([subject, count]) => {
                  const pct = (count / stats.totalQuestions) * 100
                  const info = SUBJECT_MAP[subject as keyof typeof SUBJECT_MAP]
                  return (
                    <div key={subject} className="flex items-center gap-3">
                      <span className="text-xs min-w-[100px] text-muted-foreground truncate">
                        {info?.labelEn || subject}
                      </span>
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs font-medium min-w-[40px] text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-40" />
              No questions in database yet.
              <br />
              <Button
                size="sm"
                className="mt-3"
                onClick={handleSeedData}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Load 50 Seed Questions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/ingestor/upload">
          <Card className="hover:border-primary/40 card-hover cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Upload Questions</h3>
                <p className="text-xs text-muted-foreground">
                  Paste text or upload files
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/ingestor/review">
          <Card className="hover:border-primary/40 card-hover cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-950 p-2.5">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Review Queue</h3>
                <p className="text-xs text-muted-foreground">
                  Review parsed questions
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/ingestor/manage">
          <Card className="hover:border-primary/40 card-hover cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950 p-2.5">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Manage Batches</h3>
                <p className="text-xs text-muted-foreground">
                  View and manage all batches
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Batches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.recentBatches && stats.recentBatches.length > 0 ? (
            <div className="space-y-2">
              {stats.recentBatches.slice(0, 5).map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{batch.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {batch.count} Qs
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        batch.status === 'committed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : batch.status === 'review'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-muted'
                      }`}
                    >
                      {batch.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No batches yet. Start by uploading questions.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number | undefined
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={color}>{icon}</span>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        {value !== undefined ? (
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        ) : (
          <Skeleton className="h-8 w-16" />
        )}
      </CardContent>
    </Card>
  )
}
