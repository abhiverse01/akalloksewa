'use client'

import { useDB } from '@/hooks/useDB'
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel'
import { DualLogoLoader } from '@/components/shared/DualLogoLoader'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isReady, error } = useDB()

  if (!isReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-theme="dark"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="space-y-4 text-center">
          <DualLogoLoader />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Preparing AkalLoksewa...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-theme="dark"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--red-400)' }}>
            Failed to initialize
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm hover:underline transition-colors"
            style={{ color: 'var(--ink-400)' }}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-theme="dark" className="min-h-screen flex" style={{ background: 'var(--bg-surface)' }}>
      <AuthBrandPanel />
      <div
        className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:border-l"
      >
        {children}
      </div>
    </div>
  )
}
