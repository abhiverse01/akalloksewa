'use client'

import { useEffect, useCallback, useRef } from 'react'

/** Options for configuring swipe gesture detection. */
interface SwipeOptions {
  /** Fired when user swipes left (negative X movement). */
  onSwipeLeft?: () => void
  /** Fired when user swipes right (positive X movement). */
  onSwipeRight?: () => void
  /** Fired when user swipes up (negative Y movement). */
  onSwipeUp?: () => void
  /** Fired when user swipes down (positive Y movement). */
  onSwipeDown?: () => void
  /** Minimum distance (px) the pointer must travel to trigger a swipe. @default 50 */
  threshold?: number
  /** Minimum velocity (px/ms) required to confirm the swipe. @default 0.3 */
  velocityThreshold?: number
  /** Prevent default vertical scroll during a horizontal swipe. @default false */
  preventScroll?: boolean
}

/**
 * Lightweight swipe detection using Pointer Events.
 *
 * Works across touch, mouse, and stylus input. Attach to any element via a ref
 * and provide directional callbacks. The hook manages its own cleanup on unmount.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null)
 * useSwipeGesture(ref, {
 *   onSwipeLeft: () => router.push('/next'),
 *   onSwipeRight: () => router.back(),
 *   threshold: 60,
 * })
 * return <div ref={ref}>Swipe me</div>
 * ```
 */
export function useSwipeGesture(
  ref: RefObject<HTMLElement | null>,
  options: SwipeOptions,
): void {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
    preventScroll = false,
  } = options

  // ---- Mutable refs to avoid stale closures in event handlers ----
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const startTime = useRef<number>(0)
  const isTracking = useRef<boolean>(false)

  // Keep callbacks in refs so we always call the latest version
  const onSwipeLeftRef = useRef(onSwipeLeft)
  const onSwipeRightRef = useRef(onSwipeRight)
  const onSwipeUpRef = useRef(onSwipeUp)
  const onSwipeDownRef = useRef(onSwipeDown)

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft
    onSwipeRightRef.current = onSwipeRight
    onSwipeUpRef.current = onSwipeUp
    onSwipeDownRef.current = onSwipeDown
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  // ---- Pointer event handlers ----

  const handlePointerDown = useCallback((e: PointerEvent) => {
    // Only respond to primary action (left-click / single finger)
    if (e.isPrimary) {
      startX.current = e.clientX
      startY.current = e.clientY
      startTime.current = Date.now()
      isTracking.current = true
    }
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isTracking.current) return

      const deltaX = e.clientX - startX.current
      const deltaY = e.clientY - startY.current

      // Optionally suppress scroll when the primary direction is horizontal
      if (preventScroll && Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
      }
    },
    [preventScroll],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isTracking.current || !e.isPrimary) return

      isTracking.current = false

      const deltaX = e.clientX - startX.current
      const deltaY = e.clientY - startY.current
      const elapsed = Date.now() - startTime.current

      // Avoid division by zero if elapsed is impossibly small
      const velocity = elapsed > 0 ? Math.abs(deltaX + deltaY) / elapsed : 0

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Must exceed both distance and velocity thresholds
      if (velocity < velocityThreshold) return

      // Determine dominant axis; require movement to exceed threshold on that axis
      if (absX > absY && absX > threshold) {
        if (deltaX > 0) onSwipeRightRef.current?.()
        else onSwipeLeftRef.current?.()
      } else if (absY > absX && absY > threshold) {
        if (deltaY > 0) onSwipeDownRef.current?.()
        else onSwipeUpRef.current?.()
      }
    },
    [threshold, velocityThreshold],
  )

  // ---- Attach / detach listeners ----

  useEffect(() => {
    const target = ref.current
    if (!target) return

    target.addEventListener('pointerdown', handlePointerDown)
    target.addEventListener('pointermove', handlePointerMove)
    target.addEventListener('pointerup', handlePointerUp)
    // Also handle cancel (e.g. pointer leaves the element / browser intervenes)
    target.addEventListener('pointercancel', handlePointerUp)

    return () => {
      target.removeEventListener('pointerdown', handlePointerDown)
      target.removeEventListener('pointermove', handlePointerMove)
      target.removeEventListener('pointerup', handlePointerUp)
      target.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [ref, handlePointerDown, handlePointerMove, handlePointerUp])
}
