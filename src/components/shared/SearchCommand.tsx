'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Search, BookOpen, BarChart3, StickyNote, Bookmark, Settings, Home } from 'lucide-react'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'

const pages = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Practice', icon: BookOpen, href: '/practice' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Notes', icon: StickyNote, href: '/notes' },
  { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

// Singleton open control — lets any component trigger the search dialog
let externalOpenSetter: ((v: boolean) => void) | null = null

/** Programmatically open the search dialog (for mobile trigger buttons) */
export function openSearchDialog() {
  externalOpenSetter?.(true)
}

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Register the setter so external callers can open the dialog
  useEffect(() => {
    externalOpenSetter = setOpen
    return () => { externalOpenSetter = null }
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search subjects, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem
              key={p.href}
              value={p.label}
              onSelect={() => {
                router.push(p.href)
                setOpen(false)
              }}
            >
              <p.icon className="mr-2 h-4 w-4" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Subjects">
          {LOKSEWA_SUBJECTS.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.labelEn} ${s.label}`}
              onSelect={() => {
                router.push(`/syllabus?subject=${s.id}`)
                setOpen(false)
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>{s.labelEn}</span>
              <span className="ml-1 text-xs" style={{ color: 'var(--text-faint)' }}>{s.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
