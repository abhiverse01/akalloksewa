'use client'

import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_LABELS } from '@/lib/constants'
import type { ParsedQuestion } from '@/types/ingestor'
import type { LoksewaSubject } from '@/types/question'

interface QuestionPreviewProps {
  question: ParsedQuestion
  isSelected?: boolean
  onSelect?: () => void
  onApprove?: () => void
  onReject?: () => void
  showActions?: boolean
}

export function QuestionPreview({
  question,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  showActions = true,
}: QuestionPreviewProps) {
  const pq = question.parsedQuestion
  if (!pq) {
    return (
      <Card className={`border ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`}>
        <CardContent className="p-4">
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Failed to parse question
          </div>
          <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
            {question.rawText.substring(0, 300)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  const confidenceColor =
    question.confidence >= 0.8
      ? 'text-green-600'
      : question.confidence >= 0.6
        ? 'text-amber-600'
        : 'text-red-600'

  const subjectLabel = pq.subject || 'Unclassified'

  return (
    <Card
      className={`transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'hover:border-muted-foreground/30'}`}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {subjectLabel}
            </Badge>
            {pq.difficulty && (
              <Badge className={`text-xs ${DIFFICULTY_LABELS[pq.difficulty]?.color}`}>
                {pq.difficulty}
              </Badge>
            )}
            {pq.year && (
              <Badge variant="secondary" className="text-xs">
                {pq.year} BS
              </Badge>
            )}
          </div>
          <span className={`text-xs font-medium ${confidenceColor}`}>
            {(question.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Question text */}
        <p className="text-sm font-medium leading-relaxed">{pq.text}</p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pq.options?.map((opt) => (
            <div
              key={opt.id}
              className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${
                opt.isCorrect
                  ? 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800'
                  : 'border-transparent bg-muted/50'
              }`}
            >
              <span className="font-medium text-muted-foreground min-w-[20px]">
                {opt.id}.
              </span>
              <span className={opt.isCorrect ? 'text-green-700 dark:text-green-400 font-medium' : ''}>
                {opt.text}
              </span>
              {opt.isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Issues */}
        {question.issues.length > 0 && (
          <div className="space-y-1">
            {question.issues.map((issue, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs ${
                  issue.severity === 'error'
                    ? 'text-red-600'
                    : issue.severity === 'warning'
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                }`}
              >
                {issue.severity === 'error' ? (
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                ) : issue.severity === 'warning' ? (
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <HelpCircle className="h-3 w-3 flex-shrink-0" />
                )}
                {issue.message}
              </div>
            ))}
          </div>
        )}

        {/* Explanation preview */}
        {pq.explanation && (
          <details className="text-xs">
            <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
              Explanation
            </summary>
            <p className="mt-1 text-muted-foreground">{pq.explanation}</p>
          </details>
        )}

        {/* Actions */}
        {showActions && (onApprove || onReject) && (
          <div className="flex gap-2 pt-1 border-t">
            <Button variant="ghost" size="sm" onClick={onSelect} className="text-xs">
              Edit
            </Button>
            <Button
              size="sm"
              onClick={onApprove}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={onReject} className="text-xs">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
