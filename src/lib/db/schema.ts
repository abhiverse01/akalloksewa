import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Question, LoksewaSubject, Difficulty, QuestionStatus } from '@/types/question'
import type { TestSession } from '@/types/test'
import type { IngestBatch } from '@/types/ingestor'
import type { AnalyticsEvent } from '@/types/analytics'
import type { UserRecord, SessionRecord } from '@/types/auth'
import type { LegacyUserProfile as UserProfile } from '@/types/user'

export interface DailyChallenge {
  date: string          // YYYYMMDD format
  questionIds: string[]
  status: 'available' | 'in-progress' | 'completed' | 'skipped'
  score?: number
  completedAt?: number
  userId: string
}

export interface Achievement {
  id: string
  userId: string
  triggeredAt: number
  type: string
}

export interface Note {
  id: string
  title: string
  content: string
  subject?: LoksewaSubject
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface AkalDB extends DBSchema {
  questions: {
    key: string
    value: Question
    indexes: {
      'by-subject': LoksewaSubject
      'by-difficulty': Difficulty
      'by-status': QuestionStatus
      'by-year': number
      'by-createdAt': number
    }
  }
  testSessions: {
    key: string
    value: TestSession
    indexes: {
      'by-status': string
      'by-startedAt': number
    }
  }
  ingestBatches: {
    key: string
    value: IngestBatch
    indexes: { 'by-status': string; 'by-createdAt': number }
  }
  notes: {
    key: string
    value: Note
    indexes: { 'by-subject': string; 'by-updatedAt': number }
  }
  bookmarks: {
    key: string
    value: { questionId: string; savedAt: number; note?: string }
  }
  analyticsEvents: {
    key: string
    value: AnalyticsEvent
    indexes: { 'by-type': string; 'by-timestamp': number }
  }
  userProfile: {
    key: string
    value: UserProfile
  }
  users: {
    key: string
    value: UserRecord
    indexes: {
      'by-email': string
      'by-username': string
      'by-createdAt': number
    }
  }
  sessions: {
    key: string
    value: SessionRecord
    indexes: {
      'by-userId': string
      'by-expiresAt': number
    }
  }
  dailyChallenges: {
    key: string
    value: DailyChallenge
    indexes: {
      'by-date': string
      'by-userId': string
    }
  }
  achievements: {
    key: string
    value: Achievement
    indexes: {
      'by-userId': string
      'by-triggeredAt': number
    }
  }
}

export const DB_NAME = 'akalloksewa'
export const DB_VERSION = 3

let dbInstance: IDBPDatabase<AkalDB> | null = null

export async function initDB(): Promise<IDBPDatabase<AkalDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<AkalDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // ── Version 1 stores (original) ──
      if (!db.objectStoreNames.contains('questions')) {
        const qStore = db.createObjectStore('questions', { keyPath: 'id' })
        qStore.createIndex('by-subject', 'subject')
        qStore.createIndex('by-difficulty', 'difficulty')
        qStore.createIndex('by-status', 'status')
        qStore.createIndex('by-year', 'year')
        qStore.createIndex('by-createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains('testSessions')) {
        const tStore = db.createObjectStore('testSessions', { keyPath: 'id' })
        tStore.createIndex('by-status', 'status')
        tStore.createIndex('by-startedAt', 'startedAt')
      }

      if (!db.objectStoreNames.contains('ingestBatches')) {
        const iStore = db.createObjectStore('ingestBatches', { keyPath: 'id' })
        iStore.createIndex('by-status', 'status')
        iStore.createIndex('by-createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains('notes')) {
        const nStore = db.createObjectStore('notes', { keyPath: 'id' })
        nStore.createIndex('by-subject', 'subject')
        nStore.createIndex('by-updatedAt', 'updatedAt')
      }

      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'questionId' })
      }

      if (!db.objectStoreNames.contains('analyticsEvents')) {
        const aStore = db.createObjectStore('analyticsEvents', { keyPath: 'id' })
        aStore.createIndex('by-type', 'type')
        aStore.createIndex('by-timestamp', 'timestamp')
      }

      if (!db.objectStoreNames.contains('userProfile')) {
        db.createObjectStore('userProfile', { keyPath: 'id' })
      }

      // ── Version 2 stores (auth layer) ──
      if (!db.objectStoreNames.contains('users')) {
        const uStore = db.createObjectStore('users', { keyPath: 'id' })
        uStore.createIndex('by-email', 'email', { unique: true })
        uStore.createIndex('by-username', 'username', { unique: true })
        uStore.createIndex('by-createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains('sessions')) {
        const sStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sStore.createIndex('by-userId', 'userId')
        sStore.createIndex('by-expiresAt', 'expiresAt')
      }

      // ── Version 3 stores (daily challenges & achievements) ──
      if (!db.objectStoreNames.contains('dailyChallenges')) {
        const dcStore = db.createObjectStore('dailyChallenges', { keyPath: 'date' })
        dcStore.createIndex('by-date', 'date')
        dcStore.createIndex('by-userId', 'userId')
      }

      if (!db.objectStoreNames.contains('achievements')) {
        const aStore = db.createObjectStore('achievements', { keyPath: 'id' })
        aStore.createIndex('by-userId', 'userId')
        aStore.createIndex('by-triggeredAt', 'triggeredAt')
      }
    },
  })

  return dbInstance
}

export function getDB(): IDBPDatabase<AkalDB> | null {
  return dbInstance
}

/**
 * Async getter that auto-initializes the DB if not yet opened.
 * Use this in all auth/CRUD functions to eliminate race conditions
 * where the module-level `dbInstance` hasn't been set yet.
 */
export async function getDBAsync(): Promise<IDBPDatabase<AkalDB> | null> {
  if (!dbInstance) {
    try {
      await initDB()
    } catch (err) {
      console.error('[getDBAsync] Failed to initialize DB:', err)
      return null
    }
  }
  return dbInstance
}

/**
 * Expose a sync check for places that MUST have DB ready before rendering.
 */
export function isDBReady(): boolean {
  return dbInstance !== null
}

/**
 * For use in layout: initialize DB early, before any page renders.
 * Includes versionchange listener for multi-tab scenarios.
 */
export async function preloadDB(): Promise<void> {
  const db = await initDB()
  // Listen for version change (user opened app in another tab with new version)
  db.addEventListener('versionchange', () => {
    db.close()
    dbInstance = null
    window.location.reload()
  })
}
