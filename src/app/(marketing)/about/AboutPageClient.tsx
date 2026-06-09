'use client'

import { motion } from 'framer-motion'
import { Target, Heart, Lightbulb, Users, MessageCircle, Mail } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

const team = [
  {
    name: 'Abhishek Shah',
    role: 'Founder & Lead Developer',
    bio: 'Full-stack developer and the technical force behind AkalLoksewa. Built the entire platform from scratch — from the smart question bank and ingestor engine to the analytics dashboard — with a mission to make Loksewa preparation accessible for every Nepali aspirant.',
  },
  {
    name: 'Aachal Kumari',
    role: 'Founder & Management & Frontend',
    bio: 'Drives the vision, strategy, and frontend design of AkalLoksewa. Ensures the platform is beautiful, intuitive, and truly serves the needs of Loksewa aspirants across Nepal.',
  },
]

const values = [
  { icon: Target, title: 'Excellence', desc: 'We strive for the highest quality in every question, explanation, and feature we build.' },
  { icon: Heart, title: 'Accessibility', desc: 'Quality education should be accessible to everyone. We keep core features free forever.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'We leverage modern technology to make exam preparation smarter, not harder.' },
  { icon: Users, title: 'Community', desc: 'We are building more than a tool — we are building a community of aspirants helping each other.' },
]

export function AboutPageClient() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-12 sm:mb-16"
      >
        <h1
          className="t-display-lg text-3xl sm:text-4xl lg:text-5xl tracking-tight"
          style={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            color: 'var(--text-primary)',
          }}
        >
          About AkalLoksewa
        </h1>
        <p
          className="t-body-lg mt-3 max-w-2xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Empowering Nepal&apos;s future civil servants with smart, accessible preparation tools.
        </p>
      </motion.div>

      {/* Story */}
      <motion.section className="mb-12 sm:mb-16" {...fadeUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-4">
            <h2
              className="t-heading-xl"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Our Story
            </h2>
            <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
              AkalLoksewa was born from a simple frustration: preparing for Nepal&apos;s Loksewa examination
              shouldn&apos;t be harder than the exam itself. Thousands of aspirants spend months searching for
              quality practice materials, tracking their progress on paper, and studying without clear
              analytics on their strengths and weaknesses.
            </p>
            <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
              In 2024, we set out to build a comprehensive, modern platform that brings together everything a
              Loksewa aspirant needs — a smart question bank, timed mock tests, detailed analytics, note-taking,
              and more — all in one place. Our mission is to level the playing field and give every aspirant,
              regardless of their location or background, access to world-class preparation tools.
            </p>
          </div>
          <div
            className="relative h-52 sm:h-64 md:h-80 flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: 16,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="relative z-10 text-center p-6">
              <span
                className="t-heading-xl"
                style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  color: 'var(--ink-400)',
                }}
              >
                50,000+
              </span>
              <p className="t-body-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                aspirants trust AkalLoksewa
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mission & Values */}
      <motion.section className="mb-12 sm:mb-16" {...fadeUp}>
        <h2
          className="t-heading-xl text-center mb-8 sm:mb-10"
          style={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            color: 'var(--text-primary)',
          }}
        >
          Our Mission & Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="text-center p-5 sm:p-6 transition-colors duration-200 hover:border-[var(--border-default)]"
                style={{
                  borderRadius: 16,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                  style={{ background: 'rgba(51, 88, 196, 0.12)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--ink-400)' }} />
                </div>
                <h3 className="t-heading-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="t-body-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Team */}
      <motion.section className="mb-12 sm:mb-16" {...fadeUp}>
        <h2
          className="t-heading-xl text-center mb-8 sm:mb-10"
          style={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            color: 'var(--text-primary)',
          }}
        >
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="p-5 sm:p-6 transition-colors duration-200 hover:border-[var(--border-default)]"
              style={{
                borderRadius: 16,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--ink-500), var(--ink-600))',
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="t-heading-sm" style={{ color: 'var(--text-primary)' }}>
                    {member.name}
                  </h3>
                  <p className="t-body-sm" style={{ color: 'var(--ink-400)' }}>
                    {member.role}
                  </p>
                </div>
              </div>
              <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section {...fadeUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { value: '17', label: 'Subjects Covered' },
            { value: '75,000+', label: 'Practice Questions' },
            { value: '50,000+', label: 'Active Aspirants' },
            { value: '92%', label: 'User Satisfaction' },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="t-heading-xl"
                style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  color: 'var(--ink-400)',
                }}
              >
                {stat.value}
              </div>
              <div className="t-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Have Questions? CTA */}
      <motion.section
        className="mt-12 sm:mt-16"
        {...fadeUp}
      >
        <div
          className="text-center p-8 sm:p-12 rounded-2xl relative overflow-hidden"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <motion.div
            className="relative z-10"
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center size-12 rounded-full mb-4"
              style={{ background: 'rgba(37,64,160,0.12)' }}
              whileHover={{ scale: 1.1 }}
            >
              <MessageCircle className="size-5" style={{ color: 'var(--ink-400)' }} />
            </motion.div>
            <h3
              className="t-heading-xl mb-3"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Have questions?
            </h3>
            <p className="t-body mb-6 max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
              We&apos;re here to help. Reach out to us on Instagram or email, and we&apos;ll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.a
                href="https://instagram.com/akalloksewa"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200"
                style={{
                  background: 'var(--ink-500)',
                  color: 'white',
                }}
              >
                <MessageCircle className="size-4" />
                Message us on Instagram
              </motion.a>
              <motion.a
                href="mailto:akalloksewa@gmail.com"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Mail className="size-4" />
                Email us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
