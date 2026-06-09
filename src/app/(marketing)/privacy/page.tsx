import { PrivacyPageClient } from './PrivacyPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — AkalLoksewa',
  description: 'Learn how AkalLoksewa handles your data. Phase 1: all data stored locally via IndexedDB.',
}

export default function PrivacyPage() {
  return <PrivacyPageClient />
}
