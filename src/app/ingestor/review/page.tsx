'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Loader2,
  Send,
  Trash2,
  SkipForward,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionPreview } from '@/components/ingestor/QuestionPreview'
import { BulkReviewTable } from '@/components/ingestor/BulkReviewTable'
import { useIngestorStore } from '@/stores/ingestorStore'

export default function ReviewPage() {
  const router = useRouter()
  const {
    currentBatch,
    selectedQuestion,
    filterStatus,
    setFilter,
    selectQuestion,
    updateParsedQuestion,
    removeParsedQuestion,
    updateBatch,
    setProcessing,
  } = useIngestorStore()

  const [isCommitting, setIsCommitting] = useState(false)

  const questions = useMemo(() => {
    if (!currentBatch?.parsedQuestions) return []
    switch (filterStatus) {
      case 'needs-review':
        return currentBatch.parsedQuestions.filter((q) => q.needsReview)
      case 'auto-approved':
        return currentBatch.parsedQuestions.filter(
          (q) => !q.needsReview && q.issues.every((i) => i.severity !== 'error')
        )
      case 'duplicates':
        return currentBatch.parsedQuestions.filter((q) =>
          q.issues.some((i) => i.type === 'duplicate')
        )
      case 'errors':
        return currentBatch.parsedQuestions.filter((q) =>
          q.issues.some((i) => i.severity === 'error')
        )
      default:
        return currentBatch.parsedQuestions
    }
  }, [currentBatch, filterStatus])

  const handleApprove = (tempId: string) => {
    updateParsedQuestion(tempId, {
      needsReview: false,
      issues: [],
      confidence: 1,
      parsedQuestion: {
        ...currentBatch?.parsedQuestions.find((q) => q.tempId === tempId)?.parsedQuestion,
        status: 'approved',
      } as any,
    })
    if (selectedQuestion?.tempId === tempId) {
      selectQuestion(null)
    }
  }

  const handleReject = (tempId: string) => {
    removeParsedQuestion(tempId)
    if (selectedQuestion?.tempId === tempId) {
      selectQuestion(null)
    }
  }

  const handleCommitBatch = async () => {
    if (!currentBatch) return
    setIsCommitting(true)
    setProcessing(true)

    try {
      const commitReady = currentBatch.parsedQuestions.filter(
        (q) => !q.needsReview && q.issues.every((i) => i.severity !== 'error')
      )

      const questionsToCommit = commitReady.map((q) => ({
        ...q.parsedQuestion,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        ingestBatchId: currentBatch.id,
      }))

      await fetch('/api/ingestor/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsToCommit }),
      })

      updateBatch({ status: 'committed' })
      setProcessing(false)
      router.push('/ingestor')
    } catch {
      setProcessing(false)
    }
    setIsCommitting(false)
  }

  // Empty state
  if (!currentBatch || currentBatch.parsedQuestions.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            No questions to review. Upload questions first.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-1">No Batch Active</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload questions to start the review process.
            </p>
            <Button onClick={() => router.push('/ingestor/upload')}>
              Upload Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const readyToCommit = currentBatch.parsedQuestions.filter(
    (q) => !q.needsReview && q.issues.every((i) => i.severity !== 'error')
  ).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentBatch.name} — {currentBatch.parsedQuestions.length} questions parsed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/ingestor/upload')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleCommitBatch}
            disabled={readyToCommit === 0 || isCommitting}
          >
            {isCommitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Commit {readyToCommit} Questions
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all' as const, label: 'All', count: currentBatch.parsedQuestions.length },
          { key: 'auto-approved' as const, label: 'Auto-Approved', count: readyToCommit },
          { key: 'needs-review' as const, label: 'Needs Review', count: currentBatch.parsedQuestions.filter((q) => q.needsReview).length },
          { key: 'errors' as const, label: 'Errors', count: currentBatch.parsedQuestions.filter((q) => q.issues.some((i) => i.severity === 'error')).length },
          { key: 'duplicates' as const, label: 'Duplicates', count: currentBatch.parsedQuestions.filter((q) => q.issues.some((i) => i.type === 'duplicate')).length },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filterStatus === tab.key ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] px-1.5"
            >
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Question list */}
        <div className="lg:col-span-2">
          <BulkReviewTable
            questions={questions}
            selectedId={selectedQuestion?.tempId}
            onSelectQuestion={selectQuestion}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* Right: Selected question detail */}
        <div className="lg:col-span-3">
          <ScrollArea className="max-h-[70vh]">
            {selectedQuestion ? (
              <QuestionPreview
                question={selectedQuestion}
                isSelected
                onApprove={() => handleApprove(selectedQuestion.tempId)}
                onReject={() => handleReject(selectedQuestion.tempId)}
                onSelect={() => selectQuestion(null)}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <SkipForward className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a question from the list to review
                  </p>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
