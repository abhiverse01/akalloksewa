'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { UserAvatar } from '@/components/user/UserAvatar'

/* ─── Breadcrumb builder with friendly labels ─── */
const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  practice: 'Practice',
  analytics: 'Analytics',
  bookmarks: 'Bookmarks',
  settings: 'Settings',
  profile: 'Profile',
  syllabus: 'Syllabus',
  leaderboard: 'Leaderboard',
  notes: 'Notes',
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return [{ label: 'Dashboard', href: '/dashboard', isLast: true }]

  return segments.map((seg, i) => ({
    label: LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))
}

/* ─── Detect platform for shortcut label ─── */
function useShortcutLabel() {
  return useMemo(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
    return isMac ? '⌘K' : 'Ctrl+K'
  }, [])
}

export function AppHeader() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const breadcrumbs = getBreadcrumbs(pathname)
  const shortcutLabel = useShortcutLabel()

  const streak = user?.stats?.currentStreak ?? 0
  const displayName = user?.displayName || 'User'
  const avatarColor = user?.avatarColor || 'ink'

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-background flex-shrink-0">
      {/* LEFT: Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <span className="text-[var(--text-faint)] mx-0.5">/</span>
            )}
            {crumb.isLast ? (
              <span className="text-foreground font-medium truncate" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <a
                href={crumb.href}
                className="text-[var(--text-tertiary)] truncate hover:text-[var(--text-secondary)] transition-colors"
              >
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      {/* CENTER: Search trigger — visible on all screens */}
      <button
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
        className="flex items-center gap-2.5 h-9 w-[140px] sm:w-[280px] md:w-[320px] max-w-[40vw] px-3 rounded-md bg-secondary border border-border text-[var(--text-tertiary)] text-sm hover:border-[var(--border-default)] transition-colors cursor-pointer"
        aria-label="Search questions"
      >
        <Search className="size-3.5 flex-shrink-0" />
        <span className="truncate hidden sm:inline">Search questions...</span>
        <kbd className="ml-auto text-[10px] text-[var(--text-faint)] font-mono bg-background px-1.5 py-0.5 rounded-sm border border-border hidden md:inline-block">
          {shortcutLabel}
        </kbd>
      </button>

      {/* RIGHT: Streak + User */}
      <div className="flex items-center gap-3">
        {/* Streak badge */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gold-400">🔥</span>
            <span className="text-gold-400 font-medium">{streak}</span>
          </div>
        )}

        {/* User avatar — consistent with Sidebar */}
        <UserAvatar
          displayName={displayName}
          avatarColor={avatarColor}
          size="sm"
        />
      </div>
      <SearchCommand />
    </header>
  )
}
