// ─────────────────────────────────────────────────────────────────────────────
// AkalLoksewa — Auth Types (IndexedDB Phase 1)
// All authentication-related TypeScript definitions.
// ─────────────────────────────────────────────────────────────────────────────

export type AvatarColor =
  | 'ink' | 'teal' | 'rose' | 'amber' | 'violet' | 'emerald' | 'sky' | 'fuchsia'

export type NepalProvince =
  | 'koshi' | 'madhesh' | 'bagmati' | 'gandaki'
  | 'lumbini' | 'karnali' | 'sudurpashchim'

export const PROVINCE_MAP: Record<NepalProvince, { nepali: string; english: string }> = {
  koshi:           { nepali: 'कोशी प्रदेश',       english: 'Province 1 (Koshi)' },
  madhesh:         { nepali: 'मधेस प्रदेश',       english: 'Province 2 (Madhesh)' },
  bagmati:         { nepali: 'बागमती प्रदेश',     english: 'Province 3 (Bagmati)' },
  gandaki:         { nepali: 'गण्डकी प्रदेश',      english: 'Province 4 (Gandaki)' },
  lumbini:         { nepali: 'लुम्बिनी प्रदेश',    english: 'Province 5 (Lumbini)' },
  karnali:         { nepali: 'कर्णाली प्रदेश',      english: 'Province 6 (Karnali)' },
  sudurpashchim:   { nepali: 'सुदूरपश्चिम प्रदेश', english: 'Province 7 (Sudurpashchim)' },
}

export const EXAM_TARGETS = [
  { value: 'kharidar',        label: 'Kharidar (Grade III)',        description: 'Entry-level civil service position' },
  { value: 'nayab-subba',    label: 'Nayab Subba (Grade II)',      description: 'Non-gazetted second class officer' },
  { value: 'adhikrit',       label: 'Adhikrit (Grade I)',          description: 'Non-gazetted first class officer' },
  { value: 'section-officer', label: 'Section Officer',             description: 'Gazetted third class officer' },
  { value: 'under-secretary', label: 'Under Secretary',             description: 'Gazetted second class officer' },
  { value: 'other',           label: 'Other',                       description: 'Other government examinations' },
] as const

export type ExamTarget = typeof EXAM_TARGETS[number]['value']

// ── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  language: 'en' | 'ne'
  defaultTestDuration: number           // minutes
  defaultQuestionCount: number
  negativeMarkingEnabled: boolean
  negativeMarkValue: number
  showKeyboardHints: boolean
  emailNotifications: boolean
  practiceReminder: boolean
  reminderTime?: string                 // "08:00"
  fontSize: 'normal' | 'large'
  optionLabelStyle: 'latin' | 'devanagari'
  autoAdvance: boolean                  // advance to next Q after answering
  showExplanationInPractice: 'immediate' | 'after-next' | 'manual'
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
}

// ── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  bio?: string
  targetExam?: ExamTarget
  targetDate?: number                   // unix ms
  province?: NepalProvince
  educationLevel?: string
  studyHoursPerDay?: number
  phone?: string
}

// ── User Stats ───────────────────────────────────────────────────────────────

export interface UserStats {
  totalQuestionsAttempted: number
  totalCorrect: number
  totalTests: number
  totalStudyMinutes: number
  currentStreak: number
  longestStreak: number
  lastPracticeDate: number
  subjectAccuracy: Record<string, number>
  joinedAt: number
}

// ── User Record ───────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string                            // nanoid(12)
  email: string
  username: string                      // lowercase, 3–20 chars, alphanumeric + underscore
  displayName: string
  passwordHash: string                  // SHA-256 of password+salt
  salt: string                          // nanoid(16)
  avatarColor: AvatarColor
  role: 'student' | 'admin'
  createdAt: number
  lastLoginAt: number
  profile: UserProfile
  preferences: UserPreferences
  stats: UserStats
}

// ── Session Record ───────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string                            // nanoid(32)
  userId: string
  createdAt: number
  expiresAt: number                     // createdAt + 30 days
  lastAccessAt: number
  userAgent?: string
}

// ── Auth State ────────────────────────────────────────────────────────────────

export interface AuthState {
  user: UserRecord | null
  session: SessionRecord | null
  isAuthenticated: boolean
  isLoading: boolean
}
