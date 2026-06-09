'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bookmark, BookmarkX, Play, ChevronDown, ChevronRight, X, Search } from 'lucide-react'
import { useDB } from '@/hooks/useDB'
import { useLongPress } from '@/hooks/useLongPress'
import { initDB } from '@/lib/db/schema'
import { getAllQuestions } from '@/lib/db/questions'
import { LOKSEWA_SUBJECTS, DIFFICULTY_LABELS, SUBJECT_COLORS } from '@/lib/constants'
import type { Question } from '@/types/question'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// ── Difficulty dots ──
function DifficultyPips({ difficulty }: { difficulty: string }) {
  const info = DIFFICULTY_LABELS[difficulty]
  const pips = info?.dots || 1
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((p) => (
        <div
          key={p}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: p <= pips
              ? difficulty === 'easy'
                ? 'var(--green-400)'
                : difficulty === 'medium'
                ? 'var(--amber-400)'
                : 'var(--red-400)'
              : 'var(--border-subtle)',
          }}
        />
      ))}
    </div>
  )
}

export default function BookmarksPage() {
  const { isReady } = useDB()
  const [questions, setQuestions] = useState<Question[]>([])
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // ── Long-press context menu state ──
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    questionId: string
  }>({ visible: false, x: 0, y: 0, questionId: '' })

  const longPressTargetRef = useRef<string>('')

  const dismissContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [])

  const longPressHandlers = useLongPress({
    onLongPress: useCallback(
      (position: { x: number; y: number }) => {
        if (longPressTargetRef.current) {
          setContextMenu({
            visible: true,
            x: position.x,
            y: position.y,
            questionId: longPressTargetRef.current,
          })
        }
      },
      [],
    ),
  })

  const getLongPressHandlers = useCallback(
    (questionId: string) => ({
      onPointerDown: (e: React.PointerEvent) => {
        longPressTargetRef.current = questionId
        longPressHandlers.onPointerDown(e)
      },
      onPointerMove: longPressHandlers.onPointerMove,
      onPointerUp: longPressHandlers.onPointerUp,
      onPointerCancel: longPressHandlers.onPointerCancel,
    }),
    [longPressHandlers],
  )

  // ── Load bookmarks + questions ──
  const loadBookmarked = useCallback(async () => {
    try {
      const db = await initDB()
      const bookmarks = await db.getAll('bookmarks')
      if (bookmarks.length === 0) {
        setQuestions([])
        return
      }
      const allQ = await getAllQuestions()
      const bookmarkIds = new Set(bookmarks.map((b) => b.questionId))
      setQuestions(allQ.filter((q) => bookmarkIds.has(q.id)))
    } catch {
      // Fallback: try localStorage
      try {
        const bookmarkIds: string[] = JSON.parse(localStorage.getItem('akal_bookmarks') || '[]')
        if (bookmarkIds.length === 0) {
          setQuestions([])
          return
        }
        const allQ = await getAllQuestions()
        setQuestions(allQ.filter((q) => bookmarkIds.includes(q.id)))
      } catch {
        setQuestions([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isReady) loadBookmarked()
  }, [isReady, loadBookmarked])

  // ── Remove bookmark ──
  const removeBookmark = async (questionId: string) => {
    try {
      const db = await initDB()
      await db.delete('bookmarks', questionId)
    } catch {
      // Fallback: localStorage
      try {
        const bookmarkIds: string[] = JSON.parse(localStorage.getItem('akal_bookmarks') || '[]')
        localStorage.setItem('akal_bookmarks', JSON.stringify(bookmarkIds.filter((id) => id !== questionId)))
      } catch { /* best effort */ }
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    toast.success('Bookmark removed')
  }

  // ── Filter ──
  const filtered = questions.filter((q) => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSubject !== 'all' && q.subject !== filterSubject) return false
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false
    return true
  })

  // ── Group by subject ──
  const groupedBySubject: Record<string, Question[]> = {}
  for (const q of filtered) {
    const key = q.subject
    if (!groupedBySubject[key]) groupedBySubject[key] = []
    groupedBySubject[key].push(q)
  }
  const subjectOrder = Object.keys(groupedBySubject).sort()

  // ── Toggle collapse ──
  const toggleCollapse = (subject: string) => {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  // ── Loading ──
  if (!isReady || loading) {
    return (
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-6">
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </motion.div>
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </motion.div>
        <motion.div variants={fadeUp} className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[10px]" />
          ))}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <h1 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>Bookmarks</h1>
        <Badge className="t-caption bg-ink-500/15 text-ink-300 border-0 rounded-full px-2.5">
          {questions.length}
        </Badge>
      </motion.div>

      {/* ── Mobile: Practice All Button ── */}
      {questions.length > 0 && (
        <Link href="/practice" className="block md:hidden">
          <motion.div variants={fadeUp}>
            <button className="w-full h-12 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform" style={{ background: 'var(--ink-500)', color: '#fff' }}>
              <Play className="h-4 w-4" />
              Practice All ({questions.length})
            </button>
          </motion.div>
        </Link>
      )}

      {/* ── Mobile: Filter Chips (horizontal scroll) ── */}
      <motion.div variants={fadeUp} className="md:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilterSubject('all')}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            background: filterSubject === 'all' ? 'var(--ink-500)' : 'var(--bg-raised)',
            color: filterSubject === 'all' ? '#fff' : 'var(--text-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          All
        </button>
        {LOKSEWA_SUBJECTS.filter((s) => groupedBySubject[s.id]).map((s) => (
          <button
            key={s.id}
            onClick={() => setFilterSubject(s.id)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: filterSubject === s.id ? 'var(--ink-500)' : 'var(--bg-raised)',
              color: filterSubject === s.id ? '#fff' : 'var(--text-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {s.labelEn}
          </button>
        ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search bookmarks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ink-400 transition-shadow"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Subject filter */}
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[180px] h-10 text-sm rounded-[10px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {LOKSEWA_SUBJECTS.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.labelEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty filter */}
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[140px] h-10 text-sm rounded-[10px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="very-hard">Very Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Practice from bookmarks */}
        {questions.length > 0 && (
          <Link href="/practice">
            <Button className="btn-press gap-2 bg-gold-400 hover:bg-gold-500 text-ink-950 font-semibold rounded-[10px] h-10">
              <Play className="h-4 w-4" />
              Start Practice
            </Button>
          </Link>
        )}
      </motion.div>

      {/* ── List ── */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
            <p className="t-heading-md" style={{ color: 'var(--text-secondary)' }}>
              No bookmarks yet
            </p>
            <p className="t-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Press B while practicing to bookmark questions.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {subjectOrder.map((subjectKey) => {
              const subjectInfo = LOKSEWA_SUBJECTS.find((s) => s.id === subjectKey)
              const subjectQs = groupedBySubject[subjectKey]
              const isCollapsed = collapsedSubjects.has(subjectKey)
              const subjectColor = SUBJECT_COLORS[subjectKey] || { bg: 'bg-ink-500/15', text: 'text-ink-300' }

              return (
                <div key={subjectKey}>
                  {/* Subject header */}
                  <button
                    onClick={() => toggleCollapse(subjectKey)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--bg-raised)]"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--text-faint)' }} />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--text-faint)' }} />
                    )}
                    <span className="t-heading-sm" style={{ color: 'var(--text-secondary)' }}>
                      {subjectInfo?.labelEn || subjectKey}
                    </span>
                    <Badge className="t-caption border-0 rounded-full px-2" style={{ background: 'var(--bg-raised)', color: 'var(--text-faint)' }}>
                      {subjectQs.length}
                    </Badge>
                  </button>

                  {/* Questions under subject */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pr-1 space-y-0.5 pb-2">
                          {subjectQs.map((q) => {
                            const diffInfo = DIFFICULTY_LABELS[q.difficulty]
                            const correctIdx = q.options?.findIndex((o) => o.isCorrect)
                            const correctLabel = correctIdx !== undefined && correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : ''
                            return (
                              <ContextMenu key={q.id}>
                                <ContextMenuTrigger asChild>
                                  <div
                                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-3 py-4 md:py-2.5 rounded-lg transition-colors group hover:bg-[var(--bg-raised)] select-none"
                                    style={{ border: '1px solid var(--border-subtle)' }}
                                    {...getLongPressHandlers(q.id)}
                                  >
                                    {/* Left: pips + badge (same on both) */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <DifficultyPips difficulty={q.difficulty} />
                                      <Badge className="t-caption border-0 px-1.5 py-0 rounded-[4px]" style={{ fontSize: 10 }}>
                                        <span className={subjectColor.text}>{subjectInfo?.labelEn || q.subject}</span>
                                      </Badge>
                                    </div>

                                    {/* Center: question text - full on mobile, truncated on desktop */}
                                    <p className="t-body-sm flex-1 min-w-0 md:truncate" style={{ color: 'var(--text-primary)' }}>
                                      {q.text.substring(0, 120)}
                                    </p>

                                    {/* Mobile: Correct answer + actions row */}
                                    <div className="md:hidden flex flex-col gap-1.5 pl-6 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                      {correctLabel && (
                                        <p className="t-caption font-medium" style={{ color: 'var(--gold-400)' }}>
                                          Correct answer: {correctLabel}
                                        </p>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <Link href={`/practice/${q.id}`} className="t-body-sm font-medium" style={{ color: 'var(--ink-300)' }}>
                                          Practice this
                                        </Link>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); removeBookmark(q.id) }}
                                          className="t-body-sm transition-colors"
                                          style={{ color: 'var(--text-faint)' }}
                                        >
                                          Remove ×
                                        </button>
                                      </div>
                                    </div>

                                    {/* Desktop: actions (same as before) */}
                                    <div className="hidden md:flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => removeBookmark(q.id)}
                                        className="h-7 w-7 flex items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-red-500/10 transition-all"
                                        title="Remove bookmark"
                                      >
                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--red-400)' }} />
                                      </button>
                                      <Link href={`/practice/${q.id}`}>
                                        <button
                                          className="h-7 px-2 flex items-center gap-1 rounded-md text-xs transition-colors hover:bg-ink-500/15"
                                          style={{ color: 'var(--ink-300)' }}
                                        >
                                          <Play className="h-3 w-3" />
                                          Practice
                                        </button>
                                      </Link>
                                    </div>
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                  <ContextMenuItem
                                    onClick={() => removeBookmark(q.id)}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove Bookmark
                                  </ContextMenuItem>
                                  <ContextMenuItem asChild>
                                    <Link href={`/practice/${q.id}`}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Practice This Question
                                    </Link>
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ── Mobile long-press floating context menu ── */}
      <AnimatePresence>
        {contextMenu.visible && (
          <>
            {/* Backdrop – tap to dismiss */}
            <motion.div
              className="fixed inset-0 z-50"
              onClick={dismissContextMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            {/* Menu panel */}
            <motion.div
              className="fixed z-50 min-w-40 rounded-xl border shadow-xl overflow-hidden"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex flex-col">
                <Link
                  href={`/practice/${contextMenu.questionId}`}
                  className="flex items-center h-10 px-4 text-sm transition-colors hover:bg-[var(--bg-raised)]"
                  style={{ color: 'var(--ink-300)' }}
                  onClick={dismissContextMenu}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Practice this question
                </Link>
                <button
                  className="flex items-center h-10 px-4 text-sm transition-colors hover:bg-red-500/10"
                  style={{ color: 'var(--red-400)' }}
                  onClick={() => {
                    removeBookmark(contextMenu.questionId)
                    dismissContextMenu()
                  }}
                >
                  <BookmarkX className="h-4 w-4 mr-2" />
                  Remove bookmark
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
