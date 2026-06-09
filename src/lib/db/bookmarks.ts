import type { Question } from '@/types/question'
import { initDB } from './schema'

// ── Internal Types ────────────────────────────────────────────────────────────

interface BookmarkRecord {
  questionId: string
  savedAt: number
  note?: string
}

// ── Key Helpers ──────────────────────────────────────────────────────────────

/** Build a composite key: `userId:questionId` */
function bookmarkKey(userId: string, questionId: string): string {
  return `${userId}:${questionId}`
}

/** Parse a composite key back into userId and questionId */
function parseBookmarkKey(key: string): { userId: string; questionId: string } | null {
  const idx = key.indexOf(':')
  if (idx === -1 || idx === key.length - 1) return null
  return {
    userId: key.slice(0, idx),
    questionId: key.slice(idx + 1),
  }
}

// ── Core Operations ──────────────────────────────────────────────────────────

/**
 * Toggle a bookmark for a question.
 * If the question is already bookmarked by the user, it removes the bookmark.
 * If not, it adds a new bookmark.
 *
 * @param userId    The user's ID
 * @param questionId The question to bookmark/unbookmark
 * @param note      Optional note attached to the bookmark
 * @returns `true` if bookmarked (added), `false` if un-bookmarked (removed)
 */
export async function toggleBookmark(
  userId: string,
  questionId: string,
  note?: string
): Promise<boolean> {
  try {
    const db = await initDB()
    const key = bookmarkKey(userId, questionId)
    const existing = await db.get('bookmarks', key)

    if (existing) {
      // Already bookmarked — remove it
      await db.delete('bookmarks', key)
      return false
    }

    // Not bookmarked — add it
    const record: BookmarkRecord = {
      questionId,
      savedAt: Date.now(),
      note,
    }
    await db.put('bookmarks', record, key)
    return true
  } catch (err) {
    console.error('[bookmarks.toggleBookmark] Error:', err)
    return false
  }
}

/**
 * Check whether a question is bookmarked by a specific user.
 */
export async function isBookmarked(
  userId: string,
  questionId: string
): Promise<boolean> {
  try {
    const db = await initDB()
    const key = bookmarkKey(userId, questionId)
    const record = await db.get('bookmarks', key)
    return !!record
  } catch (err) {
    console.error('[bookmarks.isBookmarked] Error:', err)
    return false
  }
}

/**
 * Get all bookmarked questions for a user.
 * Joins bookmark records with the questions store to return full question data.
 * Uses a cursor to iterate bookmarks and filter by userId key prefix.
 */
export async function getBookmarkedQuestions(
  userId: string
): Promise<(Question & { bookmarkedAt: number; bookmarkNote?: string })[]> {
  try {
    const db = await initDB()
    const results: (Question & { bookmarkedAt: number; bookmarkNote?: string })[] = []

    // Use a cursor to iterate all bookmarks and match by key prefix
    const tx = db.transaction('bookmarks', 'readonly')
    let cursor = await tx.store.openCursor()

    while (cursor) {
      const key = cursor.key as string
      const parsed = parseBookmarkKey(key)

      if (parsed && parsed.userId === userId) {
        const bookmark = cursor.value
        const question = await db.get('questions', bookmark.questionId)

        if (question) {
          results.push({
            ...question,
            bookmarkedAt: bookmark.savedAt,
            bookmarkNote: bookmark.note,
          })
        }
      }

      cursor = await cursor.continue()
    }

    await tx.done

    // Sort by most recently bookmarked first
    return results.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt)
  } catch (err) {
    console.error('[bookmarks.getBookmarkedQuestions] Error:', err)
    return []
  }
}

/**
 * Get the total number of bookmarks for a user.
 */
export async function getBookmarkCount(userId: string): Promise<number> {
  try {
    const db = await initDB()
    let count = 0

    const tx = db.transaction('bookmarks', 'readonly')
    let cursor = await tx.store.openCursor()

    while (cursor) {
      const key = cursor.key as string
      const parsed = parseBookmarkKey(key)
      if (parsed && parsed.userId === userId) {
        count++
      }
      cursor = await cursor.continue()
    }

    await tx.done
    return count
  } catch (err) {
    console.error('[bookmarks.getBookmarkCount] Error:', err)
    return 0
  }
}
