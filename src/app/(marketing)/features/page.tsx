import { FeaturesPageClient } from './FeaturesPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — AkalLoksewa',
  description: 'Discover all the powerful features AkalLoksewa offers for Loksewa exam preparation.',
}

export default function FeaturesPage() {
  return <FeaturesPageClient />
}
