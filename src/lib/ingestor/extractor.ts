/**
 * Extractor — MCQ Extraction Engine
 * Converts RawQuestion into ParsedQuestion with confidence scoring
 */

import type { RawQuestion, ParsedQuestion, IngestIssue } from '@/types/ingestor'
import type { Question, Option } from '@/types/question'

// ─── Helpers ────────────────────────────────────────────────────────

function generateTempId(index: number): string {
  return `parsed-${Date.now()}-${index.toString().padStart(4, '0')}`
}

// ─── Confidence Scoring ─────────────────────────────────────────────

function calculateConfidence(
  questionText: string,
  options: Option[],
  correctAnswer?: string,
  explanation?: string
): number {
  let score = 0
  const maxScore = 1.0

  // Question stem present and substantial (0-0.3)
  if (questionText.length >= 10) {
    score += 0.3
  } else if (questionText.length >= 5) {
    score += 0.15
  }

  // Valid number of options (0-0.25)
  if (options.length >= 4) {
    score += 0.25
  } else if (options.length === 3) {
    score += 0.15
  } else if (options.length === 2) {
    score += 0.08
  }

  // Correct answer identified (0-0.3)
  if (correctAnswer) {
    // Check if correct answer maps to a valid option
    const hasCorrectOption = options.some(
      (o) => o.id.toUpperCase() === correctAnswer!.toUpperCase()
    )
    if (hasCorrectOption) {
      score += 0.3
    } else {
      score += 0.15
    }
  }

  // Explanation present (0-0.1)
  if (explanation && explanation.length > 5) {
    score += 0.1
  }

  // All options have text (0-0.05)
  const allOptionsHaveText = options.every((o) => o.text.trim().length > 0)
  if (allOptionsHaveText) {
    score += 0.05
  }

  return Math.min(score, maxScore)
}

// ─── Issue Detection ────────────────────────────────────────────────

function detectIssues(
  raw: RawQuestion,
  confidence: number
): IngestIssue[] {
  const issues: IngestIssue[] = []

  // Missing answer
  if (!raw.correctAnswer) {
    issues.push({
      type: 'missing-answer',
      message: 'No correct answer detected. Please identify the correct option.',
      severity: 'error',
    })
  }

  // Low confidence
  if (confidence < 0.5) {
    issues.push({
      type: 'low-confidence',
      message: `Low extraction confidence (${(confidence * 100).toFixed(0)}%). Manual review recommended.`,
      severity: 'warning',
    })
  }

  // Ambiguous options
  if (raw.options.length < 2) {
    issues.push({
      type: 'ambiguous-options',
      message: 'Fewer than 2 options detected. Expected 4 options (A-D).',
      severity: 'error',
    })
  } else if (raw.options.length < 3) {
    issues.push({
      type: 'ambiguous-options',
      message: 'Only 2 options detected. Expected 4 options (A-D).',
      severity: 'warning',
    })
  } else if (raw.options.length > 5) {
    issues.push({
      type: 'ambiguous-options',
      message: `Too many options detected (${raw.options.length}). Expected 3-5.`,
      severity: 'warning',
    })
  }

  // Check for empty options
  const emptyOptions = raw.options.filter((o) => !o.text.trim())
  if (emptyOptions.length > 0) {
    issues.push({
      type: 'ambiguous-options',
      message: `${emptyOptions.length} option(s) have empty text.`,
      severity: 'error',
    })
  }

  // Check for suspiciously long or short question text
  if (raw.questionText.length < 5) {
    issues.push({
      type: 'low-confidence',
      message: 'Question text is very short — may not be a complete question.',
      severity: 'warning',
    })
  }

  return issues
}

// ─── Main Extraction ────────────────────────────────────────────────

export function extractQuestions(rawQuestions: RawQuestion[]): ParsedQuestion[] {
  return rawQuestions.map((raw, index) => extractSingleQuestion(raw, index))
}

export function extractSingleQuestion(
  raw: RawQuestion,
  index: number = 0
): ParsedQuestion {
  const tempId = generateTempId(index)
  const confidence = calculateConfidence(
    raw.questionText,
    raw.options,
    raw.correctAnswer,
    raw.explanation
  )

  const issues = detectIssues(raw, confidence)
  const needsReview = confidence < 0.75 || issues.some((i) => i.severity === 'error')

  // Mark correct option
  const options: Option[] = raw.options.map((opt) => ({
    ...opt,
    isCorrect: raw.correctAnswer
      ? opt.id.toUpperCase() === raw.correctAnswer.toUpperCase()
      : false,
  }))

  const partialQuestion: Partial<Question> = {
    text: raw.questionText,
    options,
    explanation: raw.explanation,
    type: 'mcq',
    source: 'ingestor',
    tags: [],
    status: 'pending',
    reportCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return {
    tempId,
    rawText: raw.rawText,
    parsedQuestion: partialQuestion,
    confidence,
    issues,
    needsReview,
    autoClassified: false,
  }
}

// ─── Validate a single parsed question for commit readiness ───────

export function isCommitReady(parsed: ParsedQuestion): boolean {
  const q = parsed.parsedQuestion
  if (!q) return false
  if (!q.text || q.text.trim().length < 5) return false
  if (!q.options || q.options.length < 2) return false
  if (!q.options.some((o) => o.isCorrect)) return false
  if (!q.subject) return false
  return true
}
