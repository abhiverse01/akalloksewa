'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: 'Free',
    period: ' forever',
    description: 'Everything you need to start your Loksewa preparation.',
    badge: 'Current',
    popular: false,
    features: [
      { label: '75,000+ Practice Questions', included: true },
      { label: '17 Subject Coverage', included: true },
      { label: 'Timed Mock Tests', included: true },
      { label: 'Performance Analytics', included: true },
      { label: 'Syllabus Tracker', included: true },
      { label: 'Smart Notes', included: true },
      { label: 'Bookmarking System', included: true },
      { label: 'Content Ingestor', included: true },
      { label: 'Keyboard Shortcuts', included: true },
      { label: 'Leaderboard', included: true },
      { label: 'AI-Powered Weak Area Detection', included: false },
      { label: 'Community Discussion Forum', included: false },
      { label: 'Video Explanations', included: false },
      { label: 'Priority Support', included: false },
    ],
    cta: 'Get Started Free',
    href: '/auth/register',
  },
  {
    name: 'Premium',
    price: 'Rs. 499',
    period: '/month',
    description: 'Unlock advanced features and accelerate your preparation.',
    badge: 'Coming Soon',
    popular: true,
    features: [
      { label: '75,000+ Practice Questions', included: true },
      { label: '17 Subject Coverage', included: true },
      { label: 'Timed Mock Tests', included: true },
      { label: 'Performance Analytics', included: true },
      { label: 'Syllabus Tracker', included: true },
      { label: 'Smart Notes', included: true },
      { label: 'Bookmarking System', included: true },
      { label: 'Content Ingestor', included: true },
      { label: 'Keyboard Shortcuts', included: true },
      { label: 'Leaderboard', included: true },
      { label: 'AI-Powered Weak Area Detection', included: true },
      { label: 'Community Discussion Forum', included: true },
      { label: 'Video Explanations', included: true },
      { label: 'Priority Support', included: true },
    ],
    cta: 'Get Early Access',
    href: '/contact',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export function PricingPageClient() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <PageHeader
        title="Simple, Transparent Pricing"
        subtitle="Start free, upgrade when you're ready. No hidden fees, no surprises."
        centered
      />

      <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <motion.div key={plan.name} {...fadeUp}>
            <Card className={`relative h-full ${plan.popular ? 'border-ink-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-ink-500 text-white gap-1">
                    <Sparkles className="w-3 h-3" /> {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant="secondary">{plan.badge}</Badge>
                </div>
                <div className="mt-3">
                  <span className="font-display text-4xl text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-6">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full btn-press"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div className="mt-12 text-center text-sm text-muted-foreground" {...fadeUp}>
        <p>Phase 1 is completely free. Premium features will be available in a future release.</p>
        <p className="mt-1">Questions? <Link href="/contact" className="text-ink-500 underline underline-offset-2">Contact us</Link>.</p>
      </motion.div>
    </div>
  )
}
