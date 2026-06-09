'use client'

import { useState } from 'react'
import { ChevronLeft, Search, Bookmark, BookmarkCheck, Menu } from 'lucide-react'
import { UserAvatar } from '@/components/user/UserAvatar'
import { openSearchDialog } from '@/components/shared/SearchCommand'

/* ─── Types ─────────────────────────────────────────────────── */

type MobileTopBarVariant = 'default' | 'practice' | 'test' | 'ingestor' | 'profile'

interface MobileTopBarProps {
  variant?: MobileTopBarVariant
  title?: string
  leftAction?: { label: string; onClick: () => void }
  rightAction?: React.ReactNode
  /** practice variant: subject badge text */
  subjectBadge?: string
  /** practice variant: e.g. "Q 5 of 20" */
  questionProgress?: string
  /** test variant: e.g. "23:47" */
  timer?: string
  /** test variant: timer colour urgency */
  timerUrgency?: 'normal' | 'warning' | 'critical'
  /** test variant: callback to end the test */
  onEndTest?: () => void
  /** profile variant: callback when "Edit" is tapped */
  onEdit?: () => void
}

/* ─── Shared styles ────────────────────────────────────────── */

const GHOST_BTN =
  'flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 rounded-lg text-[var(--ink-300)] hover:text-[var(--ink-200)] hover:bg-[var(--bg-raised)] transition-colors'

const ICON_BTN =
  'flex items-center justify-center min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg transition-colors'

/* ─── Timer colour map ─────────────────────────────────────── */

const TIMER_COLORS: Record<NonNullable<MobileTopBarProps['timerUrgency']>, string> = {
  normal: 'text-[var(--text-primary)]',
  warning: 'text-[var(--amber-400)]',
  critical: 'text-[var(--red-400)]',
}

/* ─── Component ────────────────────────────────────────────── */

export function MobileTopBar({
  variant = 'default',
  title,
  leftAction,
  rightAction,
  subjectBadge,
  questionProgress,
  timer,
  timerUrgency = 'normal',
  onEndTest,
  onEdit,
}: MobileTopBarProps) {
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-3 lg:hidden bg-[var(--bg-surface)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]"
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
        {variant === 'default' && (
          <span className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {title}
          </span>
        )}

        {variant === 'practice' && leftAction && (
          <button
            type="button"
            onClick={leftAction.onClick}
            className={GHOST_BTN}
            aria-label={leftAction.label}
          >
            <ChevronLeft className="size-5" />
            <span className="text-sm font-medium">{leftAction.label}</span>
          </button>
        )}

        {variant === 'test' && (
          <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[140px]">
            {title}
          </span>
        )}

        {variant === 'ingestor' && leftAction && (
          <button
            type="button"
            onClick={leftAction.onClick}
            className={GHOST_BTN}
            aria-label={leftAction.label}
          >
            <ChevronLeft className="size-5" />
            <span className="text-sm font-medium">{leftAction.label}</span>
          </button>
        )}

        {variant === 'profile' &&
          (leftAction ? (
            <button
              type="button"
              onClick={leftAction.onClick}
              className={GHOST_BTN}
              aria-label={leftAction.label}
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm font-medium">{leftAction.label}</span>
            </button>
          ) : (
            <button
              type="button"
              className={ICON_BTN}
              aria-label="Open menu"
            >
              <Menu className="size-5 text-[var(--ink-300)]" />
            </button>
          ))}
      </div>

      {/* ── CENTER ── */}
      <div className="flex items-center justify-center gap-2 min-w-0 flex-1 px-2">
        {variant === 'practice' && (
          <>
            {subjectBadge && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--ink-500)]/15 text-[var(--ink-300)]">
                {subjectBadge}
              </span>
            )}
            {questionProgress && (
              <span className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">
                {questionProgress}
              </span>
            )}
          </>
        )}

        {variant === 'test' && timer && (
          <span
            className={`text-lg font-mono font-semibold whitespace-nowrap ${TIMER_COLORS[timerUrgency]}`}
          >
            {timer}
          </span>
        )}

        {variant === 'ingestor' && (
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {title}
          </span>
        )}

        {variant === 'profile' && (
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {title}
          </span>
        )}
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {variant === 'default' && (
          <>
            <button
              type="button"
              onClick={() => openSearchDialog()}
              className={`${ICON_BTN} text-[var(--ink-300)] hover:text-[var(--ink-200)] hover:bg-[var(--bg-raised)]`}
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
            <UserAvatar displayName="User" size="sm" />
          </>
        )}

        {variant === 'practice' && !rightAction && (
          <button
            type="button"
            onClick={() => setBookmarked((v) => !v)}
            className={`${ICON_BTN} ${bookmarked ? 'text-[var(--gold-400)]' : 'text-[var(--ink-300)] hover:text-[var(--ink-200)] hover:bg-[var(--bg-raised)]'}`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {bookmarked ? (
              <BookmarkCheck className="size-5" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </button>
        )}

        {variant === 'test' && onEndTest && (
          <button
            type="button"
            onClick={onEndTest}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 text-[var(--red-400)] font-medium rounded-lg transition-colors hover:bg-[var(--bg-raised)]"
          >
            End Test
          </button>
        )}

        {variant === 'ingestor' && questionProgress && (
          <span className="text-sm font-mono font-medium text-[var(--text-tertiary)] tabular-nums">
            {questionProgress}
          </span>
        )}

        {variant === 'profile' && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 text-sm font-medium text-[var(--ink-300)] hover:text-[var(--ink-200)] hover:bg-[var(--bg-raised)] rounded-lg transition-colors"
          >
            Edit
          </button>
        )}

        {rightAction}
      </div>
    </header>
  )
}
