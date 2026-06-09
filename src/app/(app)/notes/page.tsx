'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  MoreVertical,
  StickyNote,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Code,
  Quote,
  Clock,
  Check,
} from 'lucide-react'
import { useDB } from '@/hooks/useDB'
import { getAllNotes, saveNote, deleteNote } from '@/lib/db/notes'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'
import type { Note } from '@/lib/db/schema'
import { toast } from 'sonner'

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

type FilterMode = 'all' | 'pinned'

// ── Editor toolbar command ──
function execFormatCommand(command: string, value?: string) {
  document.execCommand(command, false, value || undefined)
}

// ── Word count helper ──
function countWords(html: string): number {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Format relative time ──
function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 5000) return 'just now'
  if (diff < 60000) return 'less than a minute ago'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function NotesPage() {
  const { isReady } = useDB()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingSubject, setEditingSubject] = useState<string>('')
  const [isPinned, setIsPinned] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showMobileEditor, setShowMobileEditor] = useState(false)
  const [showSavedChip, setShowSavedChip] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedNote = notes.find((n) => n.id === selectedId) || null

  // ── Load notes ──
  const loadNotes = useCallback(async () => {
    try {
      const allNotes = await getAllNotes()
      setNotes(allNotes.sort((a, b) => {
        // Pinned first, then by updatedAt
        const aPinned = a.tags.includes('pinned') ? 1 : 0
        const bPinned = b.tags.includes('pinned') ? 1 : 0
        if (aPinned !== bPinned) return bPinned - aPinned
        return b.updatedAt - a.updatedAt
      }))
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isReady) loadNotes()
  }, [isReady, loadNotes])

  // ── Sync editing state with selected note ──
  useEffect(() => {
    if (selectedNote) {
      setEditingTitle(selectedNote.title)
      setEditingContent(selectedNote.content)
      setEditingSubject(selectedNote.subject || '')
      setIsPinned(selectedNote.tags.includes('pinned'))
    }
  }, [selectedNote])

  // ── Debounced save ──
  const autoSave = useCallback(() => {
    if (!selectedNote) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      const updated: Note = {
        ...selectedNote,
        title: editingTitle,
        content: editorRef.current?.innerHTML || editingContent,
        subject: editingSubject as Note['subject'],
        tags: isPinned ? [...selectedNote.tags.filter((t) => t !== 'pinned'), 'pinned'] : selectedNote.tags.filter((t) => t !== 'pinned'),
        updatedAt: Date.now(),
      }
      try {
        await saveNote(updated)
        setSaveStatus('saved')
        setShowSavedChip(true)
        setTimeout(() => setShowSavedChip(false), 1500)
        setNotes((prev) => {
          const idx = prev.findIndex((n) => n.id === updated.id)
          if (idx === -1) return prev
          const copy = [...prev]
          copy[idx] = updated
          return copy.sort((a, b) => {
            const aPinned = a.tags.includes('pinned') ? 1 : 0
            const bPinned = b.tags.includes('pinned') ? 1 : 0
            if (aPinned !== bPinned) return bPinned - aPinned
            return b.updatedAt - a.updatedAt
          })
        })
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        toast.error('Failed to save note')
        setSaveStatus('idle')
      }
    }, 1000)
  }, [selectedNote, editingTitle, editingContent, editingSubject, isPinned])

  // ── Create note ──
  const handleCreate = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    try {
      await saveNote(newNote)
      setNotes((prev) => [newNote, ...prev])
      setSelectedId(newNote.id)
      setShowMobileEditor(true)
    } catch {
      toast.error('Failed to create note')
    }
  }

  // ── Delete note ──
  const handleDelete = async (id: string) => {
    await deleteNote(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) setSelectedId(null)
    setDeleteTarget(null)
    toast.success('Note deleted')
  }

  // ── Editor content change ──
  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditingContent(editorRef.current.innerHTML)
    }
    autoSave()
  }

  // ── Filtering ──
  const filtered = notes.filter((n) => {
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'pinned' && n.tags.includes('pinned'))
    const matchSubject = filterSubject === 'all' || n.subject === filterSubject
    return matchSearch && matchFilter && matchSubject
  })

  // ── Strip HTML for snippet ──
  function stripHtml(html: string): string {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return (tmp.textContent || '').substring(0, 80)
  }

  // ── Loading skeleton ──
  if (!isReady || loading) {
    return (
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }}>
        <div className="flex h-[calc(100vh-140px)] rounded-[14px] border border-[var(--border-subtle)] overflow-hidden">
          {/* Left panel skeleton */}
          <div className="w-0 md:w-[280px] shrink-0 border-r border-[var(--border-subtle)] p-4 space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
          {/* Right panel skeleton */}
          <div className="flex-1 hidden md:block p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
      className="flex flex-col md:flex-row h-[calc(100vh-140px)] rounded-[14px] border border-[var(--border-subtle)] overflow-hidden"
    >
      {/* ══════════════════════════════════════════════════════════════
          LEFT PANEL — Note List
         ══════════════════════════════════════════════════════════════ */}
      <div
        className={`shrink-0 border-r border-[var(--border-subtle)] flex flex-col ${
          showMobileEditor ? 'hidden md:flex' : 'flex'
        }`}
        style={{ width: 280, background: 'var(--bg-surface)' }}
      >
        {/* Top bar */}
        <div className="p-4 hairline-b flex items-center justify-between">
          <h2 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>Notes</h2>
          <Button
            onClick={handleCreate}
            className="btn-press gap-1.5 bg-ink-500 hover:bg-ink-600 text-white rounded-lg h-8 px-3 t-caption"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--text-faint)' }} />
            <Input
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm rounded-lg"
              style={{ background: 'var(--ink-800)', borderColor: 'var(--border-subtle)' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 pt-2 flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className="t-caption px-2.5 py-1 rounded-md transition-colors"
            style={{
              background: filter === 'all' ? 'var(--ink-500)' : 'var(--bg-raised)',
              color: filter === 'all' ? '#fff' : 'var(--text-tertiary)',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className="t-caption px-2.5 py-1 rounded-md transition-colors"
            style={{
              background: filter === 'pinned' ? 'var(--ink-500)' : 'var(--bg-raised)',
              color: filter === 'pinned' ? '#fff' : 'var(--text-tertiary)',
            }}
          >
            <Pin className="h-3 w-3 inline mr-1" />
            Pinned
          </button>
        </div>

        {/* Note list */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <StickyNote className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
                <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No notes yet. Create one to get started.
                </p>
              </div>
            ) : (
              filtered.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedId(note.id)
                    setShowMobileEditor(true)
                  }}
                  className="w-full text-left p-2.5 lg:p-2.5 py-4 lg:py-2.5 rounded-lg mb-0.5 transition-colors group"
                  style={{
                    background: selectedId === note.id ? 'rgba(37, 64, 160, 0.08)' : 'transparent',
                    borderLeft: selectedId === note.id ? '2px solid var(--ink-400)' : '2px solid transparent',
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="t-heading-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                      {note.title}
                    </span>
                    {note.tags.includes('pinned') && (
                      <Pin className="h-3 w-3 shrink-0" style={{ color: 'var(--gold-400)' }} />
                    )}
                  </div>
                  <p className="t-caption mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {stripHtml(note.content) || 'Empty note'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {note.subject && (
                      <Badge className="t-caption px-1.5 py-0 border-0 bg-ink-500/15 text-ink-300 rounded-[4px]" style={{ fontSize: 10 }}>
                        {LOKSEWA_SUBJECTS.find((s) => s.id === note.subject)?.labelEn || note.subject}
                      </Badge>
                    )}
                    <span className="t-caption ml-auto" style={{ color: 'var(--text-faint)', fontSize: 10 }}>
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT PANEL — Editor
         ══════════════════════════════════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          showMobileEditor ? 'flex' : 'hidden md:flex'
        }`}
        style={{ background: 'var(--bg-base)' }}
      >
        {selectedNote ? (
          <>
            {/* ── Top bar ── */}
            <div className="hairline-b px-4 py-3 flex items-center gap-2">
              {/* Mobile auto-save chip */}
              <AnimatePresence>
                {showSavedChip && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'var(--green-400)', color: 'var(--ink-950)' }}
                  >
                    <Check className="h-3 w-3" />
                    Saved
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Mobile back button */}
              <button
                className="md:hidden mr-1 p-1 rounded-md hover:bg-[var(--bg-raised)] transition-colors"
                onClick={() => setShowMobileEditor(false)}
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <Input
                value={editingTitle}
                onChange={(e) => {
                  setEditingTitle(e.target.value)
                  autoSave()
                }}
                className="flex-1 h-8 border-0 bg-transparent text-base font-semibold p-0 focus-visible:ring-0"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Note title…"
              />

              <Select value={editingSubject} onValueChange={(v) => {
                setEditingSubject(v)
                autoSave()
              }}>
                <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No subject</SelectItem>
                  {LOKSEWA_SUBJECTS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={() => {
                  setIsPinned(!isPinned)
                  autoSave()
                }}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-raised)]"
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                {isPinned ? (
                  <Pin className="h-4 w-4" style={{ color: 'var(--gold-400)' }} />
                ) : (
                  <PinOff className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-raised)]">
                    <MoreVertical className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(selectedNote.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ── Toolbar (pushed to bottom on mobile, above keyboard) ── */}
            <div className="hairline-b px-4 py-1.5 flex items-center gap-0.5 overflow-x-auto lg:mt-0 mt-auto lg:sticky static bottom-0 z-10 lg:z-0 shrink-0" style={{ background: 'var(--bg-base)' }}>
              {[
                { icon: Bold, cmd: 'bold', label: 'Bold' },
                { icon: Italic, cmd: 'italic', label: 'Italic' },
                { icon: Underline, cmd: 'underline', label: 'Underline' },
                { icon: null, cmd: null, label: null, divider: true },
                { icon: Heading1, cmd: 'formatBlock', value: 'H1', label: 'H1' },
                { icon: Heading2, cmd: 'formatBlock', value: 'H2', label: 'H2' },
                { icon: null, cmd: null, label: null, divider: true },
                { icon: List, cmd: 'insertUnorderedList', label: 'List' },
                { icon: Code, cmd: 'formatBlock', value: 'PRE', label: 'Code' },
                { icon: Quote, cmd: 'formatBlock', value: 'BLOCKQUOTE', label: 'Quote' },
              ].map((item, i) => {
                if ('divider' in item && item.divider) {
                  return (
                    <div key={`d-${i}`} className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />
                  )
                }
                const Icon = item.icon!
                return (
                  <button
                    key={item.cmd}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (item.value) {
                        execFormatCommand(item.cmd!, item.value)
                      } else {
                        execFormatCommand(item.cmd!)
                      }
                      handleEditorInput()
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-raised)]"
                    title={item.label || ''}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>

            {/* ── ContentEditable editor ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="t-body min-h-full outline-none leading-relaxed prose prose-sm prose-invert max-w-none"
                style={{ color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: editingContent }}
              />
            </div>

            {/* ── Footer ── */}
            <div className="hairline-t px-4 py-2 flex items-center justify-between">
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
                {countWords(editingContent)} words
              </span>
              <span className="t-caption flex items-center gap-1" style={{ color: saveStatus === 'saved' ? 'var(--green-400)' : 'var(--text-faint)' }}>
                {saveStatus === 'saving' && (
                  <>
                    <Clock className="h-3 w-3" />
                    Saving…
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-3 w-3" />
                    Saved {formatRelativeTime(Date.now())}
                  </>
                )}
              </span>
            </div>
          </>
        ) : (
          /* ── Empty state (no note selected) ── */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <StickyNote className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
              <p className="t-heading-md" style={{ color: 'var(--text-secondary)' }}>
                Select a note or create one
              </p>
              <p className="t-body-sm mt-1 mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Pick a note from the list or start writing
              </p>
              <Button
                onClick={handleCreate}
                className="btn-press gap-2 bg-gold-400 hover:bg-gold-500 text-ink-950 font-semibold rounded-[10px]"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The note will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── FAB: Mobile New Note Button ── */}
      <button
        onClick={handleCreate}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform duration-150 active:scale-95"
        style={{ background: 'var(--gold-400)', color: 'var(--ink-950)' }}
        aria-label="Create new note"
      >
        <Plus className="h-6 w-6" />
      </button>
    </motion.div>
  )
}
