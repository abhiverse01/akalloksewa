import { BlogPageClient } from './BlogPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — AkalLoksewa',
  description: 'Tips, guides, and insights for Loksewa exam preparation from the AkalLoksewa team.',
}

export default function BlogPage() {
  return <BlogPageClient />
}
