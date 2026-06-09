'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)} role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-t-ink-400',
          sizeMap[size]
        )}
        style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--ink-400)' }}
      />
      {label && <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{label}</span>}
    </div>
  )
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="h-10 w-64 skeleton-shimmer rounded-md" />
        <div className="h-4 w-64 sm:w-96 skeleton-shimmer rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 skeleton-shimmer rounded-lg" />
        ))}
      </div>
    </div>
  )
}
