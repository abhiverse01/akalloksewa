'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function DualLogoLoader({ size = 40 }: { size?: number }) {
  const [showDark, setShowDark] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowDark((prev) => !prev)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {showDark ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src="/logo-dark.png"
              alt=""
              width={size}
              height={size}
              className="rounded-xl"
              unoptimized
            />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt=""
              width={size}
              height={size}
              className="rounded-xl"
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
