import { RefundPageClient } from './RefundPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — AkalLoksewa',
  description: 'AkalLoksewa Phase 1 is a free product. No payment is required.',
}

export default function RefundPage() {
  return <RefundPageClient />
}
