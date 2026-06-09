import { PricingPageClient } from './PricingPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — AkalLoksewa',
  description: 'AkalLoksewa Phase 1 is completely free. View our pricing tiers and future plans.',
}

export default function PricingPage() {
  return <PricingPageClient />
}
