'use client'

/**
 * useKeyboardShortcuts — Advanced keyboard shortcut handler
 *
 * Features:
 *  - Context-aware: only shortcuts for the current context are active
 *  - Vim-like goto mode: press G then a target key (D, P, T, A, N, S)
 *  - Input-safe: ignores shortcuts when typing in inputs/textareas (except Escape)
 *  - Router-aware: navigation shortcuts use next/navigation
 *
 * Usage:
 *   useKeyboardShortcuts('practice', {
 *     'practice.select-a': () => selectOptionA(),
 *     'practice.next': () => nextQuestion(),
 *     ...
 *   })
 */

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  type ShortcutContext,
  getShortcutsForContext,
  shortcutMatches,
} from '@/lib/keyboard/shortcuts'

export type ShortcutActionMap = Record<string, () => void>

// ── Built-in goto map ──────────────────────────────────

const DEFAULT_GOTO_MAP: Record<string, string> = {
  d: '/dashboard',
  p: '/practice',
  t: '/test',
  a: '/analytics',
  n: '/notes',
  s: '/settings',
}

interface UseKeyboardShortcutsOptions {
  /** Extra handlers keyed by shortcut action string */
  handlers?: ShortcutActionMap
  /** Additional goto targets beyond the defaults */
  gotoMap?: Record<string, string>
  /** Whether the goto mode should be disabled (default: false) */
  disableGoto?: boolean
}

export function useKeyboardShortcuts(
  context: ShortcutContext,
  options: UseKeyboardShortcutsOptions = {},
) {
  const { handlers = {}, gotoMap, disableGoto = false } = options
  const router = useRouter()

  const gotoModeRef = useRef(false)
  const gotoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handlersRef = useRef(handlers)

  const clearGotoMode = useCallback(() => {
    gotoModeRef.current = false
    if (gotoTimeoutRef.current) {
      clearTimeout(gotoTimeoutRef.current)
      gotoTimeoutRef.current = null
    }
  }, [])

  const enterGotoMode = useCallback(() => {
    gotoModeRef.current = true
    if (gotoTimeoutRef.current) {
      clearTimeout(gotoTimeoutRef.current)
    }
    // Auto-exit goto mode after 2 seconds of inactivity
    gotoTimeoutRef.current = setTimeout(clearGotoMode, 2000)
  }, [clearGotoMode])

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const shortcuts = getShortcutsForContext(context)
    const gotoTargets = { ...DEFAULT_GOTO_MAP, ...gotoMap }

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea (except Escape)
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key !== 'Escape') return
      }

      const key = e.key
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const alt = e.altKey

      // ── Goto mode handling ─────────────────────────────
      if (!disableGoto && gotoModeRef.current && !ctrl && !alt) {
        const target = gotoTargets[key.toLowerCase()]
        if (target) {
          e.preventDefault()
          clearGotoMode()
          router.push(target)
          return
        }
        // Any non-goto key exits goto mode
        clearGotoMode()
        // Don't return — fall through to normal shortcut handling
      }

      // ── Escape always clears goto mode ────────────────
      if (key === 'Escape') {
        e.preventDefault()
        clearGotoMode()
        const escapeHandler = handlersRef.current['global.escape']
        if (escapeHandler) {
          escapeHandler()
        }
        return
      }

      // ── Match against registered shortcuts ────────────
      for (const shortcut of shortcuts) {
        if (shortcutMatches(shortcut, key, ctrl, shift, alt, false)) {
          e.preventDefault()

          // Check if this is the goto prefix
          if (shortcut.action === 'global.goto-prefix' && !disableGoto) {
            enterGotoMode()
            return
          }

          // Look for handler in provided handlers
          const handler = handlersRef.current[shortcut.action]
          if (handler) {
            handler()
            return
          }

          // Built-in global navigation shortcuts
          if (shortcut.action === 'global.search') {
            window.dispatchEvent(new CustomEvent('akal:open-search'))
            return
          }
          if (shortcut.action === 'global.help') {
            window.dispatchEvent(new CustomEvent('akal:open-help'))
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearGotoMode()
    }
  }, [context, router, enterGotoMode, clearGotoMode, disableGoto, gotoMap])
}
