import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UserRecord, SessionRecord } from '@/types/auth'
import { resolveSession, logout as logoutService } from '@/lib/auth/service'

interface AuthStore {
  user: UserRecord | null
  session: SessionRecord | null
  isAuthenticated: boolean
  isLoading: boolean
  hydrated: boolean

  hydrate: () => Promise<void>
  setUser: (user: UserRecord) => void
  setSession: (session: SessionRecord) => void
  updateUser: (patch: Partial<UserRecord>) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    hydrated: false,

    hydrate: async () => {
      set({ isLoading: true })
      try {
        const result = await resolveSession()
        if (result) {
          set({
            user: result.user,
            session: result.session,
            isAuthenticated: true,
          })
        }
      } catch (err) {
        console.error('[authStore.hydrate] Failed to resolve session:', err)
      } finally {
        set({ isLoading: false, hydrated: true })
      }
    },

    setUser: (user) => set({ user, isAuthenticated: true }),

    setSession: (session) => set({ session }),

    updateUser: (patch) => {
      const current = get().user
      if (current) {
        const updated = { ...current, ...patch }
        set({ user: updated })
      }
    },

    logout: async () => {
      try {
        await logoutService()
      } catch (err) {
        console.error('[authStore.logout] Failed:', err)
      } finally {
        set({ user: null, session: null, isAuthenticated: false })
      }
    },
  }))
)
