'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEVANAGARI_OPTIONS } from '@/lib/constants'

/* ═══════════════════════════════════════════════════════════════
   OptionButton — THE HEART OF THE PRODUCT
   
   States: idle | hover | selected-pending | correct | incorrect | revealed-correct
   ═══════════════════════════════════════════════════════════════ */

export type OptionState =
  | 'idle'
  | 'selected-pending'
  | 'correct'
  | 'incorrect'
  | 'revealed-correct'

interface OptionButtonProps {
  label: string       // "A", "B", "C", "D"
  text: string        // Option text content
  state: OptionState
  labelStyle?: 'latin' | 'devanagari'
  onClick?: () => void
  disabled?: boolean
}

const LATIN_LABELS = ['A', 'B', 'C', 'D']

function getLabelChar(label: string, style: 'latin' | 'devanagari'): string {
  if (style === 'devanagari') {
    const idx = LATIN_LABELS.indexOf(label)
    return idx >= 0 ? DEVANAGARI_OPTIONS[idx] : label
  }
  return label
}

/* ─── Label Pill ─── */
function LabelPill({
  label,
  style,
  state,
}: {
  label: string
  style: 'latin' | 'devanagari'
  state: OptionState
}) {
  const char = getLabelChar(label, style)

  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] text-[14px] font-semibold transition-all duration-100',
        // base
        'bg-surface-raised border border-border-subtle',
        // states
        state === 'selected-pending' && 'bg-ink-500 text-white border-ink-500',
        state === 'correct' && 'bg-green-400 text-white border-green-400',
        state === 'incorrect' && 'bg-red-400 text-white border-red-400',
        state === 'revealed-correct' && 'bg-green-500/40 text-green-200 border-green-500/40',
        style === 'devanagari' && 'font-display'
      )}
      style={state === 'idle' ? { color: 'var(--text-tertiary)' } : undefined}
    >
      {char}
    </span>
  )
}

/* ─── Status Icon ─── */
function StatusIcon({ state }: { state: OptionState }) {
  if (state === 'correct') {
    return <CheckCircle2 className="h-[18px] w-[18px] text-green-400 flex-shrink-0" />
  }
  if (state === 'incorrect') {
    return <XCircle className="h-[18px] w-[18px] text-red-400 flex-shrink-0" />
  }
  return null
}

export function OptionButton({
  label,
  text,
  state,
  labelStyle = 'latin',
  onClick,
  disabled = false,
}: OptionButtonProps) {
  const isAnswered = state !== 'idle' && state !== 'selected-pending'
  const canClick = !disabled && !isAnswered

  return (
    <motion.button
      onClick={canClick ? onClick : undefined}
      disabled={disabled || isAnswered}
      aria-label={`Option ${label}: ${text}`}
      className={cn(
        // Base anatomy
        'flex w-full items-center h-14 px-4 rounded-[14px] transition-all duration-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-400',
        'active:scale-[0.98]',
        // Borders
        'border',
        // ─── IDLE ───
        state === 'idle' && [
          'border-border-subtle bg-surface hover:border-border hover:bg-surface-raised cursor-pointer',
          'group',
        ],
        // ─── SELECTED-PENDING ───
        state === 'selected-pending' && [
          'border-ink-400 bg-ink-500/8 shadow-glow-ink cursor-pointer',
        ],
        // ─── CORRECT ───
        state === 'correct' && [
          'border-green-400 bg-green-500/8',
        ],
        // ─── INCORRECT ───
        state === 'incorrect' && [
          'border-red-400 bg-red-500/6',
        ],
        // ─── REVEALED-CORRECT ───
        state === 'revealed-correct' && [
          'border-green-400/50 bg-green-500/4',
        ],
        // Disabled non-answered look
        disabled && !isAnswered && 'opacity-50 cursor-not-allowed',
      )}
      // Framer Motion: subtle scale pulse on correct
      animate={
        state === 'correct'
          ? { scale: [1, 1.01, 1] }
          : state === 'incorrect'
            ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
            : {}
      }
      transition={
        state === 'correct'
          ? { duration: 0.2, ease: 'easeOut' }
          : state === 'incorrect'
            ? { duration: 0.4, ease: 'easeOut' }
            : {}
      }
    >
      {/* Label Pill */}
      <LabelPill label={label} style={labelStyle} state={state} />

      {/* Option Text */}
      <span
        className={cn(
          't-body ml-3 flex-1 text-left transition-colors duration-100',
          state === 'correct' && 'text-green-300 font-medium',
          state === 'incorrect' && 'text-red-300',
          state === 'revealed-correct' && 'text-green-200/80',
        )}
        style={state === 'idle' || state === 'selected-pending' ? { color: 'var(--text-primary)' } : undefined}
      >
        {text}
      </span>

      {/* Right icon (appears on answer) */}
      <StatusIcon state={state} />
    </motion.button>
  )
}
