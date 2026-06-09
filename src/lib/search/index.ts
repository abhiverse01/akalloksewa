/**
 * Global Search — Unified search across questions, notes, subjects, and actions.
 *
 * All searches are performed against IndexedDB data.
 * Results are ranked by a simple TF-like relevance score and capped at 12 items.
 */

import type { LoksewaSubject } from '@/types/question'
import { getAllQuestions } from '@/lib/db/questions'
import { getAllNotes } from '@/lib/db/notes'
import type { Note } from '@/lib/db/schema'

// ── Types ────────────────────────────────────────────────

export type SearchResultType = 'question' | 'note' | 'subject' | 'action'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string
  subject?: LoksewaSubject
  href: string
  score: number
}

// ── Quick actions baked into search ─────────────────────

const QUICK_ACTIONS: { title: string; href: string; keywords: string[] }[] = [
  { title: 'Start Practice', href: '/practice', keywords: ['practice', 'question', 'quiz', 'learn'] },
  { title: 'Take a Test', href: '/test', keywords: ['test', 'mock', 'exam', 'simulate'] },
  { title: 'View Analytics', href: '/analytics', keywords: ['analytics', 'stats', 'performance', 'progress'] },
  { title: 'My Notes', href: '/notes', keywords: ['notes', 'notebook', 'write'] },
  { title: 'Dashboard', href: '/dashboard', keywords: ['dashboard', 'home', 'main'] },
  { title: 'Bookmarks', href: '/bookmarks', keywords: ['bookmark', 'saved', 'favourite'] },
  { title: 'Study Plan', href: '/study-plan', keywords: ['plan', 'schedule', 'study', 'planner'] },
  { title: 'Leaderboard', href: '/leaderboard', keywords: ['leaderboard', 'rank', 'top'] },
  { title: 'Settings', href: '/settings', keywords: ['settings', 'pref', 'config', 'profile'] },
]

// ── Subject catalog for matching ─────────────────────────

const SUBJECTS: { name: string; slug: LoksewaSubject; labels: string[] }[] = [
  { name: 'Nepali', slug: 'nepali', labels: ['nepali', 'ne'] },
  { name: 'English', slug: 'english', labels: ['english', 'en', 'angreji'] },
  { name: 'General Knowledge', slug: 'general-knowledge', labels: ['general', 'gk', 'samanya'] },
  { name: 'Current Affairs', slug: 'current-affairs', labels: ['current', 'affairs', 'recent', 'latest'] },
  { name: 'Constitution', slug: 'constitution', labels: ['constitution', 'sanvidhan', 'sambidhan'] },
  { name: 'Governance', slug: 'governance', labels: ['governance', 'shasan', 'administration'] },
  { name: 'Mathematics', slug: 'mathematics', labels: ['math', 'maths', 'ganit', 'arithmetic'] },
  { name: 'Science & Technology', slug: 'science-technology', labels: ['science', 'technology', 'vigyan', 'bigyan'] },
  { name: 'Geography', slug: 'geography', labels: ['geography', 'bhugol', 'map'] },
  { name: 'History', slug: 'history', labels: ['history', 'itihash', 'itihas'] },
  { name: 'Economics', slug: 'economics', labels: ['economics', 'arthashastra', 'economy', 'finance'] },
  { name: 'Law', slug: 'law', labels: ['law', 'kanun', 'legal'] },
  { name: 'Public Administration', slug: 'public-administration', labels: ['public', 'administration', 'prashasan'] },
  { name: 'Ethics', slug: 'ethics', labels: ['ethics', 'naitik', 'moral'] },
  { name: 'Computer & IT', slug: 'computer-it', labels: ['computer', 'it', 'ICT', 'technology'] },
  { name: 'Environment', slug: 'environment', labels: ['environment', 'paribesh', 'ecology'] },
  { name: 'Social Development', slug: 'social-development', labels: ['social', 'development', 'samajik'] },
]

// ── Scoring helper ──────────────────────────────────────

function scoreText(text: string, query: string): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()

  let score = 0
  if (lower === q) score += 100
  else if (lower.startsWith(q)) score += 60
  else if (lower.includes(q)) score += 30

  // Bonus for word-boundary match
  const regex = new RegExp(`\\b${escapeRegex(q)}`, 'i')
  if (regex.test(text)) score += 15

  return score
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Main search function ─────────────────────────────────

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return []

  const trimmed = query.trim()
  const results: SearchResult[] = []

  // 1. Search questions (text + options + tags)
  try {
    const questions = await getAllQuestions()
    const approved = questions.filter((q) => q.status === 'approved')

    for (const q of approved) {
      let bestScore = scoreText(q.text, trimmed)

      for (const opt of q.options) {
        const optScore = scoreText(opt.text, trimmed)
        if (optScore > bestScore) bestScore = optScore
      }

      for (const tag of q.tags) {
        const tagScore = scoreText(tag, trimmed) * 0.5
        if (tagScore > bestScore) bestScore = tagScore
      }

      if (q.topic) {
        const topicScore = scoreText(q.topic, trimmed) * 0.7
        if (topicScore > bestScore) bestScore = topicScore
      }

      if (bestScore > 0) {
        results.push({
          type: 'question',
          id: q.id,
          title: q.text.length > 80 ? q.text.slice(0, 80) + '…' : q.text,
          subtitle: `${q.subject} · ${q.difficulty}`,
          subject: q.subject,
          href: `/practice?q=${encodeURIComponent(q.id)}`,
          score: bestScore,
        })
      }
    }
  } catch (err) {
    console.error('[globalSearch] Failed to search questions:', err)
  }

  // 2. Search notes (title + content)
  try {
    const notes: Note[] = await getAllNotes()

    for (const note of notes) {
      let bestScore = scoreText(note.title, trimmed) * 1.2 // title weight
      const contentScore = scoreText(note.content, trimmed) * 0.6
      if (contentScore > bestScore) bestScore = contentScore

      for (const tag of note.tags) {
        const tagScore = scoreText(tag, trimmed) * 0.4
        if (tagScore > bestScore) bestScore = tagScore
      }

      if (bestScore > 0) {
        results.push({
          type: 'note',
          id: note.id,
          title: note.title,
          subtitle: note.content.length > 60 ? note.content.slice(0, 60) + '…' : note.content,
          subject: note.subject,
          href: `/notes?id=${encodeURIComponent(note.id)}`,
          score: bestScore,
        })
      }
    }
  } catch (err) {
    console.error('[globalSearch] Failed to search notes:', err)
  }

  // 3. Search subjects (string match)
  for (const subj of SUBJECTS) {
    let bestScore = 0
    for (const label of subj.labels) {
      const s = scoreText(label, trimmed)
      if (s > bestScore) bestScore = s
    }
    const nameScore = scoreText(subj.name, trimmed)
    if (nameScore > bestScore) bestScore = nameScore

    if (bestScore > 0) {
      results.push({
        type: 'subject',
        id: subj.slug,
        title: subj.name,
        subtitle: 'Subject',
        subject: subj.slug,
        href: `/practice?subject=${encodeURIComponent(subj.slug)}`,
        score: bestScore,
      })
    }
  }

  // 4. Search quick actions
  for (const action of QUICK_ACTIONS) {
    let bestScore = 0
    for (const kw of action.keywords) {
      const s = scoreText(kw, trimmed)
      if (s > bestScore) bestScore = s
    }
    const titleScore = scoreText(action.title, trimmed)
    if (titleScore > bestScore) bestScore = titleScore

    if (bestScore > 0) {
      results.push({
        type: 'action',
        id: `action-${action.href}`,
        title: action.title,
        href: action.href,
        score: bestScore * 0.8, // slightly lower weight vs real data
      })
    }
  }

  // Sort by relevance descending, cap at 12
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 12)
}
