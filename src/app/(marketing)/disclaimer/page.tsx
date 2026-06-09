import { DisclaimerPageClient } from './DisclaimerPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer — AkalLoksewa',
  description: 'AkalLoksewa is not affiliated with Lok Sewa Aayog. Content is for practice purposes only.',
}

export default function DisclaimerPage() {
  return <DisclaimerPageClient />
}
