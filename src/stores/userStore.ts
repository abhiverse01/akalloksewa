import { create } from 'zustand'
import type { LegacyUserProfile } from '@/types/user'

interface UserState {
  profile: LegacyUserProfile | null
  isLoaded: boolean
  setProfile: (profile: LegacyUserProfile) => void
  updateProfile: (updates: Partial<LegacyUserProfile>) => void
  setLoaded: (loaded: boolean) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoaded: false,
  setProfile: (profile) => set({ profile, isLoaded: true }),
  updateProfile: (updates) => {
    const { profile } = get()
    if (!profile) return
    set({ profile: { ...profile, ...updates } })
  },
  setLoaded: (loaded) => set({ isLoaded: loaded }),
}))
