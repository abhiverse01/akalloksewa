import { format } from 'date-fns'
import { initDB } from '@/lib/db/schema'
import { getBookmarkedQuestions } from '@/lib/db/bookmarks'
import type { UserRecord } from '@/types/auth'
import type { TestSession } from '@/types/test'
import type { Note } from '@/lib/db/schema'
import type { AnalyticsEvent } from '@/types/analytics'

// ── Sanitization ──────────────────────────────────────────────────────────────

/**
 * Sanitize a user record by removing sensitive fields like passwordHash and salt.
 */
function sanitizeUser(user: UserRecord): Omit<UserRecord, 'passwordHash' | 'salt'> {
  const { passwordHash, salt, ...safe } = user
  return safe
}

// ── Export ────────────────────────────────────────────────────────────────────

/**
 * Export all user data as a JSON file and trigger a browser download.
 *
 * Gathers:
 *  - User profile (sanitized — no password)
 *  - Test sessions (completed)
 *  - Bookmarked questions
 *  - Notes
 *  - Analytics events
 *
 * Returns the export object for testing, or null on failure.
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const db = await initDB()

    // 1. User record (sanitized)
    const user = await db.get('users', userId)
    const safeUser = user ? sanitizeUser(user) : null

    // 2. Test sessions
    const allTests = await db.getAll('testSessions') as TestSession[]
    const userTests = allTests.filter((t) => t.status === 'completed')

    // 3. Bookmarked questions (joined)
    const bookmarkedQuestions = await getBookmarkedQuestions(userId)

    // 4. Notes
    const allNotes = await db.getAll('notes') as Note[]

    // 5. Analytics events
    const allEvents = await db.getAll('analyticsEvents') as AnalyticsEvent[]

    // Build export payload
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: 1,
      userId,
      user: safeUser,
      testSessions: userTests,
      bookmarks: bookmarkedQuestions.map((q) => ({
        questionId: q.id,
        subject: q.subject,
        difficulty: q.difficulty,
        text: q.text,
        bookmarkedAt: q.bookmarkedAt,
        bookmarkNote: q.bookmarkNote,
      })),
      notes: allNotes,
      analyticsEvents: allEvents,
    }

    // Trigger file download
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `akalloksewa-export-${format(new Date(), 'yyyy-MM-dd')}.json`

    // Create a temporary download link and click it
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return exportData
  } catch (err) {
    console.error('[export.exportUserData] Error:', err)
    return null
  }
}
