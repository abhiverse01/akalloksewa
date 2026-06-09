'use client'

import { cn } from '@/lib/utils'
import type { AvatarColor } from '@/types/auth'

const AVATAR_STYLES: Record<AvatarColor, { bg: string; text: string; ring: string }> = {
  ink:     { bg: 'bg-[#2a3555]', text: 'text-[#c8d0e0]', ring: 'ring-[#5c6b8a]' },
  teal:    { bg: 'bg-[#115e59]', text: 'text-[#ccfbf1]', ring: 'ring-[#2dd4bf]' },
  rose:    { bg: 'bg-[#9f1239]', text: 'text-[#ffe4e6]', ring: 'ring-[#fb7185]' },
  amber:   { bg: 'bg-[#92400e]', text: 'text-[#fef3c7]', ring: 'ring-[#fbbf24]' },
  violet:  { bg: 'bg-[#5b21b6]', text: 'text-[#ede9fe]', ring: 'ring-[#a78bfa]' },
  emerald: { bg: 'bg-[#065f46]', text: 'text-[#d1fae5]', ring: 'ring-[#34d399]' },
  sky:     { bg: 'bg-[#075985]', text: 'text-[#e0f2fe]', ring: 'ring-[#38bdf8]' },
  fuchsia: { bg: 'bg-[#86198f]', text: 'text-[#fae8ff]', ring: 'ring-[#e879f9]' },
}

const SIZE_MAP = {
  xs: 'size-5 text-[9px]',
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-[12px]',
  lg: 'size-12 text-[16px]',
  xl: 'size-16 text-[20px]',
  '2xl': 'size-24 text-[32px]',
} as const

function getInitials(displayName: string): string {
  if (!displayName) return '?'
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserAvatarProps {
  displayName: string
  avatarColor?: AvatarColor
  size?: keyof typeof SIZE_MAP
  showRing?: boolean
  showOnlineDot?: boolean
  className?: string
}

export function UserAvatar({
  displayName,
  avatarColor = 'ink',
  size = 'md',
  showRing = false,
  showOnlineDot = false,
  className,
}: UserAvatarProps) {
  const style = AVATAR_STYLES[avatarColor]
  const initials = getInitials(displayName)

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-medium',
          style.bg,
          style.text,
          SIZE_MAP[size],
          showRing && `ring-2 ${style.ring}`
        )}
        style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
        title={displayName}
      >
        {initials}
      </div>
      {showOnlineDot && (
        <span
          className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface,#141a2e)]"
        />
      )}
    </div>
  )
}
