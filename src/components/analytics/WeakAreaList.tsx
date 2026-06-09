'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LOKSEWA_SUBJECTS, DIFFICULTY_LABELS } from '@/lib/constants'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { LoksewaSubject } from '@/types/question'

interface WeakArea {
  subject: LoksewaSubject
  accuracy: number
  totalQuestions: number
  correct: number
  trend: 'up' | 'down' | 'stable'
}

interface WeakAreaListProps {
  data: WeakArea[]
}

export function WeakAreaList({ data }: WeakAreaListProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
        No data yet. Practice more questions to see your weak areas.
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => a.accuracy - b.accuracy)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead className="text-center">Accuracy</TableHead>
          <TableHead className="text-center">Correct / Total</TableHead>
          <TableHead className="text-center">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((area) => {
          const subjectInfo = LOKSEWA_SUBJECTS.find((s) => s.id === area.subject)
          const pct = Math.round(area.accuracy * 100)
          const TrendIcon = area.trend === 'up' ? TrendingUp : area.trend === 'down' ? TrendingDown : Minus
          const trendColor = area.trend === 'up' ? 'text-green-400' : area.trend === 'down' ? 'text-red-400' : 'text-[var(--text-tertiary)]'

          return (
            <TableRow key={area.subject}>
              <TableCell className="font-medium">
                {subjectInfo?.labelEn || area.subject}
                <span className="text-xs ml-1.5" style={{ color: 'var(--text-tertiary)' }}>{subjectInfo?.label}</span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={pct >= 70 ? 'default' : pct >= 50 ? 'secondary' : 'destructive'} className="text-xs">
                  {pct}%
                </Badge>
              </TableCell>
              <TableCell className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {area.correct} / {area.totalQuestions}
              </TableCell>
              <TableCell className="text-center">
                <TrendIcon className={`w-4 h-4 ${trendColor} mx-auto`} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
