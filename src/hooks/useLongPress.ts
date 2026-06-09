'use client'

import { useRef, useCallback, useEffect } from 'react'

/** Options for configuring long-press behaviour. */
interface LongPressOptions {
  /** Callback fired when a long press is detected. Receives the pointer coordinates. */
  onLongPress: (position: { x: number; y: number }) => void
  /** Delay (ms) before the long press fires. @default 500 */
  delay?: number
  /** If the pointer moves more than this distance (px) the press is cancelled. @default 8 */
  moveThreshold?: number
}

/** Handlers returned by {@link useLongPress} — spread them onto any element. */
interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

/**
 * Detects a sustained press (long press) on an element using Pointer Events.
 *
 * Cancels automatically if the pointer moves beyond `moveThreshold` or is
 * released before `delay` elapses. Fires a short haptic vibration when the
 * long press is confirmed.
 *
 * @example
 * ```tsx
 * const longPress = useLongPress({
 *   onLongPress: ({ x, y }) => showContextMenu(x, y),
 *   delay: 600,
 * })
 *
 * return (
 *   <button {...longPress} className="relative">
 *     Hold me
 *   </button>
 * )
 * ```
 */
export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const { onLongPress, delay = 500, moveThreshold = 8 } = options

  // Mutable refs – avoids stale closures and unnecessary re-renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const hasTriggered = useRef<boolean>(false)

  // Keep the latest callback in a ref (updated via effect to satisfy React compiler)
  const onLongPressRef = useRef(onLongPress)
  useEffect(() => {
    onLongPressRef.current = onLongPress
  }, [onLongPress])

  // ---- Cleanup helper ----
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ---- Pointer handlers ----

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only react to primary action (left-click / single finger)
      if (!e.isPrimary) return

      hasTriggered.current = false
      startX.current = e.clientX
      startY.current = e.clientY

      const position = { x: e.clientX, y: e.clientY }

      timerRef.current = setTimeout(() => {
        hasTriggered.current = true
        try {
          navigator.vibrate?.(15)
        } catch {
          // vibrate may not be available in all environments
        }
        onLongPressRef.current(position)
      }, delay)
    },
    [delay],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (hasTriggered.current || timerRef.current === null) return

      const dx = e.clientX - startX.current
      const dy = e.clientY - startY.current
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > moveThreshold) {
        // Finger moved too much → cancel the pending long press
        clearTimer()
      }
    },
    [moveThreshold, clearTimer],
  )

  const onPointerUp = useCallback(() => {
    // If the timer hasn't fired yet, this was a short tap → cancel
    clearTimer()
  }, [clearTimer])

  const onPointerCancel = useCallback(() => {
    // Browser cancelled the pointer (e.g. system gesture took over)
    clearTimer()
  }, [clearTimer])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
