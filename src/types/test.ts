import type { LoksewaSubject, Difficulty, Question } from './question'

export interface TestConfig {
  name: string
  subjects: LoksewaSubject[]
  difficulty?: Difficulty[]
  questionCount: number
  timeLimitMinutes: number
  negativeMarking: boolean
  negativeMarkValue: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showExplanations: 'after-each' | 'at-end' | 'never'
}

export interface TestSession {
  id: string
  config: TestConfig
  questions: Question[]
  answers: Record<string, string>
  markedForReview: string[]
  skipped: string[]
  startedAt: number
  endedAt?: number
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  score?: TestScore
}

export interface TestScore {
  total: number
  correct: number
  wrong: number
  skipped: number
  marks: number
  maxMarks: number
  percentage: number
  timeTaken: number
  subjectBreakdown: SubjectScore[]
  rank?: number
}

export interface SubjectScore {
  subject: LoksewaSubject
  correct: number
  wrong: number
  total: number
  marks: number
}
