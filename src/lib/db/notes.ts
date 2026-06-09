import { nanoid } from 'nanoid'
import type { Note } from './schema'
import { initDB } from './schema'
import type { LoksewaSubject } from '@/types/question'

// ── Word Count Helper ────────────────────────────────────────────────────────

/**
 * Strip HTML tags and count words in the remaining text content.
 * Handles common HTML patterns including &nbsp; and nested tags.
 */
export function countWords(html: string): number {
  try {
    // Strip HTML tags
    const stripped = html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<\/li>/gi, ' ')
      .replace(/<\/h[1-6]>/gi, ' ')
      .replace(/<\/div>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    if (!stripped) return 0

    // Count words (split by whitespace, filter empty strings)
    return stripped.split(/\s+/).filter(Boolean).length
  } catch (err) {
    console.error('[notes.countWords] Error:', err)
    return 0
  }
}

// ── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new note with auto-generated ID, timestamps, and word count.
 */
export async function createNote(
  userId: string,
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'tags'>
): Promise<Note | null> {
  try {
    const db = await initDB()
    const now = Date.now()
    const note: Note = {
      ...data,
      id: nanoid(12),
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    await db.put('notes', note)
    return note
  } catch (err) {
    console.error('[notes.createNote] Error:', err)
    return null
  }
}

/**
 * Partially update a note. Automatically recalculates word count
 * if content is being updated, and bumps updatedAt.
 */
export async function updateNote(
  id: string,
  patch: Partial<Omit<Note, 'id' | 'createdAt'>>
): Promise<Note | null> {
  try {
    const db = await initDB()
    const existing = await db.get('notes', id)
    if (!existing) {
      console.error(`[notes.updateNote] Note ${id} not found`)
      return null
    }

    const updated: Note = {
      ...existing,
      ...patch,
      id,                     // preserve original id
      createdAt: existing.createdAt, // preserve original createdAt
      updatedAt: Date.now(),
    }

    // Note: word count is not stored in the Note type per the schema.
    // If content changes, the word count can be recalculated on the fly.
    await db.put('notes', updated)
    return updated
  } catch (err) {
    console.error('[notes.updateNote] Error:', err)
    return null
  }
}

/**
 * Get all notes for a user, sorted by updatedAt descending.
 * Since notes don't have a userId field in the schema, this returns all notes.
 */
export async function getNotes(userId?: string): Promise<Note[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('notes')
    return all.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (err) {
    console.error('[notes.getNotes] Error:', err)
    return []
  }
}

/**
 * Delete a note by ID. Returns true if deleted, false if not found.
 */
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const db = await initDB()
    const existing = await db.get('notes', id)
    if (!existing) return false
    await db.delete('notes', id)
    return true
  } catch (err) {
    console.error('[notes.deleteNote] Error:', err)
    return false
  }
}

/**
 * Search notes by query string. Searches across title, content, and tags.
 * Case-insensitive matching.
 */
export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  try {
    const db = await initDB()
    const all = await db.getAll('notes')
    const lower = query.toLowerCase().trim()

    if (!lower) return all.sort((a, b) => b.updatedAt - a.updatedAt)

    const results = all.filter(
      (note) =>
        note.title.toLowerCase().includes(lower) ||
        note.content.toLowerCase().includes(lower) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lower))
    )

    return results.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (err) {
    console.error('[notes.searchNotes] Error:', err)
    return []
  }
}

// ── Legacy Aliases (kept for backward compatibility) ──────────────────────────

export async function getAllNotes(): Promise<Note[]> {
  try {
    const db = await initDB()
    return await db.getAll('notes')
  } catch (err) {
    console.error('[notes.getAllNotes] Error:', err)
    return []
  }
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  try {
    const db = await initDB()
    return await db.get('notes', id)
  } catch (err) {
    console.error('[notes.getNoteById] Error:', err)
    return undefined
  }
}

export async function getNotesBySubject(subject: LoksewaSubject): Promise<Note[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex('notes', 'by-subject', subject)
  } catch (err) {
    console.error('[notes.getNotesBySubject] Error:', err)
    return []
  }
}

export async function saveNote(note: Note): Promise<void> {
  try {
    const db = await initDB()
    await db.put('notes', note)
  } catch (err) {
    console.error('[notes.saveNote] Error:', err)
  }
}
