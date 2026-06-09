'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function AuthLoadingScreen() {
  const [showDark, setShowDark] = useState(true)

  // Alternate between dark and light logo every 1.2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowDark((prev) => !prev)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'var(--ink-950, #0a0e1a)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Dual-logo crossfade container */}
        <div className="relative size-20">
          <AnimatePresence mode="wait">
            {showDark ? (
              <motion.div
                key="dark"
                initial={{ opacity: 0, scale: 0.95, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src="/logo-dark.png"
                  alt="AkalLoksewa"
                  width={80}
                  height={80}
                  className="rounded-2xl"
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ opacity: 0, scale: 0.95, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="AkalLoksewa"
                  width={80}
                  height={80}
                  className="rounded-2xl"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand name with pulse */}
        <motion.p
          className="text-[15px] font-semibold tracking-tight"
          style={{
            color: 'var(--ink-200, #8fa4ef)',
            fontFamily: 'var(--font-fraunces), Georgia, serif',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          akalloksewa
        </motion.p>

        {/* Subtle progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block size-1.5 rounded-full"
              style={{ background: 'var(--ink-400, #3358c4)' }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
