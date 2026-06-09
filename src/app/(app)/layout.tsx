'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { InstallPrompt } from '@/components/shared/InstallPrompt'
import { UserProvider } from '@/contexts/UserContext'
import { SessionTimerProvider } from '@/contexts/SessionTimerContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useDB } from '@/hooks/useDB'
import { useLayoutStore } from '@/stores/layoutStore'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { DualLogoLoader } from '@/components/shared/DualLogoLoader'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const } },
}

function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed)
  const lockInMode = useLayoutStore((s) => s.lockInMode)
  const pathname = usePathname()

  // Lock In mode — document.title side effect
  useEffect(() => {
    if (lockInMode) {
      document.title = '\u{1F512} Locked In \u2014 AkalLoksewa'
    } else {
      document.title = 'AkalLoksewa'
    }
    return () => { document.title = 'AkalLoksewa' }
  }, [lockInMode])

  // -- Idle Detection for Lock In mode --
  const [showIdleOverlay, setShowIdleOverlay] = useState(false)
  const lastInteractionRef = useRef(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    if (showIdleOverlay) {
      setShowIdleOverlay(false)
    }
  }, [showIdleOverlay])

  useEffect(() => {
    if (!lockInMode) {
      setShowIdleOverlay(false)
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current)
        idleTimerRef.current = null
      }
      return
    }

    lastInteractionRef.current = Date.now()

    // Check every 10 seconds if user has been idle for 3 minutes
    idleTimerRef.current = setInterval(() => {
      const idle = Date.now() - lastInteractionRef.current
      if (idle >= 3 * 60 * 1000) {
        setShowIdleOverlay(true)
      }
    }, 10_000)

    const events = ['click', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach((evt) => {
      window.addEventListener(evt, recordInteraction, { passive: true })
    })

    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current)
        idleTimerRef.current = null
      }
      events.forEach((evt) => {
        window.removeEventListener(evt, recordInteraction)
      })
    }
  }, [lockInMode, recordInteraction])

  const dismissIdleOverlay = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setShowIdleOverlay(false)
  }, [])

  // Desktop sidebar width
  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 240

  return (
    <div
      className={cn('min-h-screen relative', lockInMode && 'lock-in-active')}
      data-theme="dark"
      style={{
        background: 'var(--bg-base)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '32px 32px, 32px 32px',
      }}
    >
      {/* Ambient glow overlay */}
      <div
        className="pointer-events-none fixed inset-0"
        data-subject-color
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 0% 0%, var(--ambient-color, rgba(37,64,160,0.06)) 0%, transparent 70%)',
          transition: 'background 2s ease',
        }}
        aria-hidden="true"
      />
      {/* Offline indicator */}
      <OfflineIndicator />
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area -- marginLeft synced with sidebar width */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen flex flex-col"
      >
        {/* Mobile Top Bar -- mobile only */}
        <MobileTopBar variant="default" />

        {/* App Header Bar -- desktop only */}
        <div className="hidden lg:block"><AppHeader /></div>

        {/* Page content with transition */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
      {/* Bottom Navigation -- mobile */}
      <BottomNav />
      <InstallPrompt />

      {/* Lock In -- Idle Detection Overlay */}
      <AnimatePresence>
        {lockInMode && showIdleOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Idle detection -- confirm you are still active"
          >
            <div className="flex flex-col items-center gap-6 px-6 text-center">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Still there?
              </h2>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
                No activity detected for 3 minutes. Tap below to resume your session.
              </p>
              <button
                onClick={dismissIdleOverlay}
                className="mt-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--gold-400)',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                I&apos;m here &mdash; Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isReady, error } = useDB()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center" data-theme="dark" style={{ background: 'var(--ink-950)' }}>
        <div className="space-y-4 text-center">
          <DualLogoLoader />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading AkalLoksewa&hellip;</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center" data-theme="dark" style={{ background: 'var(--ink-950)' }}>
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-red-400">Failed to initialize database</p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm hover:underline transition-colors"
            style={{ color: 'var(--ink-400)' }}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <SessionTimerProvider>
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </SessionTimerProvider>
    </AuthGuard>
  )
}
