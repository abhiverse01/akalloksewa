/**
 * Practice Store — Zustand store with immer for practice / quiz mode
 *
 * Lightweight question-by-question practice without a timer.
 * Tracks per-session accuracy (correct / wrong) and supports
 * explanation reveal after answering.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Question, LoksewaSubject, Difficulty } from '@/types/question'
import { getQuestions, type QuestionFilters } from '@/lib/db/questions'
import { logPracticeEvent } from '@/lib/db/analytics'

// ── Types ────────────────────────────────────────────────

export interface PracticeFilters {
  subject?: LoksewaSubject[]
  difficulty?: Difficulty[]
}

export interface PracticeState {
  /** Loaded questions for this practice session */
  questions: Question[]
  /** Index into questions of the currently viewed question */
  currentIndex: number
  /** ID of the selected option for the current question (null = not answered) */
  selectedOption: string | null
  /** Whether the correct answer has been revealed */
  answerRevealed: boolean
  /** Whether the explanation panel is expanded */
  showExplanation: boolean
  /** Whether questions are currently being loaded */
  isLoading: boolean
  /** Total number of questions available (from the query) */
  total: number
  /** Filters used for the current session */
  filters: PracticeFilters
  /** Running count of correct answers this session */
  sessionCorrect: number
  /** Running count of wrong answers this session */
  sessionWrong: number
  /** Timestamp when the session started */
  sessionStartTime: number
}

export interface PracticeActions {
  /** Load a batch of questions matching the given filters */
  loadQuestions: (filters: PracticeFilters) => Promise<void>
  /** Select an option for the current question (prevents re-answering) */
  selectOption: (optionId: string, userId?: string) => void
  /** Move to the next question */
  nextQuestion: () => void
  /** Move to the previous question */
  prevQuestion: () => void
  /** Toggle explanation panel visibility */
  toggleExplanation: () => void
  /** Reset session counters and state */
  resetSession: () => void
}

export type PracticeStore = PracticeState & PracticeActions

// ── Initial state ───────────────────────────────────────

const initialState: PracticeState = {
  questions: [],
  currentIndex: 0,
  selectedOption: null,
  answerRevealed: false,
  showExplanation: false,
  isLoading: false,
  total: 0,
  filters: {},
  sessionCorrect: 0,
  sessionWrong: 0,
  sessionStartTime: 0,
}

// ── Store ──────────────────────────────────────────────

export const usePracticeStore = create<PracticeStore>()(
  immer((set, get) => ({
    ...initialState,

    // ── Computed (via get()) ─────────────────────────────

    get currentQuestion(): Question | null {
      const { questions, currentIndex } = get()
      return questions[currentIndex] ?? null
    },

    get sessionAccuracy(): number {
      const { sessionCorrect, sessionWrong } = get()
      const total = sessionCorrect + sessionWrong
      if (total === 0) return 0
      return Math.round((sessionCorrect / total) * 100)
    },

    // ── Actions ───────────────────────────────────────────

    async loadQuestions(filters: PracticeFilters) {
      set((s) => {
        s.isLoading = true
        s.filters = filters
      })

      try {
        const dbFilters: QuestionFilters = {
          status: 'approved',
          subject: filters.subject?.length === 1 ? filters.subject[0] : filters.subject,
          difficulty: filters.difficulty?.[0],
          limit: 50,
        }

        const result = await getQuestions(dbFilters)

        set((s) => {
          s.questions = result.questions
          s.total = result.total
          s.currentIndex = 0
          s.selectedOption = null
          s.answerRevealed = false
          s.showExplanation = false
          s.sessionCorrect = 0
          s.sessionWrong = 0
          s.sessionStartTime = Date.now()
          s.isLoading = false
        })
      } catch (err) {
        console.error('[practiceStore.loadQuestions] Error:', err)
        set((s) => {
          s.isLoading = false
          s.questions = []
          s.total = 0
        })
      }
    },

    selectOption(optionId: string, userId?: string) {
      const { questions, currentIndex, selectedOption, answerRevealed, sessionStartTime } = get()
      const question = questions[currentIndex]

      if (!question) return
      // Prevent re-answering
      if (answerRevealed || selectedOption !== null) return

      const isCorrect = question.options.some((o) => o.id === optionId && o.isCorrect)
      const timeTakenMs = Date.now() - sessionStartTime

      set((s) => {
        s.selectedOption = optionId
        s.answerRevealed = true
        if (isCorrect) {
          s.sessionCorrect++
        } else {
          s.sessionWrong++
        }
      })

      // Log to analytics (fire-and-forget)
      logPracticeEvent(
        userId ?? 'anonymous',
        question.id,
        question.subject,
        isCorrect,
        timeTakenMs / 1000,
      ).catch((err) => {
        console.error('[practiceStore.selectOption] Analytics logging failed:', err)
      })
    },

    nextQuestion() {
      const { questions, currentIndex } = get()
      if (currentIndex < questions.length - 1) {
        set((s) => {
          s.currentIndex++
          s.selectedOption = null
          s.answerRevealed = false
          s.showExplanation = false
        })
      }
    },

    prevQuestion() {
      set((s) => {
        if (s.currentIndex > 0) {
          s.currentIndex--
          // Restore the answer state for the previous question
          // (selectedOption & answerRevealed are reset intentionally
          //  since the question card is re-rendered fresh)
          s.selectedOption = null
          s.answerRevealed = false
          s.showExplanation = false
        }
      })
    },

    toggleExplanation() {
      set((s) => {
        s.showExplanation = !s.showExplanation
      })
    },

    resetSession() {
      set((s) => {
        s.questions = []
        s.currentIndex = 0
        s.selectedOption = null
        s.answerRevealed = false
        s.showExplanation = false
        s.isLoading = false
        s.total = 0
        s.filters = {}
        s.sessionCorrect = 0
        s.sessionWrong = 0
        s.sessionStartTime = 0
      })
    },
  })),
)
