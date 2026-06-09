'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { login } from '@/lib/auth/service'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import { useDB } from '@/hooks/useDB'

// ── Zod Schema ──────────────────────────────────────────────────────────

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ── Component ────────────────────────────────────────────────────────────

export function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setSession } = useAuthStore()
  const { toast } = useToast()
  const { isReady: dbReady } = useDB()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // ── Signed out toast ────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.has('signedout')) {
      toast({
        title: "You've been signed out.",
        duration: 3000,
      })
      // Clean the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('signedout')
      router.replace(url.pathname)
    }
  }, [searchParams, toast, router])

  // ── Redirect param ──────────────────────────────────────────────────
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // ── Form ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  // ── Submit ──────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null)
    setIsSubmitting(true)

    try {
      const result = await login(data.identifier, data.password)

      if (!result.success) {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        setLoginError('Invalid email/username or password')
        setIsSubmitting(false)
        return
      }

      // Success
      setUser(result.user)
      setSession(result.session)
      setIsSubmitting(false)
      // Use router.replace so the login page doesn't remain in browser history
      router.replace(redirectTo)
    } catch (err) {
      console.error('[LoginPageClient] Login error:', err)
      setLoginError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // ── Clear & start over ──────────────────────────────────────────────
  const handleClearAndStartOver = useCallback(async () => {
    // Clear localStorage session
    localStorage.removeItem('akal_session_id')

    // Clear IndexedDB stores
    try {
      const { openDB } = await import('idb')
      const db = await openDB('akalloksewa')
      const tx = db.transaction(['users', 'sessions'], 'readwrite')
      await Promise.all([
        tx.objectStore('users').clear(),
        tx.objectStore('sessions').clear(),
        tx.done,
      ])
    } catch {
      // Best effort
    }

    // Reload
    window.location.reload()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-sm w-full"
    >
      {/* ── Card wrapper with glass effect ── */}
      <div
        style={{
          background: 'rgba(13, 16, 48, 0.6)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1
            className="t-display-lg italic"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            Welcome back.
          </h1>
          <p className="mt-3 t-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="underline underline-offset-2 transition-colors duration-150"
              style={{ color: 'var(--ink-400)' }}
            >
              Sign up →
            </Link>
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email or Username */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email or username
            </label>
            <input
              type="text"
              autoComplete="username email"
              placeholder="you@example.com"
              {...register('identifier')}
              className="w-full h-11 rounded-md px-4 text-sm outline-none transition-colors duration-150"
              style={{
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ink-400)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            />
            {errors.identifier && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="t-heading-sm" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="t-body-sm transition-colors duration-150"
                style={{ color: 'var(--ink-400)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--ink-300)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--ink-400)'
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full h-11 rounded-md px-4 pr-10 text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--bg-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ink-400)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors duration-150"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-faint)'
                }}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Inline Message */}
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-md px-4 py-3 text-xs leading-relaxed"
              style={{
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Data is stored locally. If you forgot your password, you can reset your account data.
              <button
                type="button"
                onClick={handleClearAndStartOver}
                className="block mt-2 t-heading-sm underline underline-offset-2 transition-colors duration-150"
                style={{ color: 'var(--red-400)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--red-500)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--red-400)'
                }}
              >
                Clear &amp; start over
              </button>
            </motion.div>
          )}

          {/* Login Error */}
          {loginError && (
            <div
              className="rounded-md px-4 py-3 text-sm"
              style={{
                background: 'var(--red-50)',
                color: 'var(--red-500)',
                border: '1px solid var(--red-100)',
              }}
            >
              {loginError}
            </div>
          )}

          {/* Failed Attempts Warning */}
          {failedAttempts >= 3 && (
            <p className="text-xs" style={{ color: 'var(--amber-400)' }}>
              Having trouble? Make sure you&apos;re using the correct email/username and
              password. Data is stored in this browser.
            </p>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className="size-4 shrink-0 rounded-[4px] flex items-center justify-center transition-colors duration-150"
              style={{
                border: '1px solid var(--border-subtle)',
                background: rememberMe ? 'var(--ink-400)' : 'transparent',
              }}
            >
              {rememberMe && (
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M1 4l2.5 3L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Remember me
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !dbReady}
            className="w-full h-12 rounded-md text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: 'var(--ink-500)',
              cursor: isSubmitting || !dbReady ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !dbReady ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'var(--ink-600)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--ink-500)'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 spin" />
                Signing in...
              </>
            ) : !dbReady ? (
              <>
                <Loader2 className="size-4 spin" />
                Preparing...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* ── Bottom Note ────────────────────────────────────────────────── */}
        <p
          className="text-center mt-6 t-caption"
          style={{ color: 'var(--text-faint)' }}
        >
          Your data is stored securely in your browser. Nothing is sent to any server.
        </p>
      </div>

      {/* ── Spinner keyframe ──────────────────────────────────────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </motion.div>
  )
}
