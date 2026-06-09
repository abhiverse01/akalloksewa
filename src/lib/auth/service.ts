/**
 * SECURITY MODEL — INDEXEDDB PHASE 1
 *
 * This authentication system is intentionally local-only. Key considerations:
 *
 * 1. Password storage: SHA-256(password + salt). Not bcrypt — Web Crypto API
 *    doesn't natively support bcrypt. This is acceptable for local storage where
 *    the threat model is different from server-side auth. The attacker would need
 *    physical access to extract IndexedDB data.
 *
 * 2. Session tokens: nanoid(32) stored in localStorage. No httpOnly cookie equivalent
 *    in a purely client-side app. XSS is the main threat — mitigated by CSP headers.
 *
 * 3. Phase 2 (Supabase): All of this layer is replaced by Supabase Auth. The UserRecord
 *    structure maps cleanly to Supabase's auth.users + a profiles table.
 *
 * 4. No rate limiting at the DB layer (it's all local). The UI shows a warning
 *    after 3 failed attempts but doesn't lock the account.
 */

import { nanoid } from 'nanoid'
import { getDBAsync } from '@/lib/db/schema'
import type { UserRecord, SessionRecord } from '@/types/auth'
import { DEFAULT_PREFERENCES } from './defaults'

// ── HASHING ──────────────────────────────────────────────────────────────
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── VALIDATION ────────────────────────────────────────────────────────────
export const AuthValidation = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  username: (v: string) => /^[a-z0-9_]{3,20}$/.test(v),
  password: (v: string) => v.length >= 8,
  displayName: (v: string) => v.trim().length >= 2 && v.trim().length <= 50,
}

// ── SIGNUP ────────────────────────────────────────────────────────────────
export interface SignupPayload {
  email: string
  username: string
  displayName: string
  password: string
}

export type SignupResult =
  | { success: true; user: UserRecord; session: SessionRecord }
  | { success: false; error: SignupError }

export type SignupError =
  | 'email-taken'
  | 'username-taken'
  | 'weak-password'
  | 'invalid-email'
  | 'invalid-username'
  | 'invalid-display-name'
  | 'db-error'

export async function signup(payload: SignupPayload): Promise<SignupResult> {
  const db = await getDBAsync()
  if (!db) return { success: false, error: 'db-error' }

  if (!AuthValidation.email(payload.email))
    return { success: false, error: 'invalid-email' }
  if (!AuthValidation.username(payload.username.toLowerCase()))
    return { success: false, error: 'invalid-username' }
  if (!AuthValidation.displayName(payload.displayName))
    return { success: false, error: 'invalid-display-name' }
  if (!AuthValidation.password(payload.password))
    return { success: false, error: 'weak-password' }

  try {
    const emailExists = await db.getFromIndex('users', 'by-email', payload.email.toLowerCase())
    if (emailExists) return { success: false, error: 'email-taken' }

    const usernameExists = await db.getFromIndex('users', 'by-username', payload.username.toLowerCase())
    if (usernameExists) return { success: false, error: 'username-taken' }
  } catch (err) {
    console.error('[signup] Error checking existing user:', err)
    return { success: false, error: 'db-error' }
  }

  const salt = nanoid(16)
  const passwordHash = await hashPassword(payload.password, salt)
  const avatarColors = ['ink','teal','rose','amber','violet','emerald','sky','fuchsia'] as const
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

  const now = Date.now()
  const user: UserRecord = {
    id: nanoid(12),
    email: payload.email.toLowerCase(),
    username: payload.username.toLowerCase(),
    displayName: payload.displayName.trim(),
    passwordHash,
    salt,
    avatarColor,
    role: 'student',
    createdAt: now,
    lastLoginAt: now,
    profile: {},
    preferences: { ...DEFAULT_PREFERENCES },
    stats: {
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalTests: 0,
      totalStudyMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: 0,
      subjectAccuracy: {},
      joinedAt: now,
    },
  }

  const session = createSessionRecord(user.id)

  try {
    await db.put('users', user)
    await db.put('sessions', session)
    persistSession(session.id)
    return { success: true, user, session }
  } catch (err) {
    console.error('[signup] Error saving user/session:', err)
    return { success: false, error: 'db-error' }
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
export type LoginResult =
  | { success: true; user: UserRecord; session: SessionRecord }
  | { success: false; error: 'invalid-credentials' | 'db-error' }

export async function login(emailOrUsername: string, password: string): Promise<LoginResult> {
  const db = await getDBAsync()
  if (!db) return { success: false, error: 'db-error' }

  const identifier = emailOrUsername.toLowerCase().trim()

  let user: UserRecord | undefined
  try {
    user = await db.getFromIndex('users', 'by-email', identifier)
    if (!user) user = await db.getFromIndex('users', 'by-username', identifier)
  } catch (err) {
    console.error('[login] Error fetching user:', err)
    return { success: false, error: 'db-error' }
  }

  if (!user) return { success: false, error: 'invalid-credentials' }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.passwordHash) return { success: false, error: 'invalid-credentials' }

  user.lastLoginAt = Date.now()
  try {
    await db.put('users', user)
  } catch (err) {
    console.error('[login] Error updating lastLoginAt:', err)
    return { success: false, error: 'db-error' }
  }

  const session = createSessionRecord(user.id)
  try {
    await db.put('sessions', session)
  } catch (err) {
    console.error('[login] Error saving session:', err)
    return { success: false, error: 'db-error' }
  }
  persistSession(session.id)

  return { success: true, user, session }
}

// ── SESSION ───────────────────────────────────────────────────────────────
const SESSION_KEY = 'akal_session_id'

function persistSession(sessionId: string) {
  localStorage.setItem(SESSION_KEY, sessionId)
}

function createSessionRecord(userId: string): SessionRecord {
  const now = Date.now()
  return {
    id: nanoid(32),
    userId,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    lastAccessAt: now,
  }
}

export async function resolveSession(): Promise<{ user: UserRecord; session: SessionRecord } | null> {
  const sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) return null

  const db = await getDBAsync()
  if (!db) return null

  try {
    const session = await db.get('sessions', sessionId)
    if (!session || session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    const user = await db.get('users', session.userId)
    if (!user) return null

    session.lastAccessAt = Date.now()
    await db.put('sessions', session)

    return { user, session }
  } catch (err) {
    console.error('[resolveSession] Error resolving session:', err)
    return null
  }
}

export async function logout(): Promise<void> {
  const sessionId = localStorage.getItem(SESSION_KEY)
  if (sessionId) {
    const db = await getDBAsync()
    if (db) {
      try { await db.delete('sessions', sessionId) } catch (err) { console.error('[logout] Error deleting session:', err) }
    }
    localStorage.removeItem(SESSION_KEY)
  }
}

// ── PASSWORD CHANGE ────────────────────────────────────────────────────────
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { success: false; error: 'invalid-current' | 'weak-password' | 'db-error' }> {
  const db = await getDBAsync()
  if (!db) return { success: false, error: 'db-error' }

  if (!AuthValidation.password(newPassword))
    return { success: false, error: 'weak-password' }

  const user = await db.get('users', userId)
  if (!user) return { success: false, error: 'db-error' }

  const currentHash = await hashPassword(currentPassword, user.salt)
  if (currentHash !== user.passwordHash)
    return { success: false, error: 'invalid-current' }

  const newSalt = nanoid(16)
  const newHash = await hashPassword(newPassword, newSalt)
  user.passwordHash = newHash
  user.salt = newSalt

  try {
    await db.put('users', user)
    return { success: true }
  } catch (err) {
    console.error('[changePassword] Error updating password:', err)
    return { success: false, error: 'db-error' }
  }
}

// ── UPDATE USER ───────────────────────────────────────────────────────────
export async function updateUserRecord(partial: Partial<UserRecord>): Promise<boolean> {
  const db = await getDBAsync()
  if (!db || !partial.id) return false

  try {
    const existing = await db.get('users', partial.id)
    if (!existing) return false
    const updated = { ...existing, ...partial }
    await db.put('users', updated)
    return true
  } catch (err) {
    console.error('[updateUserRecord] Error updating user:', err)
    return false
  }
}

// ── USERNAME CHECK ────────────────────────────────────────────────────────
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const db = await getDBAsync()
  if (!db) return true  // If DB not ready, assume available (don't block the user)
  try {
    const existing = await db.getFromIndex('users', 'by-username', username.toLowerCase())
    return !existing
  } catch (err) {
    console.error('[isUsernameAvailable] Error checking username:', err)
    return true
  }
}
