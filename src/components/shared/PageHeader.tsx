'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
  centered?: boolean
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
  centered = false,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col gap-2', centered && 'text-center items-center', className)}
    >
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl tracking-tight"
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-base sm:text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
      {children && <div className={cn('mt-3', centered && 'justify-center')}>{children}</div>}
    </motion.div>
  )
}
