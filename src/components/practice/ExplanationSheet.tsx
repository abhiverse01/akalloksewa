'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, Flag, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════
   ExplanationSheet — Mobile bottom sheet shown after answering
   
   Framer Motion sheet that slides up from bottom with drag-to-dismiss.
   ═══════════════════════════════════════════════════════════════ */

interface ExplanationSheetProps {
  isOpen: boolean
  onClose: () => void
  isCorrect: boolean
  correctAnswer?: string
  explanation?: string
  questionId?: string
  onNextQuestion?: () => void
  onBookmark?: () => void
  isBookmarked?: boolean
}

export function ExplanationSheet({
  isOpen,
  onClose,
  isCorrect,
  correctAnswer,
  explanation,
  questionId,
  onNextQuestion,
  onBookmark,
  isBookmarked = false,
}: ExplanationSheetProps) {
  // Auto-open delay: wait 500ms after isOpen becomes true
  // Track delay completion via ref + version counter to satisfy lint rules
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (isOpen) {
      timer = setTimeout(() => setShouldShow(true), 500)
    } else {
      timer = setTimeout(() => setShouldShow(false), 10)
    }

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Dismiss if dragged down more than 100px
    if (info.offset.y > 100) {
      setShouldShow(false)
      onClose()
    }
  }

  const handleNext = () => {
    setShouldShow(false)
    onNextQuestion?.()
  }

  const handleBackdropTap = () => {
    setShouldShow(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.45)' }}
            onClick={handleBackdropTap}
            aria-hidden="true"
          />

          {/* ── Sheet ── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isCorrect ? 'Correct answer explanation' : 'Incorrect answer explanation'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[18px]"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: '0 -4px 40px rgba(0, 0, 0, 0.2)',
              minHeight: '45vh',
              maxHeight: '80vh',
              touchAction: 'none',
            }}
          >
            {/* ── Drag Handle ── */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-8 h-1 rounded-full"
                style={{ background: 'var(--bg-overlay)' }}
              />
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              {/* ── Result Header ── */}
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isCorrect ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  {!isCorrect && correctAnswer && (
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Correct answer: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Hairline ── */}
              <hr className="hairline mb-4" />

              {/* ── Explanation Section ── */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Explanation
                </p>
                {explanation ? (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {explanation}
                  </p>
                ) : (
                  <p
                    className="text-sm italic"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    No explanation available for this question.
                  </p>
                )}
              </div>

              {/* ── Action Buttons ── */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Bookmark Button */}
                  <button
                    onClick={onBookmark}
                    className={cn(
                      'h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-100',
                      'hover:bg-surface-raised active:scale-[0.95] focus-ring',
                    )}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-5 w-5 text-gold-400" />
                    ) : (
                      <Bookmark className="h-5 w-5" style={{ color: 'var(--text-faint)' }} />
                    )}
                  </button>

                  {/* Flag Button */}
                  <button
                    className={cn(
                      'h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-100',
                      'hover:bg-surface-raised active:scale-[0.95] focus-ring',
                    )}
                    aria-label="Flag question"
                  >
                    <Flag className="h-5 w-5" style={{ color: 'var(--text-faint)' }} />
                  </button>

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>

                {/* Next Question Button */}
                <button
                  onClick={handleNext}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm',
                    'btn-press transition-all duration-150 focus-ring',
                  )}
                  style={{
                    background: 'var(--gold-400)',
                    color: 'var(--ink-950)',
                  }}
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
