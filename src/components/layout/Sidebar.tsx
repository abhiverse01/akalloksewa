'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, ClipboardList, Map, StickyNote,
  Bookmark, BarChart2, Trophy, Database, Settings,
  ChevronLeft, ChevronRight, Menu, User, LogOut, CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, PSC_EXAM_DATE } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { useLayoutStore } from '@/stores/layoutStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserAvatar } from '@/components/user/UserAvatar'
import { Switch } from '@/components/ui/switch'
import { useSessionTimerContext } from '@/contexts/SessionTimerContext'

/* ─── Logo Mark: Uses dark theme logo for dark sidebar ─── */
function LogoMark({ size = 24 }: { size?: number }) {
  return <Image src="/logo-dark-32.png" alt="AkalLoksewa" width={size} height={size} className="rounded-md object-contain" />
}

/* ─── Navigation data ─── */
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'PREPARE',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Practice Mode', href: '/practice', icon: <BookOpen className="size-4" /> },
      { label: 'Mock Tests', href: '/test', icon: <ClipboardList className="size-4" /> },
    ],
  },
  {
    label: 'STUDY',
    items: [
      { label: 'Syllabus', href: '/syllabus', icon: <Map className="size-4" /> },
      { label: 'Study Plan', href: '/study-plan', icon: <CalendarDays className="size-4" /> },
      { label: 'Notes', href: '/notes', icon: <StickyNote className="size-4" /> },
      { label: 'Bookmarks', href: '/bookmarks', icon: <Bookmark className="size-4" /> },
    ],
  },
  {
    label: 'TRACK',
    items: [
      { label: 'Analytics', href: '/analytics', icon: <BarChart2 className="size-4" /> },
      { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="size-4" /> },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { label: 'Ingestor', href: '/ingestor', icon: <Database className="size-4" /> },
    ],
  },
]

/* ─── Nav Item Button ─── */
function NavLink({
  item, collapsed, isActive,
}: { item: NavItem; collapsed: boolean; isActive: boolean }) {
  const [hovered, setHovered] = React.useState(false)

  const link = (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'flex items-center gap-3 h-9 px-3 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-ink-800 border-l-2 border-ink-400 text-foreground shadow-[inset_0_0_12px_rgba(37,64,160,0.15)]'
            : hovered
            ? 'border-l-2 border-ink-700 text-foreground bg-ink-800/50'
            : 'border-l-2 border-transparent text-muted-foreground hover:bg-ink-800/30 hover:text-foreground',
          collapsed && 'justify-center px-0 border-l-0'
        )}
      >
        <span className={cn(
          'flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-ink-300' : hovered ? 'text-ink-300' : 'text-[var(--text-tertiary)]'
        )}>
          {item.icon}
        </span>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate text-sm font-medium"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return link
}

/* ─── Sidebar Inner Content ─── */
function SidebarContent({
  collapsed,
  onToggleCollapse,
  mobile = false,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
  mobile?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const focusMode = useLayoutStore((s) => s.focusMode)
  const toggleFocusMode = useLayoutStore((s) => s.toggleFocusMode)
  const lockIn = useLayoutStore((s) => s.lockInMode)
  const toggleLockIn = useLayoutStore((s) => s.toggleLockIn)
  const { elapsed } = useSessionTimerContext()
  const [showSignOutDialog, setShowSignOutDialog] = React.useState(false)

  const handleSignOut = useCallback(async () => {
    setShowSignOutDialog(false)
    await useAuthStore.getState().logout()
    router.push('/auth/login')
  }, [router])

  return (
    <div className="flex h-full flex-col">
      {/* ── [1] Logo Zone ── */}
      <div className="relative flex h-14 items-center gap-2.5 px-3 hairline-b border-b border-border">
        <LogoMark />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-foreground">
                {APP_NAME}
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Collapse button with rotation animation */}
        <motion.button
          onClick={onToggleCollapse}
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'flex items-center justify-center size-7 rounded-md',
            'text-[var(--text-tertiary)] hover:bg-ink-800 hover:text-foreground transition-all duration-200',
            collapsed && 'right-1/2 translate-x-1/2'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="size-3.5" />
        </motion.button>
      </div>

      {/* ── [2] Exam Countdown Widget ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3"
          >
            <div className="rounded-xl border border-border bg-ink-800 p-3">
              <p className="t-caption text-[var(--text-faint)]">Next PSC Exam</p>
              <motion.p
                className="t-heading-md text-gold-400 mt-0.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {PSC_EXAM_DATE.daysRemaining} days
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── [3] Nav Groups ── */}
      <ScrollArea className="flex-1 px-3 pt-2">
        <div className="space-y-4">
          {NAV_GROUPS.map((group, gIdx) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gIdx * 0.05, duration: 0.2 }}
            >
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-1 t-caption text-[var(--text-faint)] uppercase tracking-wide"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const navEl = <NavLink key={item.label} item={item} collapsed={collapsed} isActive={isActive} />
                  return mobile ? (
                    <SheetClose key={item.label} asChild>{navEl}</SheetClose>
                  ) : (
                    navEl
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* ── [4] Bottom Zone ── */}
      <div className="mt-auto px-3 pb-4">
        {/* Subtle gradient divider line */}
        <div
          className="h-px w-full mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border-default), transparent)' }}
        />
        <div className="space-y-2">
        {/* Streak widget (expanded only) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            >
              <motion.span
                className="text-sm"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                🔥
              </motion.span>
              <span className="text-sm text-gold-400 font-medium">
                {user?.stats?.currentStreak || 0} day streak
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus Mode toggle (expanded only) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
            >
              <div className={cn('size-2 rounded-full', focusMode ? 'bg-amber-400' : 'bg-muted-foreground/40')} />
              <span className="text-sm text-muted-foreground flex-1">Focus Mode</span>
              <Switch checked={focusMode} onCheckedChange={toggleFocusMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lock In toggle (expanded only) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
            >
              <div className={cn('size-2 rounded-full', lockIn ? 'bg-[var(--gold-400)]' : 'bg-muted-foreground/40')} />
              <span className="text-sm text-muted-foreground flex-1">Lock In</span>
              <Switch checked={lockIn} onCheckedChange={toggleLockIn} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session timer (expanded only) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1 rounded-lg"
            >
              <span className="t-caption text-[var(--text-faint)]">
                Today: {elapsed}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings link */}
        <SettingsLink collapsed={collapsed} isActive={pathname === '/settings'} />

        {/* User row with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-2.5 pt-1 w-full text-left rounded-lg transition-colors duration-200',
                'hover:bg-ink-800/50',
                collapsed && 'justify-center'
              )}
              aria-label="User menu"
            >
              <UserAvatar
                displayName={user?.displayName || 'User'}
                avatarColor={user?.avatarColor || 'ink'}
                size="sm"
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <span className="text-[13px] text-muted-foreground truncate block leading-tight">
                      {user?.displayName || 'User'}
                    </span>
                    <span className="text-[11px] text-[var(--text-faint)] truncate block leading-tight">
                      @{user?.username || 'user'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            sideOffset={8}
            align={collapsed ? 'center' : 'start'}
            className="w-48 bg-background border-border"
          >
            <DropdownMenuLabel className="text-muted-foreground">
              {user?.displayName || 'User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="text-muted-foreground focus:text-foreground cursor-pointer">
                <User className="size-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-muted-foreground focus:text-foreground cursor-pointer">
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-300 cursor-pointer"
              onClick={() => setShowSignOutDialog(true)}
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? Your progress is saved locally in your browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-red-500 text-white hover:bg-red-400 cursor-pointer"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Settings Link ─── */
function SettingsLink({ collapsed, isActive }: { collapsed: boolean; isActive: boolean }) {
  const link = (
    <Link
      href="/settings"
      className={cn(
        'flex items-center gap-3 h-9 px-3 rounded-lg transition-all duration-200',
        isActive
          ? 'bg-ink-800 border-l-2 border-ink-400 text-foreground shadow-[inset_0_0_12px_rgba(37,64,160,0.15)]'
          : 'border-l-2 border-transparent text-muted-foreground hover:bg-ink-800/50 hover:text-foreground',
        collapsed && 'justify-center px-0 border-l-0'
      )}
    >
      <Settings className="size-4 text-[var(--text-tertiary)]" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium truncate"
          >
            Settings
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return link
}

/* ─── Main Sidebar Export ─── */
export function Sidebar() {
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed)
  const toggleCollapse = useLayoutStore((s) => s.toggleSidebar)
  const isMobile = useIsMobile()

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 size-9 bg-background border border-border md:hidden"
          >
            <Menu className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-background border-border flex flex-col overflow-hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent collapsed={false} onToggleCollapse={() => {}} mobile />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Fixed sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-background overflow-hidden flex flex-col"
      style={{ boxShadow: '2px 0 8px rgba(37,64,160,0.1)' }}
    >
      {/* Subtle gradient overlay at top for depth */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(to bottom, var(--bg-surface), transparent)' }}
      />
      <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
    </motion.aside>
  )
}


