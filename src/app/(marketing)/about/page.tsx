import { AboutPageClient } from './AboutPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — AkalLoksewa',
  description: 'Learn about the AkalLoksewa team, our mission, and the story behind Nepal\'s smartest Loksewa platform.',
}

export default function AboutPage() {
  return <AboutPageClient />
}
