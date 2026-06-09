/**
 * Test Scorer — Calculates score with negative marking
 */

import type { TestSession, TestScore, SubjectScore } from '@/types/test'
import type { LoksewaSubject } from '@/types/question'

/**
 * Score a completed test session
 * Supports negative marking for wrong answers
 */
export function scoreTest(session: TestSession): TestScore {
  const { questions, answers, config } = session

  let correct = 0
  let wrong = 0
  let skipped = 0
  let marks = 0
  const marksPerQuestion = 1

  const subjectMap: Record<string, { correct: number; wrong: number; total: number; marks: number }> = {}

  for (const question of questions) {
    const answeredOptionId = answers[question.id]

    if (!answeredOptionId) {
      skipped++
      trackSubject(subjectMap, question.subject, 'skipped', 0)
      continue
    }

    const selectedOption = question.options.find((o) => o.id === answeredOptionId)
    const correctOption = question.options.find((o) => o.isCorrect)

    if (selectedOption?.isCorrect) {
      correct++
      marks += marksPerQuestion
      trackSubject(subjectMap, question.subject, 'correct', marksPerQuestion)
    } else {
      wrong++
      const penalty = config.negativeMarking ? config.negativeMarkValue : 0
      marks -= penalty
      trackSubject(subjectMap, question.subject, 'wrong', -penalty)
    }
  }

  const total = questions.length
  const maxMarks = total * marksPerQuestion
  const percentage = maxMarks > 0 ? Math.max(0, (marks / maxMarks) * 100) : 0
  const timeTaken = session.endedAt ? session.endedAt - session.startedAt : 0

  const subjectBreakdown: SubjectScore[] = Object.entries(subjectMap).map(
    ([subject, data]) => ({
      subject: subject as LoksewaSubject,
      correct: data.correct,
      wrong: data.wrong,
      total: data.total,
      marks: Math.round(data.marks * 100) / 100,
    })
  )

  return {
    total,
    correct,
    wrong,
    skipped,
    marks: Math.round(marks * 100) / 100,
    maxMarks,
    percentage: Math.round(percentage * 10) / 10,
    timeTaken,
    subjectBreakdown,
  }
}

function trackSubject(
  map: Record<string, { correct: number; wrong: number; total: number; marks: number }>,
  subject: string,
  result: 'correct' | 'wrong' | 'skipped',
  score: number
) {
  if (!map[subject]) {
    map[subject] = { correct: 0, wrong: 0, total: 0, marks: 0 }
  }
  map[subject].total++
  map[subject].marks += score
  if (result === 'correct') map[subject].correct++
  if (result === 'wrong') map[subject].wrong++
}

/**
 * Get a letter grade based on percentage
 */
export function getGrade(percentage: number): {
  grade: string
  label: string
  color: string
} {
  if (percentage >= 90) return { grade: 'A+', label: 'Outstanding', color: 'text-green-600' }
  if (percentage >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600' }
  if (percentage >= 70) return { grade: 'B+', label: 'Very Good', color: 'text-emerald-600' }
  if (percentage >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-600' }
  if (percentage >= 50) return { grade: 'C+', label: 'Above Average', color: 'text-amber-600' }
  if (percentage >= 40) return { grade: 'C', label: 'Average', color: 'text-orange-600' }
  if (percentage >= 30) return { grade: 'D', label: 'Below Average', color: 'text-red-500' }
  return { grade: 'F', label: 'Fail', color: 'text-red-600' }
}

/**
 * Check if a score passes Loksewa cutoff (generally 40%)
 */
export function isPassing(score: TestScore): boolean {
  return score.percentage >= 40
}

/**
 * Get performance summary text
 */
export function getPerformanceSummary(score: TestScore): string {
  const { percentage, correct, wrong, skipped, total } = score

  if (percentage >= 80) {
    return `Excellent performance! ${correct}/${total} correct (${percentage}%). Keep it up!`
  }
  if (percentage >= 60) {
    return `Good job! ${correct}/${total} correct (${percentage}%). ${wrong} wrong, ${skipped} skipped.`
  }
  if (percentage >= 40) {
    return `Passed! ${correct}/${total} correct (${percentage}%). ${wrong} wrong. Review the missed questions.`
  }
  return `${correct}/${total} correct (${percentage}%). ${wrong} wrong, ${skipped} skipped. More practice needed.`
}
