'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Database } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
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
      error?.message?.includes('not allowed') ||
      error.message?.includes('security'))

  const getErrorTitle = () => {
    if (isPrivateBrowsing) return 'Private Browsing Detected'
    if (isIDBError) return 'Database Error'
    return 'Something Went Wrong'
  }

  const getErrorMessage = () => {
    if (isPrivateBrowsing) {
      return 'Your browser is in private/incognito mode, which blocks database storage. Please use normal browsing mode.'
    }
    if (isIDBError) {
      return 'A database error occurred. This may be caused by restricted browser settings or storage limitations.'
    }
    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <html lang="en" data-theme="light">
      <body style={{ background: '#f7f8fc', color: '#08091a', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: isIDBError ? 'rgba(245, 158, 11, 0.1)' : 'rgba(193, 39, 45, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              {isIDBError ? (
                <Database style={{ width: '32px', height: '32px', color: '#c1272d' }} />
              ) : (
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#c1272d' }} />
              )}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#08091a' }}>
              {getErrorTitle()}
            </h1>
            <p style={{ fontSize: '14px', color: '#5a6490', marginBottom: '8px' }}>
              {getErrorMessage()}
            </p>

            {isPrivateBrowsing && (
              <p style={{
                fontSize: '12px', color: '#b45309', marginBottom: '24px',
                background: 'rgba(245, 158, 11, 0.08)', padding: '8px 12px',
                borderRadius: '8px',
              }}>
                Tip: Close this private window and open a regular browser window.
              </p>
            )}

            {process.env.NODE_ENV === 'development' && error.message && (
              <p style={{
                fontSize: '13px', color: 'rgba(193, 39, 45, 0.8)', marginBottom: '24px',
                fontFamily: 'monospace', background: 'rgba(193, 39, 45, 0.05)',
                padding: '12px', borderRadius: '8px', wordBreak: 'break-word',
              }}>
                {error.message}
              </p>
            )}

            {!isPrivateBrowsing && (
              <button
                onClick={reset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px',
                  border: '1px solid rgba(18, 22, 64, 0.14)', background: 'white',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                  marginBottom: '12px', width: '100%',
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} /> Reload
              </button>
            )}

            <button
              onClick={() => (window.location.href = '/')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                border: 'none', background: '#2540a0', color: 'white',
                cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                width: '100%',
              }}
            >
              <Home style={{ width: '16px', height: '16px' }} /> Go to Dashboard
            </button>

            <p style={{ marginTop: '24px', fontSize: '12px', color: '#9aa3c0' }}>
              AkalLoksewa — If this persists, please contact us.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
