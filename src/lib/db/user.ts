import type { LegacyUserProfile } from '@/types/user'
import { initDB } from './schema'

const DEFAULT_PROFILE: LegacyUserProfile = {
  id: 'default',
  displayName: 'Student',
  avatarInitials: 'S',
  dailyGoal: 20,
  streak: 0,
  lastActiveDate: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  preferences: {
    theme: 'system',
    fontSize: 'normal',
    defaultTimeLimit: 30,
    defaultNegativeMarking: true,
    defaultNegativeMarkValue: 0.25,
    defaultQuestionCount: 50,
  },
}

export async function getUserProfile(): Promise<LegacyUserProfile> {
  try {
    const db = await initDB()
    const profile = await db.get('userProfile', 'default')
    if (!profile) {
      await db.put('userProfile', DEFAULT_PROFILE)
      return DEFAULT_PROFILE
    }
    return profile
  } catch (err) {
    console.error('[user.getUserProfile] Error:', err)
    return DEFAULT_PROFILE
  }
}

export async function updateUserProfile(updates: Partial<LegacyUserProfile>): Promise<void> {
  try {
    const db = await initDB()
    const current = await getUserProfile()
    const updated = { ...current, ...updates, updatedAt: Date.now() }
    await db.put('userProfile', updated)
  } catch (err) {
    console.error('[user.updateUserProfile] Error:', err)
  }
}

export async function updateStreak(): Promise<LegacyUserProfile> {
  try {
    const profile = await getUserProfile()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let newStreak = profile.streak
    if (profile.lastActiveDate === today) {
      // Already active today
    } else if (profile.lastActiveDate === yesterday) {
      newStreak += 1
    } else {
      newStreak = 1
    }

    const updated = { ...profile, streak: newStreak, lastActiveDate: today, updatedAt: Date.now() }
    const db = await initDB()
    await db.put('userProfile', updated)
    return updated
  } catch (err) {
    console.error('[user.updateStreak] Error:', err)
    const profile = await getUserProfile()
    return profile
  }
}
