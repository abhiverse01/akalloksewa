'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const STORAGE_KEY_PREFIX = 'scroll-pos-'
const THROTTLE_MS = 150

/**
 * Stores scroll positions per pathname in sessionStorage.
 * On mount, restores the saved position for the current route.
 * On scroll, saves the current position (throttled).
 */
export function useScrollRestoration() {
  const pathname = usePathname()
  const scrollPosRef = useRef<Record<string, number>>({})
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore scroll position on mount / pathname change
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${pathname}`
    try {
      const saved = sessionStorage.getItem(key)
      if (saved !== null) {
        const y = parseFloat(saved)
        if (!isNaN(y) && y > 0) {
          // Use requestAnimationFrame to ensure DOM is painted
          requestAnimationFrame(() => {
            window.scrollTo(0, y)
          })
        }
      }
    } catch {
      // sessionStorage may not be available (e.g., incognito restriction)
    }
  }, [pathname])

  // Save scroll position on scroll (throttled)
  const handleScroll = useCallback(() => {
    if (throttleTimerRef.current) return
    throttleTimerRef.current = setTimeout(() => {
      throttleTimerRef.current = null
      const key = `${STORAGE_KEY_PREFIX}${pathname}`
      scrollPosRef.current[pathname] = window.scrollY
      try {
        sessionStorage.setItem(key, String(window.scrollY))
      } catch {
        // ignore
      }
    }, THROTTLE_MS)
  }, [pathname])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [handleScroll])
}
