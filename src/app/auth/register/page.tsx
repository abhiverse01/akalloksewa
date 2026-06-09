import { Suspense } from 'react'
import type { Metadata } from 'next'
import { RegisterPageClient } from './RegisterPageClient'

export const metadata: Metadata = {
  title: 'Create Account — AkalLoksewa',
  description: 'Sign up for AkalLoksewa — Nepal\'s most powerful Loksewa preparation platform.',
}

function RegisterPageFallback() {
  return (
    <div className="max-w-sm w-full">
      <div className="mb-8">
        <div className="h-10 w-56 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-4 w-72 mt-4 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
      </div>
      <div className="space-y-5">
        <div className="h-11 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-11 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-11 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-12 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageClient />
    </Suspense>
  )
}
