import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" data-theme="dark" style={{ background: 'var(--bg-surface)' }}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Preparing...</p>
      </div>
    </div>
  )
}
