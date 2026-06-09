import { TermsPageClient } from './TermsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — AkalLoksewa',
  description: 'Terms and conditions governing the use of AkalLoksewa platform.',
}

export default function TermsPage() {
  return <TermsPageClient />
}
