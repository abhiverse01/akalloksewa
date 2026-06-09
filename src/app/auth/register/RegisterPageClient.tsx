'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { signup, isUsernameAvailable, type SignupError } from '@/lib/auth/service'
import { useAuthStore } from '@/stores/authStore'
import { updateUserRecord } from '@/lib/auth/service'
import { EXAM_TARGETS } from '@/types/auth'
import type { ExamTarget } from '@/types/auth'
import { useDB } from '@/hooks/useDB'

// ── Zod Schema ──────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    username: z
      .string()
      .regex(/^[a-z0-9_]{3,20}$/, 'Lowercase letters, numbers, or underscores only (3-20)'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    examTarget: z.string().optional(),
    termsAccepted: z.literal(true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ── Error Messages ───────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<SignupError, string> = {
  'email-taken': 'This email is already registered. Try signing in instead.',
  'username-taken': 'This username is taken. Try another one.',
  'weak-password': 'Password must be at least 8 characters.',
  'invalid-email': 'Please enter a valid email address.',
  'invalid-username':
    'Username must be 3-20 lowercase letters, numbers, or underscores.',
  'invalid-display-name': 'Name must be 2-50 characters.',
  'db-error': 'Something went wrong. Please try again.',
}

// ── Password Strength ───────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number
  label: string
  segments: boolean[]
} {
  const segments = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    password.length >= 12,
  ]
  const score = segments.filter(Boolean).length
  let label = 'Weak'
  if (score >= 4) label = 'Strong'
  else if (score >= 3) label = 'Good'
  else if (score >= 2) label = 'Fair'
  return { score, label, segments }
}

// ── Component ────────────────────────────────────────────────────────────

export function RegisterPageClient() {
  const router = useRouter()
  const { setUser, setSession } = useAuthStore()
  const { isReady: dbReady } = useDB()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<SignupError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)

  // ── Username availability ────────────────────────────────────────────
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkUsername = useCallback((username: string) => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    usernameTimerRef.current = setTimeout(async () => {
      const available = await isUsernameAvailable(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 600)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    }
  }, [])

  // ── Form ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      examTarget: '',
      termsAccepted: undefined,
    },
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const username = watch('username')
  const termsAccepted = watch('termsAccepted')
  const strength = getPasswordStrength(password)

  // Watch username for availability check
  useEffect(() => {
    if (username && username.length >= 3) {
      checkUsername(username)
    } else {
      setUsernameStatus('idle')
    }
  }, [username, checkUsername])

  // ── Submit ──────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null)
    setIsSubmitting(true)

    try {
      const result = await signup({
        displayName: data.displayName,
        username: data.username,
        email: data.email,
        password: data.password,
      })

      if (!result.success) {
        setApiError(result.error)
        setIsSubmitting(false)
        return
      }

      // Save exam target to user profile
      if (data.examTarget) {
        await updateUserRecord({
          id: result.user.id,
          profile: { ...result.user.profile, targetExam: data.examTarget as ExamTarget },
        })
      }

      // Update auth store
      setUser(result.user)
      setSession(result.session)

      // Success animation
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/onboarding')
      }, 800)
    } catch (err) {
      console.error('[RegisterPageClient] Signup error:', err)
      setApiError('db-error')
      setIsSubmitting(false)
    }
  }

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword

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
            className="t-display-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            Create your account
          </h1>
          <p className="mt-3 t-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have one?{' '}
            <Link
              href="/auth/login"
              className="underline underline-offset-2 transition-colors duration-150"
              style={{ color: 'var(--ink-400)' }}
            >
              Sign in →
            </Link>
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ramesh Sharma"
              {...register('displayName')}
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
            {errors.displayName && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                placeholder="ramesh_sharma"
                {...register('username')}
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
              {/* Availability indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <Loader2
                    className="size-3.5 spin"
                    style={{ color: 'var(--text-faint)' }}
                  />
                )}
                {usernameStatus === 'available' && (
                  <CheckCircle2 className="size-4" style={{ color: 'var(--green-400)' }} />
                )}
                {usernameStatus === 'taken' && (
                  <XCircle className="size-4" style={{ color: 'var(--red-400)' }} />
                )}
              </div>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              Used to identify you on leaderboards. Lowercase only.
            </p>
            {errors.username && (
              <p className="mt-1 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="ramesh@example.com"
              {...register('email')}
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
            {errors.email && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

            {/* Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-1">
                  {strength.segments.map((active, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-colors duration-200"
                      style={{
                        width: '25%',
                        background: active
                          ? i === 3
                            ? 'var(--gold-400)'
                            : 'var(--green-400)'
                          : 'var(--border-subtle)',
                      }}
                    />
                  ))}
                </div>
                <p
                  className="mt-1 text-xs"
                  style={{
                    color:
                      strength.score <= 1
                        ? 'var(--red-400)'
                        : strength.score === 2
                          ? 'var(--amber-400)'
                          : strength.score === 3
                            ? 'var(--green-400)'
                            : 'var(--gold-400)',
                  }}
                >
                  {strength.label}
                </p>
              </div>
            )}

            {errors.password && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword')}
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {confirmPassword.length > 0 &&
                  (passwordMatch ? (
                    <CheckCircle2 className="size-4" style={{ color: 'var(--green-400)' }} />
                  ) : (
                    <XCircle className="size-4" style={{ color: 'var(--red-400)' }} />
                  ))}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--red-400)' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Exam Target */}
          <div>
            <label className="block t-heading-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Target exam (optional)
            </label>
            <select
              {...register('examTarget')}
              className="w-full h-11 rounded-md px-4 text-sm outline-none transition-colors duration-150 appearance-none"
              style={{
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' stroke='%239aa3c0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ink-400)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <option value="">Select your target exam</option>
              {EXAM_TARGETS.map((exam) => (
                <option key={exam.value} value={exam.value}>
                  {exam.label}
                </option>
              ))}
            </select>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={termsChecked}
              onClick={() => {
                const next = !termsChecked
                setTermsChecked(next)
                setValue('termsAccepted', next ? true : undefined as unknown as true, {
                  shouldValidate: true,
                })
              }}
              className="mt-0.5 size-4 shrink-0 rounded-[4px] flex items-center justify-center transition-colors duration-150"
              style={{
                border: '1px solid var(--border-subtle)',
                background: termsChecked ? 'var(--ink-400)' : 'transparent',
              }}
            >
              {termsChecked && (
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
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              I agree to the{' '}
              <Link
                href="/terms"
                className="underline underline-offset-2"
                style={{ color: 'var(--ink-400)' }}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-2"
                style={{ color: 'var(--ink-400)' }}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
          {errors.termsAccepted && (
            <p className="text-xs" style={{ color: 'var(--red-400)' }}>
              {errors.termsAccepted.message}
            </p>
          )}

          {/* API Error */}
          {apiError && (
            <div
              className="rounded-md px-4 py-3 text-sm"
              style={{
                background: 'var(--red-50)',
                color: 'var(--red-500)',
                border: '1px solid var(--red-100)',
              }}
            >
              {ERROR_MESSAGES[apiError]}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess || !dbReady}
            className="w-full h-12 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: isSuccess ? 'var(--green-400)' : 'var(--gold-400)',
              color: isSuccess ? '#ffffff' : 'var(--ink-950)',
              cursor: isSubmitting || isSuccess || !dbReady ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || isSuccess || !dbReady ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && !isSuccess) {
                e.currentTarget.style.background = 'var(--gold-300)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSuccess) {
                e.currentTarget.style.background = 'var(--gold-400)'
              }
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 spin" />
                Creating account...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="size-4" />
                Account created!
              </>
            ) : !dbReady ? (
              <>
                <Loader2 className="size-4 spin" />
                Preparing...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mt-8">
          <hr className="flex-1 hairline" />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            or
          </span>
          <hr className="flex-1 hairline" />
        </div>
        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-faint)' }}>
          Google login coming soon
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
