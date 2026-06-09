'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/practice',
  '/test',
  '/syllabus',
  '/notes',
  '/bookmarks',
  '/analytics',
  '/leaderboard',
  '/profile',
  '/settings',
  '/ingestor',
]

function isProtectedRoute(href: string): boolean {
  try {
    const url = new URL(href, 'http://localhost')
    const pathname = url.pathname
    return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
  } catch {
    return PROTECTED_PREFIXES.some((prefix) => href === prefix || href.startsWith(prefix + '/'))
  }
}

interface AuthGuardedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onClick?: () => void
  [key: string]: unknown
}

export function AuthGuardedLink({ href, children, className, style, ...props }: AuthGuardedLinkProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrated = useAuthStore((s) => s.hydrated)

  // Not a protected route → render normal Link
  if (!isProtectedRoute(href)) {
    return (
      <Link href={href} className={className} style={style} {...props}>
        {children}
      </Link>
    )
  }

  // Authenticated & store hydrated → render normal Link
  if (isAuthenticated && hydrated) {
    return (
      <Link href={href} className={className} style={style} {...props}>
        {children}
      </Link>
    )
  }

  // Unauthenticated or not yet hydrated → redirect to login with redirect param
  return (
    <Link
      href={`/auth/login?redirect=${encodeURIComponent(href)}`}
      className={className}
      style={style}
      {...props}
      title="Sign in to access"
    >
      {children}
    </Link>
  )
}
