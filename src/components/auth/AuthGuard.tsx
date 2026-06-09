'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { AuthLoadingScreen } from './AuthLoadingScreen'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hydrated, hydrate } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const hydrationStarted = useRef(false)

  useEffect(() => {
    if (!hydrationStarted.current) {
      hydrationStarted.current = true
      hydrate()
    }
  }, [hydrate])

  useEffect(() => {
    if (hydrated && !isAuthenticated && !isLoading) {
      // Small delay to avoid flash-redirect during initial hydration
      const timer = setTimeout(() => {
        router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [hydrated, isAuthenticated, isLoading, pathname, router])

  if (!hydrated || isLoading || !isAuthenticated) return <AuthLoadingScreen />
  return <>{children}</>
}
