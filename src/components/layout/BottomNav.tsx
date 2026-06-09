'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, ClipboardList, BarChart2, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLayoutStore } from '@/stores/layoutStore'
import type { LucideIcon } from 'lucide-react'

/* ─── Nav item definition ─── */
interface NavItemDef {
  label: string
  href: string
  icon: LucideIcon
  center?: boolean
}

const NAV_ITEMS: NavItemDef[] = [
  { label: 'HOME',    href: '/dashboard', icon: LayoutDashboard },
  { label: 'PRACTICE', href: '/practice',  icon: BookOpen },
  { label: 'TEST',    href: '/test',      icon: ClipboardList, center: true },
  { label: 'PROGRESS', href: '/analytics', icon: BarChart2 },
  { label: 'PROFILE', href: '/profile',   icon: User },
]

/* ─── Haptic tap helper ─── */
function hapticTap() {
  try {
    navigator.vibrate?.(8)
  } catch {}
}

/* ─── Active indicator line (shared layoutId for sliding animation) ─── */
function ActiveIndicator({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <motion.div
      layoutId="bottom-nav-indicator"
      className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
      style={{ background: 'var(--ink-400)' }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    />
  )
}

/* ─── Standard nav item ─── */
function StandardItem({ item, isActive, badge }: { item: NavItemDef; isActive: boolean; badge?: number }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      prefetch
      onClick={hapticTap}
      className="relative flex flex-col items-center justify-center h-full flex-1"
    >
      <ActiveIndicator active={isActive} />
      <div className="relative">
        <Icon
          className="w-[22px] h-[22px] transition-colors duration-200"
          strokeWidth={1.5}
          style={{ color: isActive ? 'var(--ink-400)' : 'var(--text-tertiary)' }}
        />
        {badge != null && badge > 0 && (
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--gold-400)' }}
            aria-label={`${badge} bookmarks`}
          />
        )}
      </div>
      <span
        className="text-[10px] font-medium tracking-widest mt-1 transition-colors duration-200"
        style={{ color: isActive ? 'var(--ink-300)' : 'var(--text-faint)' }}
      >
        {item.label}
      </span>
    </Link>
  )
}

/* ─── Center (elevated) nav item ─── */
function CenterItem({ item, isActive }: { item: NavItemDef; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      prefetch
      onClick={hapticTap}
      className="relative flex flex-col items-center justify-center h-full flex-1 -mt-5"
    >
      <ActiveIndicator active={isActive} />
      <div
        className="flex items-center justify-center w-12 h-12 rounded-[20px] shadow-[0_4px_12px_rgba(232,168,19,0.4)] transition-transform duration-200 active:scale-95"
        style={{ background: 'var(--gold-400)' }}
      >
        <Icon
          className="w-[22px] h-[22px]"
          strokeWidth={1.5}
          style={{ color: 'var(--ink-950)' }}
        />
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BottomNav — Main Export
   ═══════════════════════════════════════════════════════════════ */
export function BottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const focusMode = useLayoutStore((s) => s.focusMode)

  // Bookmark count for badge (read from IndexedDB)
  const [bookmarkCount, setBookmarkCount] = React.useState(0)
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const db = await import('@/lib/db/schema').then(m => m.getDBAsync())
        if (!db || cancelled) return
        const all = await db.getAll('bookmarks')
        if (!cancelled) setBookmarkCount(all.length)
      } catch {}
    }
    if (isMobile) load()
    return () => { cancelled = true }
  }, [isMobile])

  // Guard: only render on mobile-sized viewports
  if (!isMobile) return null

  // Hide bottom nav during focus mode (e.g. active test)
  if (focusMode) return null

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Mobile navigation"
    >
      {/* Glass bar */}
      <div
        className="h-16 flex items-stretch border-t"
        style={{
          background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          borderTopColor: 'var(--border-subtle)',
        }}
      >
        {NAV_ITEMS.map((item) =>
          item.center ? (
            <CenterItem
              key={item.label}
              item={item}
              isActive={isActive(item.href)}
            />
          ) : (
            <StandardItem
              key={item.label}
              item={item}
              isActive={isActive(item.href)}
              badge={item.label === 'PRACTICE' ? bookmarkCount : undefined}
            />
          ),
        )}
      </div>
    </nav>
  )
}
