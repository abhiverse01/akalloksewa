export type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard'
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank' | 'match'
export type QuestionStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

export type LoksewaSubject =
  | 'nepali'
  | 'english'
  | 'general-knowledge'
  | 'current-affairs'
  | 'constitution'
  | 'governance'
  | 'mathematics'
  | 'science-technology'
  | 'geography'
  | 'history'
  | 'economics'
  | 'law'
  | 'public-administration'
  | 'ethics'
  | 'computer-it'
  | 'environment'
  | 'social-development'

export interface Option {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  text: string
  options: Option[]
  explanation?: string
  type: QuestionType
  difficulty: Difficulty
  subject: LoksewaSubject
  chapter?: string
  topic?: string
  year?: number
  source?: string
  tags: string[]
  status: QuestionStatus
  reportCount: number
  createdAt: number
  updatedAt: number
  ingestBatchId?: string
}
