import { Suspense } from 'react'
import { LoginPageClient } from './LoginPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — AkalLoksewa',
  description: 'Sign in to your AkalLoksewa account to continue your Loksewa preparation.',
}

function LoginPageFallback() {
  return (
    <div className="max-w-sm w-full">
      <div className="mb-8">
        <div className="h-10 w-48 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-4 w-64 mt-4 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
      </div>
      <div className="space-y-5">
        <div className="h-11 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-11 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        <div className="h-12 rounded-md animate-pulse" style={{ background: 'var(--bg-surface)' }} />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  )
}
