import type { Option, Question, QuestionStatus, Difficulty, LoksewaSubject } from './question'

export type InputFormat =
  | 'numbered-mcq'
  | 'bracket-mcq'
  | 'pipe-delimited'
  | 'plain-paragraph'
  | 'nepali-script'
  | 'mixed'

export interface RawQuestion {
  rawText: string
  questionText: string
  options: Option[]
  correctAnswer?: string
  explanation?: string
  format: InputFormat
}

export interface ParsedQuestion {
  tempId: string
  rawText: string
  parsedQuestion?: Partial<Question>
  confidence: number
  issues: IngestIssue[]
  needsReview: boolean
  autoClassified: boolean
}

export interface IngestIssue {
  type: 'missing-answer' | 'ambiguous-options' | 'duplicate' | 'low-confidence' | 'encoding'
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface IngestBatch {
  id: string
  name: string
  sourceType: 'text-paste' | 'file-upload' | 'url' | 'manual'
  rawContent: string
  status: 'parsing' | 'classifying' | 'review' | 'committed' | 'failed'
  parsedQuestions: ParsedQuestion[]
  metadata: BatchMetadata
  createdAt: number
}

export interface BatchMetadata {
  totalRaw: number
  parsed: number
  readyToCommit: number
  duplicatesFound: number
  subject?: LoksewaSubject
  year?: number
}

export interface DuplicateReport {
  question1: ParsedQuestion
  question2: ParsedQuestion | Question
  similarity: number
}
