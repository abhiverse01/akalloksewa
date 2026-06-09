export interface LegacyUserProfile {
  id: string
  displayName: string
  email?: string
  avatarInitials: string
  dailyGoal: number
  streak: number
  lastActiveDate: string
  createdAt: number
  updatedAt: number
  preferences: LegacyUserPreferences
}

export interface LegacyUserPreferences {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'normal' | 'large'
  defaultTimeLimit: number
  defaultNegativeMarking: boolean
  defaultNegativeMarkValue: number
  defaultQuestionCount: number
}
