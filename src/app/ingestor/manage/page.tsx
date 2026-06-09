'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  RotateCcw,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIngestorStore } from '@/stores/ingestorStore'

interface BatchRow {
  id: string
  name: string
  sourceType: string
  status: string
  totalQuestions: number
  readyToCommit: number
  duplicatesFound: number
  createdAt: number
}

export default function ManagePage() {
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const { setBatch } = useIngestorStore()

  const loadBatches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ingestor/batches')
      const data = await res.json()
      setBatches(data.batches || [])
    } catch {
      setBatches([])
    }
    setLoading(false)
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/ingestor/batches?id=${id}`, { method: 'DELETE' })
      setBatches((prev) => prev.filter((b) => b.id !== id))
    } catch {
      // Silent error
    }
  }

  const handleView = (batch: BatchRow) => {
    // noop
  }

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    ;(async () => {
      try {
        const res = await fetch('/api/ingestor/batches', { signal })
        const data = await res.json()
        if (!signal.aborted) setBatches(data.batches || [])
      } catch {
        if (!signal.aborted) setBatches([])
      }
      if (!signal.aborted) setLoading(false)
    })()

    return () => controller.abort()
  }, [])

  const statusIcon = (status: string) => {
    switch (status) {
      case 'committed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'review':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'parsing':
      case 'classifying':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'committed':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
      case 'review':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, manage, and delete ingestion batches.
          </p>
        </div>
        <Button variant="outline" onClick={loadBatches}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Batches" value={loading ? undefined : batches.length} />
        <MiniStat label="Committed" value={loading ? undefined : batches.filter((b) => b.status === 'committed').length} />
        <MiniStat label="In Review" value={loading ? undefined : batches.filter((b) => b.status === 'review').length} />
        <MiniStat label="Total Questions" value={loading ? undefined : batches.reduce((sum, b) => sum + b.totalQuestions, 0)} />
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            All Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No batches created yet.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">Status</TableHead>
                    <TableHead>Batch Name</TableHead>
                    <TableHead className="w-20">Source</TableHead>
                    <TableHead className="w-16 text-center">Questions</TableHead>
                    <TableHead className="w-16 text-center">Ready</TableHead>
                    <TableHead className="w-16 text-center">Duplicates</TableHead>
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-muted/30">
                      <TableCell>{statusIcon(batch.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {batch.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {batch.sourceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {batch.totalQuestions}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {batch.readyToCommit}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {batch.duplicatesFound || 0}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(batch.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(batch)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(batch.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Batch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: number | undefined
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        {value !== undefined ? (
          <p className="text-xl font-bold mt-0.5">{value}</p>
        ) : (
          <Skeleton className="h-7 w-12 mt-0.5" />
        )}
      </CardContent>
    </Card>
  )
}
