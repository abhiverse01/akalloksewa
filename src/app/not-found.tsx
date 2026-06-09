'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="size-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--bg-raised)' }}>
          <FileQuestion className="size-8" style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
          Page Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--ink-500)', color: '#fff' }}
          >
            <Home className="size-4" /> Go Home
          </Link>
          <Link
            href="/features"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <ArrowLeft className="size-4" /> Explore Features
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
