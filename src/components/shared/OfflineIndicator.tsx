'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

// ─── External store for online status (avoids setState-in-effect lint) ───

function subscribeToOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // SSR always reports online
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * OfflineIndicator — shows a status bar below the top navigation
 * when the browser loses connectivity. Uses framer-motion for
 * slide-in / slide-out animations.
 *
 * - Offline:  amber bar with "No internet connection — your data is still available locally"
 * - Back online: green "Connection restored" shown for 2 seconds, then disappears
 */
export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribeToOnline, getOnlineSnapshot, getServerSnapshot)
  const [showRestored, setShowRestored] = useState(false)
  const prevOnlineRef = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOnlineEvent = useCallback(() => {
    // Only show "restored" if we were previously offline
    if (!prevOnlineRef.current) {
      setShowRestored(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowRestored(false)
        timerRef.current = null
      }, 2000)
    }
  }, [])

  const handleOfflineEvent = useCallback(() => {
    setShowRestored(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    prevOnlineRef.current = isOnline
  }, [isOnline])

  useEffect(() => {
    window.addEventListener('online', handleOnlineEvent)
    window.addEventListener('offline', handleOfflineEvent)
    return () => {
      window.removeEventListener('online', handleOnlineEvent)
      window.removeEventListener('offline', handleOfflineEvent)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [handleOnlineEvent, handleOfflineEvent])

  return (
    <AnimatePresence>
      {!isOnline ? (
        <motion.div
          key="offline"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 32, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 overflow-hidden"
          style={{
            height: 32,
            background: 'var(--amber-500)',
            color: '#ffffff',
          }}
        >
          <WifiOff className="size-3.5 shrink-0" />
          <span className="text-xs font-medium">
            No internet connection — your data is still available locally
          </span>
        </motion.div>
      ) : showRestored ? (
        <motion.div
          key="restored"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 32, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 overflow-hidden"
          style={{
            height: 32,
            background: 'var(--green-500)',
            color: '#ffffff',
          }}
        >
          <Wifi className="size-3.5 shrink-0" />
          <span className="text-xs font-medium">
            Connection restored
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
