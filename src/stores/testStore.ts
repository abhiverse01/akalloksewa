/**
 * Test Store — Production Zustand store with immer middleware
 *
 * Manages the full lifecycle of a timed exam session:
 *  configure → start → answer → pause → resume → submit / abandon
 *
 * All async actions are wrapped in try/catch with dedicated error state.
 * Computed getters use the `get()` pattern (no selectors — they derive on demand).
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { TestSession, TestConfig } from '@/types/test'
import type { Question } from '@/types/question'
import {
  createTestSession,
  submitTest as submitTestDB,
  abandonTest as abandonTestDB,
  saveTestProgress,
  recoverActiveSession,
} from '@/lib/db/tests'

// ── Types ────────────────────────────────────────────────

export type TestStatus =
  | 'idle'
  | 'configuring'
  | 'starting'
  | 'active'
  | 'paused'
  | 'submitting'
  | 'completed'
  | 'error'

export interface TestState {
  /** The current test session (null when idle or between tests) */
  session: TestSession | null
  /** High-level status of the store machine */
  status: TestStatus
  /** Last error message (set when status === 'error') */
  error: string | null
  /** Index into session.questions of the currently viewed question */
  currentIndex: number
  /** Map of questionId → selected optionId */
  answers: Record<string, string>
  /** Set (as array for immer) of questionIds flagged for review */
  markedForReview: string[]
  /** Set (as array) of explicitly skipped questionIds */
  skipped: string[]
  /** Seconds remaining on the clock */
  timeRemaining: number
  /** Whether the rAF timer loop should be ticking */
  timerRunning: boolean
}

export interface TestActions {
  // ── Lifecycle ─────────────────────────────────────────
  startTest: (config: TestConfig, userId?: string) => Promise<void>
  recoverTest: (userId?: string) => Promise<void>
  submitTest: () => Promise<void>
  abandonTest: () => Promise<void>
  resetTest: () => void

  // ── Answering ─────────────────────────────────────────
  answerQuestion: (questionId: string, optionId: string) => void
  clearAnswer: (questionId: string) => void
  toggleMarkForReview: (questionId: string) => void
  skipQuestion: (questionId: string) => void

  // ── Navigation ─────────────────────────────────────────
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void

  // ── Timer ──────────────────────────────────────────────
  pauseTest: () => void
  resumeTest: () => void
  tickTimer: () => void

  // ── Internal ──────────────────────────────────────────
  _setError: (msg: string) => void
  _clearError: () => void
}

export type TestStore = TestState & TestActions

// ── Initial state ───────────────────────────────────────

const initialState: TestState = {
  session: null,
  status: 'idle',
  error: null,
  currentIndex: 0,
  answers: {},
  markedForReview: [],
  skipped: [],
  timeRemaining: 0,
  timerRunning: false,
}

// ── Store ──────────────────────────────────────────────

export const useTestStore = create<TestStore>()(
  immer((set, get) => ({
    ...initialState,

    // ── Computed helpers (use via get()) ─────────────────

    // currentQuestion: derived from session.questions[currentIndex]
    get currentQuestion(): Question | null {
      const { session, currentIndex } = get()
      return session?.questions[currentIndex] ?? null
    },

    // answeredCount: how many questions have an answer
    get answeredCount(): number {
      const { session, answers } = get()
      if (!session) return 0
      return session.questions.filter((q) => !!answers[q.id]).length
    },

    // unansweredCount: questions with no answer and not skipped
    get unansweredCount(): number {
      const { session, answers, skipped } = get()
      if (!session) return 0
      return session.questions.filter(
        (q) => !answers[q.id] && !skipped.includes(q.id),
      ).length
    },

    // markedCount: number of questions flagged for review
    get markedCount(): number {
      return get().markedForReview.length
    },

    // progressPercent: 0–100
    get progressPercent(): number {
      const { session, answers, skipped } = get()
      if (!session || session.questions.length === 0) return 0
      const touched = session.questions.filter(
        (q) => !!answers[q.id] || skipped.includes(q.id),
      ).length
      return Math.round((touched / session.questions.length) * 100)
    },

    // isLastQuestion
    get isLastQuestion(): boolean {
      const { session, currentIndex } = get()
      if (!session) return false
      return currentIndex === session.questions.length - 1
    },

    // canSubmit: at least one answer provided
    get canSubmit(): boolean {
      return get().answeredCount > 0
    },

    // ── Lifecycle actions ───────────────────────────────

    async startTest(config: TestConfig, userId?: string) {
      set((s) => {
        s.status = 'starting'
        s.error = null
      })

      try {
        const session = await createTestSession(config, userId)
        if (!session) {
          set((s) => {
            s.status = 'error'
            s.error = 'Failed to create test session. No questions available.'
          })
          return
        }

        set((s) => {
          s.session = session
          s.answers = { ...session.answers }
          s.markedForReview = [...session.markedForReview]
          s.skipped = [...session.skipped]
          s.currentIndex = 0
          s.timeRemaining = config.timeLimitMinutes * 60
          s.timerRunning = true
          s.status = 'active'
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error starting test'
        set((s) => {
          s.status = 'error'
          s.error = msg
        })
      }
    },

    async recoverTest(userId?: string) {
      set((s) => {
        s.status = 'starting'
        s.error = null
      })

      try {
        const session = await recoverActiveSession(userId)
        if (!session) {
          // No recoverable session — reset to idle
          set((s) => {
            s.status = 'idle'
          })
          return
        }

        // Calculate elapsed time and subtract from total
        const elapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000)
        const totalSeconds = session.config.timeLimitMinutes * 60
        const remaining = Math.max(0, totalSeconds - elapsedSeconds)

        set((s) => {
          s.session = session
          s.answers = { ...session.answers }
          s.markedForReview = [...session.markedForReview]
          s.skipped = [...session.skipped]
          s.currentIndex = 0
          s.timeRemaining = remaining
          s.timerRunning = remaining > 0
          s.status = remaining > 0 ? 'active' : 'completed'
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error recovering test'
        set((s) => {
          s.status = 'error'
          s.error = msg
        })
      }
    },

    async submitTest() {
      const { session, answers, markedForReview, skipped } = get()
      if (!session) return

      set((s) => {
        s.status = 'submitting'
        s.timerRunning = false
      })

      try {
        // Save latest progress first
        await saveTestProgress(session.id, {
          answers,
          markedForReview,
          skipped,
        })

        // Submit the test (calculates score, marks completed)
        const score = await submitTestDB(session.id)

        if (!score) {
          set((s) => {
            s.status = 'error'
            s.error = 'Failed to submit test.'
          })
          return
        }

        // Update local session to reflect completion
        set((s) => {
          if (s.session) {
            s.session = {
              ...s.session,
              status: 'completed',
              endedAt: Date.now(),
              score,
            }
          }
          s.status = 'completed'
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error submitting test'
        set((s) => {
          s.status = 'error'
          s.error = msg
        })
      }
    },

    async abandonTest() {
      const { session } = get()
      if (!session) return

      try {
        await abandonTestDB(session.id)
      } catch (err) {
        console.error('[testStore.abandonTest] Failed to persist abandonment:', err)
      } finally {
        set((s) => {
          s.session = { ...s.session!, status: 'abandoned', endedAt: Date.now() }
          s.status = 'idle'
          s.timerRunning = false
        })
      }
    },

    resetTest() {
      set((s) => {
        s.session = null
        s.status = 'idle'
        s.error = null
        s.currentIndex = 0
        s.answers = {}
        s.markedForReview = []
        s.skipped = []
        s.timeRemaining = 0
        s.timerRunning = false
      })
    },

    // ── Answering ─────────────────────────────────────────

    answerQuestion(questionId: string, optionId: string) {
      set((s) => {
        if (s.status !== 'active' && s.status !== 'paused') return
        s.answers[questionId] = optionId
        // Remove from skipped if it was there
        s.skipped = s.skipped.filter((id) => id !== questionId)
      })
    },

    clearAnswer(questionId: string) {
      set((s) => {
        if (s.status !== 'active' && s.status !== 'paused') return
        delete s.answers[questionId]
      })
    },

    toggleMarkForReview(questionId: string) {
      set((s) => {
        if (s.status !== 'active' && s.status !== 'paused') return
        const idx = s.markedForReview.indexOf(questionId)
        if (idx >= 0) {
          s.markedForReview.splice(idx, 1)
        } else {
          s.markedForReview.push(questionId)
        }
      })
    },

    skipQuestion(questionId: string) {
      set((s) => {
        if (s.status !== 'active' && s.status !== 'paused') return
        if (!s.skipped.includes(questionId)) {
          s.skipped.push(questionId)
        }
      })
    },

    // ── Navigation ───────────────────────────────────────

    goToQuestion(index: number) {
      set((s) => {
        if (!s.session) return
        if (index < 0 || index >= s.session.questions.length) return
        s.currentIndex = index
      })
    },

    nextQuestion() {
      const { session, currentIndex } = get()
      if (!session) return
      if (currentIndex < session.questions.length - 1) {
        set((s) => {
          s.currentIndex++
        })
      }
    },

    prevQuestion() {
      set((s) => {
        if (s.currentIndex > 0) {
          s.currentIndex--
        }
      })
    },

    // ── Timer ────────────────────────────────────────────

    pauseTest() {
      set((s) => {
        if (s.status === 'active') {
          s.status = 'paused'
          s.timerRunning = false
        }
      })
    },

    resumeTest() {
      set((s) => {
        if (s.status === 'paused') {
          s.status = 'active'
          s.timerRunning = true
        }
      })
    },

    tickTimer() {
      set((s) => {
        if (!s.timerRunning) return
        if (s.timeRemaining > 0) {
          s.timeRemaining--
        } else {
          // Time's up — stop the timer
          s.timerRunning = false
        }
      })
    },

    // ── Internal ──────────────────────────────────────────

    _setError(msg: string) {
      set((s) => {
        s.error = msg
        s.status = 'error'
      })
    },

    _clearError() {
      set((s) => {
        s.error = null
      })
    },
  })),
)
