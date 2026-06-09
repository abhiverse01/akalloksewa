'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface LegalPageLayoutProps {
  title: string
  effectiveDate: string
  lastUpdated?: string
  children: React.ReactNode
}

export function LegalPageLayout({
  title,
  effectiveDate,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  const handlePrint = () => window.print()

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-foreground mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>Effective: {effectiveDate}</span>
            {lastUpdated && <span>Last updated: {lastUpdated}</span>}
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="w-4 h-4 mr-2" />
            Print this page
          </Button>
        </div>

        {/* Content - prose typography */}
        <div className="prose prose-sm sm:prose max-w-none
          [&_h2]:font-display [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground
          [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-foreground
          [&_p]:text-muted-foreground [&_p]:leading-7 [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
          [&_li]:text-muted-foreground [&_li]:leading-7
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
          [&_strong]:text-foreground [&_strong]:font-semibold
          [&_a]:text-brand-500 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-600
          [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_hr]:border-border [&_hr]:my-8
        ">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AkalLoksewa. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  )
}
