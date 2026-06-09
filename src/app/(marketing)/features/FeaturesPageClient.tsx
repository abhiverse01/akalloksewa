'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen, Brain, BarChart3, PenTool, Bookmark, Upload,
  ListChecks, Target, Timer, TrendingUp, Layers, Shield
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    icon: BookOpen,
    title: 'Smart Question Bank',
    description: 'Access 75,000+ curated practice questions across 17 Loksewa subjects. Filter by difficulty, topic, year, and chapter. Every question comes with detailed explanations to help you understand the reasoning behind each answer.',
    highlights: ['75,000+ questions', '17 subjects', 'Multiple difficulty levels'],
  },
  {
    icon: Timer,
    title: 'Timed Mock Tests',
    description: 'Simulate real exam conditions with fully customizable mock tests. Set your own question count, time limits, subject mix, and negative marking rules. Review detailed score breakdowns after each test with section-wise analysis.',
    highlights: ['Customizable tests', 'Real exam simulation', 'Detailed scoring'],
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track your preparation with powerful analytics. See your accuracy trends over time, identify weak subjects, monitor daily study streaks, and get data-driven recommendations for where to focus your efforts next.',
    highlights: ['Score trends', 'Weak area detection', 'Daily streaks'],
  },
  {
    icon: PenTool,
    title: 'Smart Notes',
    description: 'Create, organize, and tag your study notes by subject. Use our built-in editor with rich formatting support. Notes are stored locally and can be searched, filtered, and organized to match your study workflow.',
    highlights: ['Rich editor', 'Subject tagging', 'Local storage'],
  },
  {
    icon: Upload,
    title: 'Content Ingestor',
    description: 'Import your own question sets from textbooks, PDFs, or text files. Our intelligent parser supports multiple formats and can automatically detect question structures, options, and answers. Review and edit before committing to your question bank.',
    highlights: ['Multiple formats', 'Auto-detection', 'Review workflow'],
  },
  {
    icon: Bookmark,
    title: 'Bookmarking System',
    description: 'Save challenging questions for later review with our one-click bookmark system. Organize your bookmarked questions by subject and revisit them during focused study sessions to reinforce your understanding of difficult topics.',
    highlights: ['One-click save', 'Subject filtering', 'Review mode'],
  },
  {
    icon: ListChecks,
    title: 'Syllabus Tracker',
    description: 'Follow a structured syllabus covering all 17 Loksewa subjects with detailed chapter breakdowns. Track which chapters you have covered and identify gaps in your preparation before the exam.',
    highlights: ['17 subjects', 'Chapter tracking', 'Gap analysis'],
  },
  {
    icon: Target,
    title: 'Leaderboard',
    description: 'Compete with fellow aspirants on our leaderboard. See how your scores compare, track your ranking, and find motivation in healthy competition. The leaderboard fosters a sense of community and achievement.',
    highlights: ['Rank tracking', 'Community', 'Motivation'],
  },
  {
    icon: TrendingUp,
    title: 'Difficulty Progression',
    description: 'Questions are organized across four difficulty levels — Easy, Medium, Hard, and Very Hard. Start with fundamentals and progressively challenge yourself as your preparation advances. Our algorithm adapts to your skill level.',
    highlights: ['4 difficulty levels', 'Adaptive', 'Progressive learning'],
  },
  {
    icon: Layers,
    title: 'Keyboard Shortcuts',
    description: 'Study faster with comprehensive keyboard shortcuts. Navigate questions, select answers, toggle explanations, and control tests — all without touching your mouse. Designed for power users who value efficiency.',
    highlights: ['Cmd+K search', 'Answer shortcuts', 'Full navigation'],
  },
  {
    icon: Brain,
    title: 'Smart Explanations',
    description: 'Every question comes with a detailed explanation of the correct answer. Understand the &quot;why&quot; behind each answer choice, not just the &quot;what.&quot; Explanations are available during practice and can be toggled on/off during tests.',
    highlights: ['Detailed answers', 'Toggle in tests', 'Learning focused'],
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All your data stays on your device. No server transmission, no tracking, no ads. Your study data, notes, and progress are stored in IndexedDB and are never shared with anyone. Your preparation is your business.',
    highlights: ['Local storage', 'No tracking', 'Zero ads'],
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export function FeaturesPageClient() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <PageHeader
        title="Features"
        subtitle="Everything you need to ace the Loksewa exam, in one powerful platform."
        centered
      />

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <motion.div key={feature.title} {...fadeUp}>
            <Card className="card-hover h-full">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-ink-500/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-ink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-6">{feature.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {feature.highlights.map((h) => (
                    <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div className="mt-20 text-center" {...fadeUp}>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-4">Ready to Start Preparing?</h2>
        <p className="text-muted-foreground mb-6">Join 50,000+ aspirants already using AkalLoksewa.</p>
        <Link href="/auth/register">
          <Button size="lg" className="btn-press">Get Started — It&apos;s Free</Button>
        </Link>
      </motion.div>
    </div>
  )
}
