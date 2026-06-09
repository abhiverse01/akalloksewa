import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function MarketingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    </div>
  )
}
