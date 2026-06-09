import type { LoksewaSubject } from './question'

export interface AnalyticsEvent {
  id: string
  type: 'practice' | 'test' | 'bookmark' | 'note' | 'streak'
  subject?: LoksewaSubject
  score?: number
  timeTaken?: number
  questionCount?: number
  timestamp: number
}

export interface DailyStats {
  date: string
  questionsPracticed: number
  testsTaken: number
  averageScore: number
  timeSpent: number
}

export interface SubjectPerformance {
  subject: LoksewaSubject
  totalQuestions: number
  correct: number
  accuracy: number
  trend: 'up' | 'down' | 'stable'
}

export interface StreakData {
  date: string
  count: number
}
