import { ContactPageClient } from './ContactPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — AkalLoksewa',
  description: 'Get in touch with the AkalLoksewa team. We are here to help.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
