'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  Flag,
  FlagOff,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OptionButton, type OptionState } from './OptionButton'
import {
  SUBJECT_MAP,
  SUBJECT_COLORS,
  DIFFICULTY_LABELS,
} from '@/lib/constants'
import type { Question } from '@/types/question'

/* ═══════════════════════════════════════════════════════════════
   QuestionCard
   
   State machine: idle → answered(correct|incorrect) → explanation-shown → next-ready
   ═══════════════════════════════════════════════════════════════ */

interface QuestionCardProps {
  question: Question
  questionNumber: number          // 1-based
  selectedOptionId: string | null
  isBookmarked: boolean
  showExplanation: boolean
  onOptionSelect: (optionId: string) => void
  onToggleBookmark: () => void
  onToggleExplanation: () => void
  onNext: () => void
  onPrev: () => void
  hasPrev: boolean
  hasNext: boolean
  onSkip?: () => void
  isMarkedForReview?: boolean
  isFlagged?: boolean
  onMarkForReview?: () => void
  onFlag?: () => void
}

/* ─── Metadata Row ─── */
function MetadataRow({
  question,
  questionNumber,
  isBookmarked,
  onToggleBookmark,
  isFlagged,
  onFlag,
}: {
  question: Question
  questionNumber: number
  isBookmarked: boolean
  onToggleBookmark: () => void
  isFlagged?: boolean
  onFlag?: () => void
}) {
  const subjectInfo = SUBJECT_MAP[question.subject]
  const subjectColor = SUBJECT_COLORS[question.subject]
  const diffInfo = DIFFICULTY_LABELS[question.difficulty]

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Left: Subject / Chapter / Year */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Subject pill — filled */}
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-semibold uppercase tracking-wide',
            subjectColor?.bg,
            subjectColor?.text,
          )}
        >
          {subjectInfo?.labelEn ?? question.subject}
        </span>

        {/* Chapter */}
        {question.chapter && (
          <>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>/</span>
            <span className="t-body-sm truncate max-w-[120px]" style={{ color: 'var(--text-tertiary)' }}>
              {question.chapter}
            </span>
          </>
        )}

        {/* Year */}
        {question.year && (
          <>
            <span style={{ color: 'var(--text-faint)' }}>•</span>
            <span className="t-caption" style={{ color: 'var(--text-faint)' }}>{question.year} BS</span>
          </>
        )}
      </div>

      {/* Right: Bookmark + Flag + Difficulty dots */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleBookmark}
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-[6px] transition-colors duration-100',
            'hover:bg-surface-raised active:scale-[0.98] focus-ring',
          )}
          aria-label="Bookmark question"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-gold-400" />
          ) : (
            <Bookmark className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
          )}
        </button>

        <button
          onClick={onFlag}
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-[6px] transition-colors duration-100',
            'hover:bg-surface-raised active:scale-[0.98] focus-ring',
          )}
          aria-label="Flag question"
        >
          {isFlagged ? (
            <FlagOff className="h-4 w-4 text-red-400" />
          ) : (
            <Flag className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
          )}
        </button>

        {/* Difficulty dots */}
        {diffInfo && (
          <div className="flex items-center gap-1 ml-1" aria-label={`Difficulty: ${diffInfo.label}`}>
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  dot <= diffInfo.dots
                    ? question.difficulty === 'easy'
                      ? 'bg-green-400'
                      : question.difficulty === 'medium'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    : 'bg-border-subtle',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Explanation Panel ─── */
function ExplanationPanel({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-6 bg-surface-raised border-l-2 border-ink-400 pl-4 py-4 rounded-[14px]">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-ink-400" />
          <span className="t-heading-sm text-ink-300">Explanation</span>
        </div>
        <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
          {text}
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Main QuestionCard ─── */
export function QuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  isBookmarked,
  showExplanation,
  onOptionSelect,
  onToggleBookmark,
  onToggleExplanation,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  onSkip,
  isMarkedForReview,
  isFlagged,
  onMarkForReview,
  onFlag,
}: QuestionCardProps) {
  const isAnswered = selectedOptionId !== null
  const [localMarkedForReview, setLocalMarkedForReview] = useState(isMarkedForReview ?? false)
  const [localFlagged, setLocalFlagged] = useState(isFlagged ?? false)

  const handleMarkForReview = () => {
    setLocalMarkedForReview(prev => !prev)
    onMarkForReview?.()
  }

  const handleFlag = () => {
    setLocalFlagged(prev => !prev)
    onFlag?.()
  }

  // Compute per-option state
  const optionStates = useMemo(() => {
    return question.options.map((opt) => {
      if (!isAnswered) return 'idle' as OptionState
      if (opt.id === selectedOptionId) {
        return opt.isCorrect ? 'correct' : 'incorrect'
      }
      if (opt.isCorrect) return 'revealed-correct'
      return 'idle'
    })
  }, [question.options, selectedOptionId, isAnswered])

  const hasExplanation = !!question.explanation

  return (
    <div className="space-y-6">
      {/* Metadata Row */}
      <MetadataRow
        question={question}
        questionNumber={questionNumber}
        isBookmarked={isBookmarked}
        onToggleBookmark={onToggleBookmark}
        isFlagged={localFlagged}
        onFlag={handleFlag}
      />

      {/* Hairline divider */}
      <hr className="hairline" />

      {/* Question Text */}
      <div className="flex items-start">
        <span className="t-caption mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
          Q{questionNumber}
        </span>
        <p className="t-body-lg" style={{ color: 'var(--text-primary)' }}>
          {question.text}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-2 md:gap-3">
        {question.options.map((option, idx) => (
          <OptionButton
            key={option.id}
            label={String.fromCharCode(65 + idx)}
            text={option.text}
            state={optionStates[idx]}
            onClick={() => onOptionSelect(option.id)}
            disabled={!isAnswered ? false : true}
          />
        ))}
      </div>

      {/* Post-Answer Section */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Explanation toggle button */}
            {hasExplanation && !showExplanation && (
              <button
                onClick={onToggleExplanation}
                className={cn(
                  'flex items-center gap-2 t-body-sm text-ink-400 hover:text-ink-300',
                  'transition-colors duration-100 active:scale-[0.98] focus-ring',
                  'mt-2 mb-2',
                )}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Show Explanation
                <kbd className="text-[10px] font-mono bg-surface-raised px-1.5 py-0.5 rounded-[4px] border border-border-subtle ml-1" style={{ color: 'var(--text-faint)' }}>
                  E
                </kbd>
              </button>
            )}

            {/* Explanation panel */}
            {showExplanation && question.explanation && (
              <ExplanationPanel text={question.explanation} />
            )}

            {/* Hairline */}
            <hr className="hairline mt-4 mb-4" />

            {/* Action Row */}
            <div className="flex items-center justify-between">
              {/* Left: Prev */}
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={cn(
                  'flex items-center gap-1 t-body-sm transition-colors duration-100',
                  'hover:text-ink-300 active:scale-[0.98] focus-ring rounded-[6px] px-2 py-1',
                  hasPrev ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              {/* Center: Mark for Review */}
              <button
                onClick={handleMarkForReview}
                className={cn(
                  'flex items-center gap-1.5 t-body-sm transition-colors duration-100',
                  'active:scale-[0.98] focus-ring rounded-[6px] px-2 py-1',
                  localMarkedForReview
                    ? 'text-gold-400'
                    : '',
                )}
                style={localMarkedForReview ? undefined : { color: 'var(--text-tertiary)' }}
              >
                <Bookmark className="h-3.5 w-3.5" />
                {localMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
              </button>

              {/* Right: Next / Skip */}
              {isAnswered ? (
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={cn(
                    'flex items-center gap-1 t-body-sm font-semibold transition-colors duration-100',
                    'hover:text-ink-300 active:scale-[0.98] focus-ring rounded-[6px] px-2 py-1',
                    hasNext ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
                  )}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                onSkip && (
                  <button
                    onClick={onSkip}
                    className="flex items-center gap-1 t-body-sm transition-colors duration-100 active:scale-[0.98] focus-ring rounded-[6px] px-2 py-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Skip
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )
              )}
            </div>

            {/* Keyboard Hints */}
            <div className="hidden md:flex items-center justify-center mt-4">
              <p className="t-caption" style={{ color: 'var(--text-faint)' }}>
                Press <kbd className="font-mono" style={{ color: 'var(--text-tertiary)' }}>1-4</kbd> to answer
                <span className="mx-1.5 text-border-default">•</span>
                <kbd className="font-mono" style={{ color: 'var(--text-tertiary)' }}>→</kbd> Next
                <span className="mx-1.5 text-border-default">•</span>
                <kbd className="font-mono" style={{ color: 'var(--text-tertiary)' }}>B</kbd> Bookmark
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
