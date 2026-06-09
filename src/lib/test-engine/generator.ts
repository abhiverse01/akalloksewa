/**
 * Test Generator — Creates test sessions from available questions
 */

import type { TestConfig, TestSession } from '@/types/test'
import type { Question, LoksewaSubject } from '@/types/question'

/**
 * Generate a test from available questions based on config
 */
export function generateTest(
  config: TestConfig,
  pool: Question[]
): TestSession | null {
  const eligible = filterEligible(pool, config)

  if (eligible.length < config.questionCount) {
    return null
  }

  let selected = selectQuestions(eligible, config)

  if (config.shuffleQuestions) {
    selected = shuffleArray(selected)
  }

  if (config.shuffleOptions) {
    selected = selected.map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }))
  }

  selected = selected.slice(0, config.questionCount)

  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    config,
    questions: selected,
    answers: {},
    markedForReview: [],
    skipped: [],
    startedAt: Date.now(),
    status: 'active',
  }
}

function filterEligible(questions: Question[], config: TestConfig): Question[] {
  return questions.filter((q) => {
    if (q.status !== 'approved') return false
    if (q.type !== 'mcq') return false
    if (!q.options.some((o) => o.isCorrect)) return false
    if (config.subjects.length > 0 && !config.subjects.includes(q.subject)) return false
    if (config.difficulty && config.difficulty.length > 0) {
      if (!config.difficulty.includes(q.difficulty)) return false
    }
    return true
  })
}

function selectQuestions(eligible: Question[], config: TestConfig): Question[] {
  if (config.subjects.length <= 1) return eligible

  const perSubject = Math.ceil(config.questionCount / config.subjects.length)
  const selected: Question[] = []
  const used = new Set<string>()

  for (const subject of config.subjects) {
    const subjectQs = eligible.filter((q) => q.subject === subject && !used.has(q.id))
    const toAdd = subjectQs.slice(0, perSubject)
    for (const q of toAdd) {
      selected.push(q)
      used.add(q.id)
    }
  }

  if (selected.length < config.questionCount) {
    const remaining = eligible.filter((q) => !used.has(q.id))
    selected.push(...remaining.slice(0, config.questionCount - selected.length))
  }

  return selected
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getSubjectBreakdown(
  pool: Question[],
  config: TestConfig
): { subject: LoksewaSubject; available: number; selected: number }[] {
  const eligible = filterEligible(pool, config)
  return config.subjects.map((subject) => {
    const available = eligible.filter((q) => q.subject === subject).length
    const selected = Math.min(available, Math.ceil(config.questionCount / config.subjects.length))
    return { subject, available, selected }
  })
}
