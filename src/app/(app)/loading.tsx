import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" data-theme="dark" style={{ background: 'var(--ink-950)' }}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    </div>
  )
}
