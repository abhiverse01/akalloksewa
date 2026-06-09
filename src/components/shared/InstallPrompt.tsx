'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

const DISMISS_KEY = 'akal-install-prompt-dismissed'
const MIN_SESSIONS_BEFORE_SHOW = 3

/**
 * PWA Install Prompt — shows a card prompting the user to install
 * AkalLoksewa to their home screen. Only appears after the user
 * has practiced for 3+ sessions (tracked via sessionStorage counter).
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) return

    // Track session count
    const sessionCount = parseInt(sessionStorage.getItem('akal-session-count') || '0', 10)
    sessionStorage.setItem('akal-session-count', String(sessionCount + 1))
    if (sessionCount < MIN_SESSIONS_BEFORE_SHOW) return

    // Listen for the browser's beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show 2 seconds after the event fires
      setTimeout(() => setShow(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as BeforeInstallPromptEvent).prompt()
    const { outcome } = await (deferredPrompt as BeforeInstallPromptEvent).userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm lg:hidden"
        >
          <div
            className="flex items-center gap-3 p-4 rounded-xl border shadow-xl"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
            }}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'var(--gold-400)' }}
            >
              <Download className="w-5 h-5" style={{ color: 'var(--ink-950)' }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Install AkalLoksewa
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Practice offline — add to home screen
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'var(--gold-400)', color: 'var(--ink-950)' }}
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: 'var(--text-faint)' }}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
