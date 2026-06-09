import { getBlogPost } from '../BlogPageClient'
import { BlogPostPageClient } from './BlogPostPageClient'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  return {
    title: post ? `${post.title} — AkalLoksewa Blog` : 'Blog Post — AkalLoksewa',
    description: post?.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  return <BlogPostPageClient post={post} />
}
