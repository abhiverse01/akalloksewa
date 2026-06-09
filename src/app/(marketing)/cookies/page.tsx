import { CookiePageClient } from './CookiePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — AkalLoksewa',
  description: 'How AkalLoksewa uses browser storage. Phase 1: localStorage preferences + IndexedDB data only.',
}

export default function CookiePage() {
  return <CookiePageClient />
}
