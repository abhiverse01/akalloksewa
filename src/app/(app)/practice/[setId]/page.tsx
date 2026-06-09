'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PanelRightOpen,
  PanelRightClose,
  Bookmark,
  BookmarkCheck,
  Keyboard,
  Target,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Maximize2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useDB, useKeyboard } from '@/hooks/useDB'
import { getAllQuestions } from '@/lib/db/questions'
import { SUBJECT_MAP, DIFFICULTY_LABELS, SUBJECT_COLORS, SUBJECT_AMBIENT_COLORS } from '@/lib/constants'
import { QuestionCard } from '@/components/practice/QuestionCard'
import { OptionButton, type OptionState } from '@/components/practice/OptionButton'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { ExplanationSheet } from '@/components/practice/ExplanationSheet'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { Question, Difficulty } from '@/types/question'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
   Practice Mode — 3-zone layout
   
   TOP BAR (52px): Subject pill | Q 12 of 47 | progress bar
   QUESTION ZONE (flex 1): QuestionCard with Framer transitions
   RIGHT SIDEBAR (240px, collapsible): stats, filters, shortcuts
   ═══════════════════════════════════════════════════════════════ */

const questionTransition = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

export default function PracticeDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isReady } = useDB()
  const setId = params.setId as string

  // ─── State ───
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [status, setStatus] = useState<'active' | 'paused'>('active')
  const [explanationSheetOpen, setExplanationSheetOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const questionZoneRef = useRef<HTMLDivElement>(null)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)

  // ─── Load questions ───
  useEffect(() => {
    if (!isReady) return
    getAllQuestions().then((qs) => {
      const approved = qs.filter((q) => q.status === 'approved')
      if (setId === 'all') {
        const subjectFilter = searchParams.get('subject')
        const diffFilter = searchParams.get('difficulty')
        let filtered = approved
        if (subjectFilter && subjectFilter !== 'all') {
          filtered = filtered.filter((q) => q.subject === subjectFilter)
        }
        if (diffFilter && diffFilter !== 'all') {
          filtered = filtered.filter((q) => q.difficulty === diffFilter)
          setFilterDifficulty(diffFilter)
        }
        setQuestions(filtered)
      } else {
        setQuestions(approved.filter((q) => q.subject === setId))
      }
    })
  }, [isReady, setId, searchParams])

  // ─── Ambient subject coloring ───
  useEffect(() => {
    if (!currentQuestion) return
    const color = SUBJECT_AMBIENT_COLORS[currentQuestion.subject]
    if (color) {
      document.documentElement.style.setProperty('--ambient-color', color)
    }
    return () => {
      document.documentElement.style.removeProperty('--ambient-color')
    }
  }, [currentQuestion?.subject])

  // Auto-open explanation sheet on mobile after answer
  useEffect(() => {
    if (!selectedOption) return
    const timer = setTimeout(() => setExplanationSheetOpen(true), 500)
    return () => clearTimeout(timer)
  }, [selectedOption])

  // Auto-pause on visibility change (tab switch / phone home button)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'active') {
        setStatus('paused')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status])

  // ─── Filter by difficulty ───
  const filteredQuestions = useMemo(() => {
    if (!filterDifficulty || filterDifficulty === 'all') return questions
    return questions.filter(q => q.difficulty === filterDifficulty)
  }, [questions, filterDifficulty])

  // Reset index when filtered list changes
  const prevDifficultyRef = useRef(filterDifficulty)
  useEffect(() => {
    if (prevDifficultyRef.current !== filterDifficulty) {
      prevDifficultyRef.current = filterDifficulty
      // Use flushSync-like pattern via startTransition to avoid cascading render lint
      React.startTransition(() => {
        setCurrentIndex(0)
        setSelectedOption(null)
        setShowExplanation(false)
      })
    }
  }, [filterDifficulty])

  const currentQuestion = filteredQuestions[currentIndex]

  // ─── Handlers ───
  const handleSelect = useCallback((optionId: string) => {
    if (selectedOption || !currentQuestion) return
    setSelectedOption(optionId)
    const option = currentQuestion.options.find((o) => o.id === optionId)
    const correct = option?.isCorrect ?? false
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: correct }))
    setShowExplanation(false)
    // Track consecutive correct streak
    if (correct) {
      setConsecutiveCorrect((c) => c + 1)
    } else {
      setConsecutiveCorrect(0)
    }
  }, [selectedOption, currentQuestion])

  const goNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setShowExplanation(false)
      setExplanationSheetOpen(false)
    }
  }, [currentIndex, filteredQuestions.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setSelectedOption(null)
      setShowExplanation(false)
      setExplanationSheetOpen(false)
    }
  }, [currentIndex])

  const goSkip = useCallback(() => {
    goNext()
  }, [goNext])

  const toggleBookmark = useCallback(() => {
    if (!currentQuestion) return
    setBookmarked((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id)
      else next.add(currentQuestion.id)
      return next
    })
  }, [currentQuestion])

  const toggleExplanation = useCallback(() => {
    setShowExplanation((prev) => !prev)
  }, [])

  // ─── Keyboard shortcuts ───
  useKeyboard({
    '1': () => currentQuestion?.options[0] && handleSelect(currentQuestion.options[0].id),
    '2': () => currentQuestion?.options[1] && handleSelect(currentQuestion.options[1].id),
    '3': () => currentQuestion?.options[2] && handleSelect(currentQuestion.options[2].id),
    '4': () => currentQuestion?.options[3] && handleSelect(currentQuestion.options[3].id),
    ArrowRight: () => goNext(),
    ArrowLeft: () => goPrev(),
    l: () => goNext(),
    h: () => goPrev(),
    e: () => toggleExplanation(),
    b: () => toggleBookmark(),
  })

  // ─── Swipe gesture for mobile question navigation ───
  useSwipeGesture(questionZoneRef, {
    threshold: 60,
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  })

  // ─── Computed ───
  const totalAnswered = Object.keys(answers).length
  const totalCorrect = Object.values(answers).filter(Boolean).length
  const progressPercent = filteredQuestions.length > 0
    ? ((currentIndex + 1) / filteredQuestions.length) * 100
    : 0
  const accuracy = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0

  // ─── Mobile helpers ───
  const isMobileAnswered = selectedOption !== null
  const getOptionState = useCallback((optionId: string): OptionState => {
    if (!isMobileAnswered || !currentQuestion) return 'idle'
    const opt = currentQuestion.options.find(o => o.id === optionId)
    if (optionId === selectedOption) {
      return opt?.isCorrect ? 'correct' : 'incorrect'
    }
    if (opt?.isCorrect) return 'revealed-correct'
    return 'idle'
  }, [isMobileAnswered, currentQuestion, selectedOption])
  const selectedOptionData = selectedOption
    ? currentQuestion?.options.find(o => o.id === selectedOption)
    : null
  const isCurrentCorrect = selectedOptionData?.isCorrect ?? false
  const correctOptionData = currentQuestion?.options.find(o => o.isCorrect)
  const diffInfo = DIFFICULTY_LABELS[currentQuestion?.difficulty ?? '']

  // ─── Loading ───
  if (!isReady || !currentQuestion) {
    return <PracticeDetailSkeleton />
  }

  return (
    <>
      {/* ═══════════════════════════════════════════
         MOBILE: TopBar (fixed, covers layout default)
         ═══════════════════════════════════════════ */}
      {!focusMode && (
        <MobileTopBar
          variant="practice"
          leftAction={{ label: 'Back', onClick: () => router.back() }}
          subjectBadge={SUBJECT_MAP[currentQuestion.subject]?.labelEn ?? currentQuestion.subject}
          questionProgress={`Q ${currentIndex + 1} of ${filteredQuestions.length}`}
          rightAction={
            <button
              onClick={toggleBookmark}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg transition-colors"
              aria-label={bookmarked.has(currentQuestion.id) ? 'Remove bookmark' : 'Bookmark question'}
            >
              {bookmarked.has(currentQuestion.id) ? (
                <BookmarkCheck className="size-5" style={{ color: 'var(--gold-400)' }} />
              ) : (
                <Bookmark className="size-5" style={{ color: 'var(--ink-300)' }} />
              )}
            </button>
          }
        />
      )}

      {/* ═══════════════════════════════════════════
         MOBILE: Split Layout (fixed overlay)
         ═══════════════════════════════════════════ */}
      <div className={cn("fixed inset-0 z-30 flex lg:hidden flex-col", focusMode ? "pt-0" : "pt-14")}>
        {/* Focus mode toggle (enter focus) — positioned top-right of question area */}
        {!focusMode && (
          <button
            onClick={() => setFocusMode(true)}
            className="absolute z-20 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 active:scale-[0.95]"
            style={{
              top: 58,
              right: 12,
              color: 'var(--text-faint)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
            }}
            aria-label="Enter focus mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* ── Question text zone: flex-1, scrollable, 20px padding ── */}
        <div ref={questionZoneRef} className="flex-1 overflow-y-auto p-5">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Metadata row: chapter + year + difficulty */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {currentQuestion.chapter && (
                  <span className="t-body-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {currentQuestion.chapter}
                  </span>
                )}
                {currentQuestion.year && currentQuestion.chapter && (
                  <span style={{ color: 'var(--text-faint)' }}>•</span>
                )}
                {currentQuestion.year && (
                  <span className="t-caption flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{currentQuestion.year} BS</span>
                )}
              </div>
              {diffInfo && (
                <div className="flex items-center gap-1 flex-shrink-0" aria-label={`Difficulty: ${diffInfo.label}`}>
                  {[1, 2, 3].map((dot) => (
                    <span
                      key={dot}
                      className={cn(
                        'h-2 w-2 rounded-full',
                        dot <= diffInfo.dots
                          ? currentQuestion.difficulty === 'easy'
                            ? 'bg-green-400'
                            : currentQuestion.difficulty === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          : 'bg-border-subtle',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            <hr className="hairline" />

            {/* Question text */}
            <div className="flex items-start">
              <span className="t-caption mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                Q{currentIndex + 1}
              </span>
              <p className="t-body-lg" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion.text}
              </p>
            </div>

            {/* Motivational micro-copy — consecutive correct streak */}
            <AnimatePresence>
              {consecutiveCorrect >= 5 && selectedOption && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-medium text-amber-300 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {consecutiveCorrect} in a row! You&apos;re building momentum.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Exit focus mode pill */}
        {focusMode && (
          <div className="flex justify-center py-2 flex-shrink-0" style={{ backgroundColor: 'var(--bg-base)' }}>
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-[0.97]"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              Exit focus
            </button>
          </div>
        )}

        {/* ── Options zone: fixed at bottom, bg-bg-base, border-top ── */}
        <div className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] px-4 pt-3 pb-0">
          {/* Option buttons: min-h-[52px], full width, 8px gap */}
          <div className="flex flex-col gap-2">
            {currentQuestion.options.map((option, idx) => (
              <OptionButton
                key={option.id}
                label={String.fromCharCode(65 + idx)}
                text={option.text}
                state={getOptionState(option.id)}
                onClick={() => handleSelect(option.id)}
                disabled={isMobileAnswered && getOptionState(option.id) !== 'idle'}
              />
            ))}
          </div>

          {/* ── Action row: 52px fixed height ── */}
          <div className="flex items-center justify-between h-[52px]">
            {/* Prev */}
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={cn(
                'flex items-center gap-1 min-h-[44px] min-w-[44px] t-body-sm transition-colors duration-100 active:scale-[0.98] focus-ring rounded-[6px] px-2',
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : '',
              )}
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              className={cn(
                'flex items-center justify-center min-h-[44px] min-w-[44px] h-9 w-9 rounded-lg transition-colors duration-100 active:scale-[0.98] focus-ring',
              )}
              style={{ color: bookmarked.has(currentQuestion.id) ? 'var(--gold-400)' : 'var(--text-tertiary)' }}
              aria-label="Bookmark question"
            >
              {bookmarked.has(currentQuestion.id) ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>

            {/* Next / Skip */}
            <button
              onClick={isMobileAnswered ? goNext : goSkip}
              disabled={currentIndex >= filteredQuestions.length - 1}
              className={cn(
                'flex items-center gap-1 min-h-[44px] min-w-[44px] t-body-sm font-semibold transition-colors duration-100 active:scale-[0.98] focus-ring rounded-[6px] px-2',
                currentIndex >= filteredQuestions.length - 1
                  ? 'opacity-40 cursor-not-allowed'
                  : '',
              )}
              style={{ color: isMobileAnswered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              {isMobileAnswered ? 'Next' : 'Skip'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
         DESKTOP: Original 3-zone layout
         ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex h-[calc(100vh-52px)] flex-col md:flex-row">
      {/* ═══════════════════════════════════════════
         MAIN COLUMN
         ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Bar (52px) ── */}
        <div className="flex items-center h-[52px] px-4 md:px-6 border-b border-border-subtle flex-shrink-0 gap-4">
          {/* Back link */}
          <Link
            href="/practice"
            className="flex items-center gap-1.5 t-body-sm transition-colors active:scale-[0.98] focus-ring rounded-[6px] px-2 py-1 mr-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Subject pill */}
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-semibold uppercase tracking-wide',
              SUBJECT_COLORS[currentQuestion.subject]?.bg,
              SUBJECT_COLORS[currentQuestion.subject]?.text,
            )}
          >
            {SUBJECT_MAP[currentQuestion.subject]?.labelEn ?? currentQuestion.subject}
          </span>

          {/* Q counter */}
          <span className="t-body-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            Q {currentIndex + 1} <span style={{ color: 'var(--text-faint)' }}>of</span> {filteredQuestions.length}
          </span>

          {/* Progress bar */}
          <div className="flex-1 max-w-xs">
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Sidebar toggle (desktop) */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={cn(
              'hidden md:flex h-8 w-8 items-center justify-center rounded-[6px]',
              'hover:bg-surface-raised',
              'transition-colors duration-100 active:scale-[0.98] focus-ring',
            )}
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ── Question Zone ── */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                variants={questionTransition}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  selectedOptionId={selectedOption}
                  isBookmarked={bookmarked.has(currentQuestion.id)}
                  showExplanation={showExplanation}
                  onOptionSelect={handleSelect}
                  onToggleBookmark={toggleBookmark}
                  onToggleExplanation={toggleExplanation}
                  onNext={goNext}
                  onPrev={goPrev}
                  hasPrev={currentIndex > 0}
                  hasNext={currentIndex < filteredQuestions.length - 1}
                  onSkip={goSkip}
                />
              </motion.div>
            </AnimatePresence>

            {/* Motivational micro-copy — consecutive correct streak (desktop) */}
            <AnimatePresence>
              {consecutiveCorrect >= 5 && selectedOption && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 text-xs font-medium text-amber-300 flex items-center gap-1 justify-center"
                >
                  <Sparkles className="h-3 w-3" />
                  {consecutiveCorrect} in a row! You&apos;re building momentum.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
         RIGHT SIDEBAR (240px, collapsible)
         ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="hidden md:block flex-shrink-0 border-l border-border-subtle bg-surface overflow-hidden"
          >
            <div className="w-[240px] p-4 space-y-6 overflow-y-auto h-full">
              {/* ── Quick Stats ── */}
              <section>
                <h3 className="t-heading-sm mb-3" style={{ color: 'var(--text-faint)' }}>Session Stats</h3>
                <div className="space-y-3">
                  <StatRow icon={<BookOpen className="h-3.5 w-3.5" />} label="Answered" value={`${totalAnswered} / ${filteredQuestions.length}`} />
                  <StatRow icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-400" />} label="Correct" value={String(totalCorrect)} />
                  <StatRow icon={<XCircle className="h-3.5 w-3.5 text-red-400" />} label="Incorrect" value={String(totalAnswered - totalCorrect)} />
                  <StatRow icon={<Target className="h-3.5 w-3.5 text-ink-400" />} label="Accuracy" value={`${accuracy}%`} />
                </div>
              </section>

              <hr className="hairline" />

              {/* ── Difficulty Filter ── */}
              <section>
                <h3 className="t-heading-sm mb-3" style={{ color: 'var(--text-faint)' }}>Difficulty</h3>
                <div className="space-y-1.5">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((d) => {
                    const info = d !== 'all' ? DIFFICULTY_LABELS[d] : null
                    return (
                      <button
                        key={d}
                        onClick={() => setFilterDifficulty(d === 'all' ? null : d)}
                        className={cn(
                          'w-full flex items-center gap-2 t-body-sm rounded-[6px] px-2 py-1.5 transition-colors duration-100',
                          'active:scale-[0.98] focus-ring',
                          filterDifficulty === (d === 'all' ? null : d)
                            ? 'bg-surface-raised'
                            : 'hover:bg-surface-raised/50',
                        )}
                        style={
                          filterDifficulty === (d === 'all' ? null : d)
                            ? { color: 'var(--text-primary)' }
                            : { color: 'var(--text-tertiary)' }
                        }
                      >
                        {d !== 'all' && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((dot) => (
                              <span
                                key={dot}
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  dot <= (info?.dots ?? 0)
                                    ? d === 'easy'
                                      ? 'bg-green-400'
                                      : d === 'medium'
                                        ? 'bg-amber-400'
                                        : 'bg-red-400'
                                    : 'bg-border-subtle',
                                )}
                              />
                            ))}
                          </div>
                        )}
                        {info ? info.label : 'All'}
                      </button>
                    )
                  })}
                </div>
              </section>

              <hr className="hairline" />

              {/* ── Status ── */}
              <section>
                <h3 className="t-heading-sm mb-3" style={{ color: 'var(--text-faint)' }}>Status</h3>
                <div className="space-y-1.5">
                  {[
                    { label: 'Bookmarked', count: bookmarked.size, color: 'text-gold-400' },
                    { label: 'Answered', count: totalAnswered, color: 'text-ink-300' },
                    { label: 'Remaining', count: filteredQuestions.length - totalAnswered, color: '', textStyle: { color: 'var(--text-tertiary)' } },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between t-body-sm px-2 py-1">
                      <span style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
                      <span className={cn('t-mono text-xs', item.color)} style={item.textStyle}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="hairline" />

              {/* ── Keyboard Shortcuts ── */}
              <section>
                <h3 className="t-heading-sm mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
                  <Keyboard className="h-3.5 w-3.5" />
                  Shortcuts
                </h3>
                <div className="space-y-1.5">
                  {[
                    { key: '1 – 4', action: 'Select option' },
                    { key: '→ / L', action: 'Next question' },
                    { key: '← / H', action: 'Previous' },
                    { key: 'E', action: 'Explanation' },
                    { key: 'B', action: 'Bookmark' },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center justify-between px-2 py-0.5">
                      <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>{s.action}</span>
                      <kbd className="font-mono text-[10px] bg-surface-raised px-1.5 py-0.5 rounded-[4px] border border-border-subtle" style={{ color: 'var(--text-faint)' }}>
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      </div>{/* end desktop wrapper */}

      {/* ═══════════════════════════════════════════
         MOBILE: Explanation Sheet
         ═══════════════════════════════════════════ */}
      <ExplanationSheet
        isOpen={explanationSheetOpen}
        onClose={() => setExplanationSheetOpen(false)}
        isCorrect={isCurrentCorrect}
        correctAnswer={correctOptionData?.text}
        explanation={currentQuestion.explanation}
        onNextQuestion={goNext}
        onBookmark={toggleBookmark}
        isBookmarked={bookmarked.has(currentQuestion.id)}
      />
    </>
  )
}

/* ─── Stat Row ─── */
function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
        <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <span className="t-mono text-xs" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

/* ─── Skeleton ─── */
function PracticeDetailSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="fixed inset-0 z-30 flex lg:hidden flex-col pt-14">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex gap-1">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-2 w-2 rounded-full" />
              </div>
            </div>
            <hr className="hairline" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
        <div className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] px-4 pt-3 pb-0">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
            ))}
          </div>
          <div className="flex items-center justify-between h-[52px]">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden lg:flex h-[calc(100vh-52px)] flex-col">
        {/* Top bar skeleton */}
        <div className="flex items-center h-[52px] px-6 border-b border-border-subtle gap-4">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="flex-1 max-w-xs h-1.5" />
        </div>

        {/* Question zone skeleton */}
        <div className="flex-1 px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <hr className="hairline" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
