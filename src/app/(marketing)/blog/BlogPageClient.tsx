'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  author: string
}

const posts: BlogPost[] = [
  {
    slug: 'complete-guide-to-loksewa-exam-preparation-2082',
    title: 'Complete Guide to Loksewa Exam Preparation 2082',
    excerpt: 'The Loksewa Aayog conducts examinations for Nepal\'s civil service across Kharidar, Nasu, and Officer levels. This guide breaks down the exam structure — preliminary objective test, main written exam, and interview — with subject-wise weightage and a realistic 6-month preparation roadmap based on official PSC syllabus patterns.',
    date: '2025-01-15',
    readTime: '8 min',
    category: 'Guide',
    author: 'Akal Sharma',
  },
  {
    slug: 'constitution-of-nepal-2072-key-topics',
    title: 'Constitution of Nepal 2072: Key Topics for Loksewa',
    excerpt: 'Part 3 Fundamental Rights (Articles 16–46), the federal structure under Part 5 with 7 provinces, and independent constitutional bodies like the CIAA and Election Commission are among the most-tested areas. This post covers article-level detail with exam-focused analysis.',
    date: '2025-02-10',
    readTime: '12 min',
    category: 'Constitution',
    author: 'Priya Adhikari',
  },
  {
    slug: 'time-management-strategy-for-loksewa-exam-day',
    title: 'Time Management Strategy for Loksewa Exam Day',
    excerpt: 'The Loksewa preliminary exam gives you 120 minutes for 100 MCQs. This means roughly 72 seconds per question. Learn a proven section-wise time allocation strategy, when to skip difficult questions, and how the 2-pass method can boost your score by 10–15%.',
    date: '2025-03-05',
    readTime: '5 min',
    category: 'Strategy',
    author: 'Akal Sharma',
  },
  {
    slug: 'governance-and-public-administration',
    title: 'Governance & Public Administration: Must-Know Concepts',
    excerpt: 'Essential concepts in governance, public administration, and Nepal\'s federal structure that every Loksewa aspirant must master.',
    date: '2025-04-20',
    readTime: '10 min',
    category: 'Governance',
    author: 'Priya Adhikari',
  },
  {
    slug: 'current-affairs-preparation-strategy',
    title: 'How to Stay Updated with Current Affairs for Loksewa',
    excerpt: 'Best sources, methods, and tools for keeping track of current affairs relevant to Nepal\'s Loksewa examination. National and international coverage.',
    date: '2025-05-12',
    readTime: '6 min',
    category: 'Current Affairs',
    author: 'Sita Karki',
  },
  {
    slug: 'mathematics-tips-for-loksewa',
    title: 'Mathematics Made Easy: Quick Tips for Loksewa',
    excerpt: 'Practical shortcuts, formulas, and problem-solving techniques for the mathematics section of the Loksewa preliminary examination.',
    date: '2025-06-01',
    readTime: '7 min',
    category: 'Mathematics',
    author: 'Akal Sharma',
  },
  {
    slug: 'economics-preparation-guide-loksewa',
    title: 'Economics Preparation Guide for Loksewa Exams',
    excerpt: 'Master macroeconomics, Nepal-specific economic indicators, fiscal policy, and budget concepts that appear frequently in the Loksewa preliminary and main examinations.',
    date: '2025-07-10',
    readTime: '9 min',
    category: 'Economics',
    author: 'Sita Karki',
  },
  {
    slug: 'english-grammar-tips-loksewa',
    title: 'English Grammar & Vocabulary Tips for Loksewa',
    excerpt: 'Sentence correction, error spotting, cloze tests, and vocabulary-building strategies tailored for the English section of Nepal\'s civil service exam.',
    date: '2025-08-05',
    readTime: '6 min',
    category: 'English',
    author: 'Akal Sharma',
  },
  {
    slug: 'interview-preparation-loksewa-final-stage',
    title: 'Interview Preparation: Cracking the Loksewa Final Stage',
    excerpt: 'The interview carries 20-30 marks and can make or break your selection. Learn how to prepare for common questions, current affairs rounds, and personality assessment in the Loksewa interview.',
    date: '2025-09-01',
    readTime: '8 min',
    category: 'Interview',
    author: 'Priya Adhikari',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export function BlogPageClient() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <PageHeader
        title="Blog"
        subtitle="Tips, guides, and insights to help you ace the Loksewa exam."
        centered
      />

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div key={post.slug} {...fadeUp}>
            <Link href={`/blog/${post.slug}`}>
              <Card className="card-hover h-full cursor-pointer group">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-ink-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}
