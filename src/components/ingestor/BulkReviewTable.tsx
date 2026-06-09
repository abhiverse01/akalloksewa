'use client'

import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { DIFFICULTY_LABELS, SUBJECT_MAP } from '@/lib/constants'
import type { ParsedQuestion } from '@/types/ingestor'

interface BulkReviewTableProps {
  questions: ParsedQuestion[]
  selectedId?: string
  onSelectQuestion: (q: ParsedQuestion) => void
  onApprove: (tempId: string) => void
  onReject: (tempId: string) => void
  page?: number
  pageSize?: number
}

export function BulkReviewTable({
  questions,
  selectedId,
  onSelectQuestion,
  onApprove,
  onReject,
  page = 0,
  pageSize = 20,
}: BulkReviewTableProps) {
  const totalPages = Math.ceil(questions.length / pageSize)
  const start = page * pageSize
  const visible = questions.slice(start, start + pageSize)

  const approvedCount = questions.filter(
    (q) => !q.needsReview && q.issues.every((i) => i.severity !== 'error')
  ).length
  const needsReviewCount = questions.filter((q) => q.needsReview).length
  const errorCount = questions.filter((q) => q.issues.some((i) => i.severity === 'error')).length

  const progress = (approvedCount / questions.length) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">
            Review Queue
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {questions.length} questions
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-300">
              {approvedCount} Ready
            </Badge>
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              {needsReviewCount} Review
            </Badge>
            {errorCount > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-300">
                {errorCount} Errors
              </Badge>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-[480px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead className="w-16">Status</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-20">Subject</TableHead>
                <TableHead className="w-16">Conf.</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((q, index) => (
                <TableRow
                  key={q.tempId}
                  className={`cursor-pointer transition-colors ${
                    selectedId === q.tempId ? 'bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectQuestion(q)}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {start + index + 1}
                  </TableCell>
                  <TableCell>
                    {q.issues.some((i) => i.severity === 'error') ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : q.needsReview ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="text-sm truncate">
                      {q.parsedQuestion?.text || q.rawText.substring(0, 80) + '...'}
                    </p>
                    {q.issues.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {q.issues.slice(0, 2).map((issue, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${
                              issue.severity === 'error'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {issue.type}
                          </Badge>
                        ))}
                        {q.issues.length > 2 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            +{q.issues.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {q.parsedQuestion?.subject
                        ? SUBJECT_MAP[q.parsedQuestion.subject as keyof typeof SUBJECT_MAP]?.labelEn?.substring(0, 12) || q.parsedQuestion.subject
                        : '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium ${
                        q.confidence >= 0.8
                          ? 'text-green-600'
                          : q.confidence >= 0.6
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {(q.confidence * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={(e) => {
                          e.stopPropagation()
                          onApprove(q.tempId)
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReject(q.tempId)
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => {
                  // Would need page state in parent
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages - 1}
                onClick={() => {
                  // Would need page state in parent
                }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
