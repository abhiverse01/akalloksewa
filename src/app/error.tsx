'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Database } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  // Detect IndexedDB / private browsing errors
  const isIDBError =
    error.message?.includes('IDB') ||
    error.message?.includes('IndexedDB') ||
    error.message?.includes('idb') ||
    error.message?.includes('database') ||
    error.message?.includes('storage')

  const isPrivateBrowsing =
    isIDBError &&
    (error.message?.includes('blocked') ||
      error.message?.includes('quota') ||
      error.message?.includes('not allowed') ||
      error.message?.includes('security'))

  const getErrorMessage = () => {
    if (isPrivateBrowsing) {
      return 'Your browser is in private/incognito mode, which blocks database storage. Please use normal browsing mode to use this app.'
    }
    if (isIDBError) {
      return 'A database error occurred. This may be caused by restricted browser settings or storage limitations.'
    }
    return 'An unexpected error occurred. We apologize for the inconvenience.'
  }

  const getErrorTitle = () => {
    if (isPrivateBrowsing) return 'Private Browsing Detected'
    if (isIDBError) return 'Database Error'
    return 'Something Went Wrong'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card style={{ borderColor: 'rgba(193, 39, 45, 0.3)' }}>
          <CardContent className="p-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(193, 39, 45, 0.1)' }}
            >
              {isIDBError ? (
                <Database className="w-8 h-8" style={{ color: 'var(--red-500)' }} />
              ) : (
                <AlertTriangle className="w-8 h-8" style={{ color: 'var(--red-500)' }} />
              )}
            </div>

            <h1
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: 'var(--text-primary)' }}
            >
              {getErrorTitle()}
            </h1>
            <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {getErrorMessage()}
            </p>

            {isPrivateBrowsing && (
              <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: 'var(--amber-600)', background: 'rgba(245, 158, 11, 0.08)' }}>
                Tip: Close this private window and open a regular browser window.
              </p>
            )}

            {process.env.NODE_ENV === 'development' && error.message && (
              <p
                className="text-sm font-mono mb-6 rounded-lg p-3 break-words"
                style={{ color: 'rgba(193, 39, 45, 0.8)', background: 'rgba(193, 39, 45, 0.05)' }}
              >
                {error.message}
              </p>
            )}

            {!isPrivateBrowsing && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
                <Button onClick={reset} variant="outline" className="btn-press">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reload
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => (window.location.href = '/')} className="btn-press">
                <Home className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </div>

            <p className="mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
              {APP_NAME} — If this persists, please{' '}
              <a href="/contact" className="underline underline-offset-2" style={{ color: 'var(--ink-400)' }}>contact us</a>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
