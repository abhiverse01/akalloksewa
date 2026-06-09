'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

/** Options for pull-to-refresh behaviour. */
interface PullToRefreshOptions {
  /** Async callback invoked when the user completes the pull-to-refresh gesture. */
  onRefresh: () => Promise<void>
  /** Pull distance (px) required to trigger a refresh. @default 70 */
  threshold?: number
}

/** Return value of {@link usePullToRefresh}. */
interface PullToRefreshReturn {
  /** Current pull distance in px (0 when idle). */
  pullDistance: number
  /** Whether a refresh is currently in progress. */
  isRefreshing: boolean
  /** Ref to attach to the pull indicator element. */
  pullIndicatorRef: React.RefObject<HTMLDivElement | null>
  /** Ref to attach to the scrollable container element. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Touch handlers to spread onto the container `<div>`. */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
  }
}

/** Dead-zone: the user must pull past this before the indicator appears. */
const ACTIVATION_START = 30
/** Damping factor applied to raw pull distance for the visual indicator. */
const DAMPING = 0.3

/**
 * Pull-to-refresh hook for touch devices.
 *
 * @example
 * ```tsx
 * const { pullDistance, isRefreshing, pullIndicatorRef, containerRef, handlers } =
 *   usePullToRefresh({ onRefresh: async () => { await fetchData() }, threshold: 70 })
 *
 * return (
 *   <div ref={containerRef} {...handlers} className="overflow-y-auto">
 *     <div
 *       ref={pullIndicatorRef}
 *       style={{ transform: `translateY(${pullDistance}px)`, height: pullDistance }}
 *     >
 *       {isRefreshing ? 'Refreshing…' : pullDistance >= 70 ? 'Release to refresh' : 'Pull down'}
 *     </div>
 *     <MyContent />
 *   </div>
 * )
 * ```
 */
export function usePullToRefresh(options: PullToRefreshOptions): PullToRefreshReturn {
  const { onRefresh, threshold = 70 } = options

  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const pullIndicatorRef = useRef<HTMLDivElement | null>(null)

  // Mutable tracking state – avoids stale closures without extra re-renders
  const touchStartY = useRef<number>(0)
  const currentPull = useRef<number>(0)
  const canPull = useRef<boolean>(false)

  // Keep onRefresh in a ref so the handler always calls the latest version
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  // ---- Helpers ----

  /** Check whether the container is scrolled to the very top. */
  const isAtTop = useCallback((): boolean => {
    const el = containerRef.current
    if (!el) return false
    return el.scrollTop <= 0
  }, [])

  // ---- Touch handlers ----

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only track a single touch point
    const touch = e.touches[0]
    if (!touch) return

    touchStartY.current = touch.clientY
    canPull.current = isAtTop()
    currentPull.current = 0
  }, [isAtTop])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Don't interfere if a refresh is already in flight or pull isn't possible
      if (isRefreshing || !canPull.current) return

      const touch = e.touches[0]
      if (!touch) return

      const delta = touch.clientY - touchStartY.current

      // Only allow pulling downward
      if (delta <= 0) {
        setPullDistance(0)
        currentPull.current = 0
        return
      }

      // Apply dead-zone and damping
      let damped = 0
      if (delta > ACTIVATION_START) {
        damped = (delta - ACTIVATION_START) * DAMPING
      }

      currentPull.current = damped
      setPullDistance(damped)

      // Haptic feedback when reaching the threshold
      if (damped >= threshold && damped - (delta > 0 ? 1 : 0) < threshold + 2) {
        try {
          navigator.vibrate?.(10)
        } catch {
          // vibrate may not be available in all environments
        }
      }

      // Prevent native pull-to-refresh / overscroll
      if (canPull.current && delta > 0) {
        e.preventDefault()
      }
    },
    [isRefreshing, threshold],
  )

  const onTouchEnd = useCallback(async () => {
    // Snapshot the pull distance at the moment of release
    const pull = currentPull.current

    if (pull >= threshold) {
      // User crossed the threshold → trigger refresh
      setIsRefreshing(true)

      try {
        await onRefreshRef.current()
      } catch {
        // Let callers handle their own errors; we still reset state
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        currentPull.current = 0
        canPull.current = false
      }
    } else {
      // Below threshold → spring back to 0
      setPullDistance(0)
      currentPull.current = 0
    }
  }, [threshold])

  return {
    pullDistance,
    isRefreshing,
    pullIndicatorRef,
    containerRef,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
