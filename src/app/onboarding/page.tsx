'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/authStore'
import { updateUserRecord } from '@/lib/auth/service'
import { EXAM_TARGETS, PROVINCE_MAP } from '@/types/auth'
import type { ExamTarget, NepalProvince } from '@/types/auth'

// ── Animation Variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
}

// ── Constants ──────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function buildYearOptions(): number[] {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current; y <= current + 5; y++) years.push(y)
  return years
}

const STEP_LABELS = ['Set your target', 'Exam date', 'Your province', 'Study style']

// ── Component ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser, hydrate, hydrated, isAuthenticated } = useAuthStore()

  // ── Auth guard + redirect if already onboarded ────────────────────────
  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated || !user) {
      // Small delay to avoid flash-redirect during initial hydration
      const timer = setTimeout(() => {
        router.replace('/auth/login')
      }, 100)
      return () => clearTimeout(timer)
    }
    if (user.profile?.targetExam) {
      const timer = setTimeout(() => {
        router.replace('/dashboard')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [hydrated, isAuthenticated, user, router])

  // ── Step state ────────────────────────────────────────────────────────
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // ── Form state ────────────────────────────────────────────────────────
  const [targetExam, setTargetExam] = useState<ExamTarget | null>(null)
  const [unknownDate, setUnknownDate] = useState(false)
  const [examMonth, setExamMonth] = useState(new Date().getMonth() + 1)
  const [examYear, setExamYear] = useState(new Date().getFullYear())
  const [studyHours, setStudyHours] = useState(3)
  const [province, setProvince] = useState<NepalProvince | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [negativeMarking, setNegativeMarking] = useState(true)
  const [nepaliLabels, setNepaliLabels] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const years = buildYearOptions()

  // ── Navigation ────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }, [])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const skipAll = useCallback(() => {
    router.replace('/dashboard')
  }, [router])

  // ── Estimated chapters calculation ───────────────────────────────────
  const estimatedChapters = useCallback(() => {
    if (unknownDate) return null
    const now = new Date()
    const target = new Date(examYear, examMonth - 1, 28) // end of month
    const daysLeft = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const chapters = Math.round((daysLeft * studyHours * 2) / 50) // rough estimate
    return chapters
  }, [unknownDate, examYear, examMonth, studyHours])

  // ── Save & finish ────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    if (!user) return
    setIsSaving(true)

    const profilePatch = {
      profile: {
        ...user.profile,
        targetExam: targetExam ?? undefined,
        targetDate: unknownDate ? undefined : new Date(examYear, examMonth - 1, 15).getTime(),
        province: province ?? undefined,
        studyHoursPerDay: studyHours,
      },
    }

    const preferencesPatch = {
      preferences: {
        ...user.preferences,
        showExplanationInPractice: showExplanation ? 'immediate' as const : 'manual' as const,
        negativeMarkingEnabled: negativeMarking,
        optionLabelStyle: nepaliLabels ? 'devanagari' as const : 'latin' as const,
      },
    }

    // Update zustand store
    updateUser({ ...profilePatch, ...preferencesPatch })

    // Persist to IndexedDB
    await updateUserRecord({
      id: user.id,
      ...profilePatch,
      ...preferencesPatch,
    })

    // Confetti!
    confetti({
      particleCount: 50,
      colors: ['#d4a843', '#3d4f7a', '#2dd4bf'],
    })

    router.replace('/dashboard')
  }, [user, targetExam, unknownDate, examYear, examMonth, province, studyHours, showExplanation, negativeMarking, nepaliLabels, updateUser, router])

  // ── Guard renders ─────────────────────────────────────────────────────
  if (!hydrated || !user) return null

  const chapters = estimatedChapters()

  // ── Step indicator ────────────────────────────────────────────────────
  function renderStepIndicator() {
    return (
      <div className="flex items-center justify-center gap-2.5 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2.5">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 10 : 8,
                height: i === step ? 10 : 8,
                background:
                  i < step
                    ? 'var(--gold-400)'
                    : i === step
                      ? 'var(--gold-400)'
                      : 'var(--text-faint)',
                boxShadow:
                  i === step
                    ? '0 0 8px rgba(232, 168, 19, 0.4)'
                    : 'none',
              }}
              title={label}
              role="tab"
              aria-selected={i === step}
              aria-label={label}
            />
            {i < 3 && (
              <div
                className="w-6 h-px"
                style={{
                  background: i < step ? 'var(--gold-400)' : 'var(--text-faint)',
                  opacity: i < step ? 0.6 : 0.3,
                }}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ── Step 1: Exam Target ────────────────────────────────────────────────
  function renderStep1() {
    return (
      <div>
        <div className="mb-1 t-caption tracking-widest uppercase" style={{ color: 'var(--gold-400)' }}>
          Step 1 of 4 — {STEP_LABELS[0]}
        </div>
        <h2 className="t-heading-xl mt-2" style={{ color: 'var(--text-primary)' }}>
          What are you preparing for?
        </h2>
        <p className="t-body-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          We&apos;ll customize your question bank and dashboard.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {EXAM_TARGETS.map((exam) => (
            <button
              key={exam.value}
              type="button"
              onClick={() => {
                setTargetExam(exam.value)
                goNext()
              }}
              className="rounded-lg p-4 text-left transition-all duration-150 btn-press"
              style={{
                background:
                  targetExam === exam.value
                    ? 'rgba(51, 88, 196, 0.08)'
                    : 'transparent',
                border: `1px solid ${targetExam === exam.value ? 'var(--ink-400)' : 'var(--border-subtle)'}`,
              }}
              onMouseEnter={(e) => {
                if (targetExam !== exam.value) e.currentTarget.style.borderColor = 'var(--ink-400)'
              }}
              onMouseLeave={(e) => {
                if (targetExam !== exam.value) e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div className="t-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                {exam.label}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {exam.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Exam Date & Study Hours ───────────────────────────────────
  function renderStep2() {
    return (
      <div>
        <div className="mb-1 t-caption tracking-widest uppercase" style={{ color: 'var(--gold-400)' }}>
          Step 2 of 4 — {STEP_LABELS[1]}
        </div>
        <h2 className="t-heading-xl mt-2" style={{ color: 'var(--text-primary)' }}>
          Set your exam target date.
        </h2>
        <p className="t-body-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          We&apos;ll show you a countdown and help you pace your preparation.
        </p>

        <div className="mt-6 space-y-5">
          {/* Unknown date checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={unknownDate}
              onClick={() => setUnknownDate(!unknownDate)}
              className="size-4 shrink-0 rounded-[4px] flex items-center justify-center transition-colors duration-150"
              style={{
                border: '1px solid var(--border-subtle)',
                background: unknownDate ? 'var(--ink-400)' : 'transparent',
              }}
            >
              {unknownDate && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
                  <path d="M1 4l2.5 3L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              I don&apos;t know the exact date
            </span>
          </label>

          {/* Date pickers */}
          {!unknownDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3"
            >
              <select
                value={examMonth}
                onChange={(e) => setExamMonth(Number(e.target.value))}
                className="flex-1 h-10 rounded-md px-3 text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--ink-800)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={examYear}
                onChange={(e) => setExamYear(Number(e.target.value))}
                className="w-28 h-10 rounded-md px-3 text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--ink-800)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Study hours slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Daily study hours
              </span>
              <span className="t-body font-semibold" style={{ color: 'var(--gold-400)' }}>
                {studyHours} hrs / day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--gold-400) ${((studyHours - 1) / 7) * 100}%, var(--border-subtle) ${((studyHours - 1) / 7) * 100}%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>1</span>
              <span className="t-caption" style={{ color: 'var(--text-faint)' }}>8</span>
            </div>
          </div>

          {/* Dynamic estimate */}
          {chapters !== null && (
            <div
              className="rounded-md px-4 py-3"
              style={{
                background: 'var(--ink-800)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                At this pace, you can cover approximately{' '}
                <span className="font-semibold" style={{ color: 'var(--gold-400)' }}>
                  {chapters} chapters
                </span>{' '}
                by your exam date.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Step 3: Province ──────────────────────────────────────────────────
  function renderStep3() {
    const provinces = Object.entries(PROVINCE_MAP) as [NepalProvince, { nepali: string; english: string }][]

    return (
      <div>
        <div className="mb-1 t-caption tracking-widest uppercase" style={{ color: 'var(--gold-400)' }}>
          Step 3 of 4 — {STEP_LABELS[2]}
        </div>
        <h2 className="t-heading-xl mt-2" style={{ color: 'var(--text-primary)' }}>
          Where are you from?
        </h2>
        <p className="t-body-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          Province-specific questions are included in some exams.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {provinces.map(([key, prov]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setProvince(key)
                goNext()
              }}
              className="rounded-lg p-4 text-left transition-all duration-150 btn-press"
              style={{
                background:
                  province === key
                    ? 'rgba(51, 88, 196, 0.08)'
                    : 'transparent',
                border: `1px solid ${province === key ? 'var(--ink-400)' : 'var(--border-subtle)'}`,
              }}
              onMouseEnter={(e) => {
                if (province !== key) e.currentTarget.style.borderColor = 'var(--ink-400)'
              }}
              onMouseLeave={(e) => {
                if (province !== key) e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div className="t-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                {prov.english}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {prov.nepali}
              </div>
            </button>
          ))}

          {/* Skip card */}
          <button
            type="button"
            onClick={() => {
              setProvince(null)
              goNext()
            }}
            className="rounded-lg p-4 text-left transition-all duration-150 btn-press"
            style={{
              background: 'transparent',
              border: `1px solid var(--border-subtle)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink-400)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
            }}
          >
            <div className="t-body" style={{ color: 'var(--text-faint)' }}>
              Prefer not to say
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ── Step 4: Study Preferences ─────────────────────────────────────────
  function renderStep4() {
    const toggles = [
      {
        label: 'Show explanations immediately',
        description: 'See the correct answer and explanation right after answering',
        value: showExplanation,
        toggle: () => setShowExplanation(!showExplanation),
      },
      {
        label: 'Negative marking (−0.25 per wrong answer)',
        description: 'Mimics real exam conditions with penalty for wrong answers',
        value: negativeMarking,
        toggle: () => setNegativeMarking(!negativeMarking),
      },
      {
        label: 'Nepali option labels (क ख ग घ)',
        description: 'Use Devanagari script for option labels instead of A B C D',
        value: nepaliLabels,
        toggle: () => setNepaliLabels(!nepaliLabels),
      },
    ]

    return (
      <div>
        <div className="mb-1 t-caption tracking-widest uppercase" style={{ color: 'var(--gold-400)' }}>
          Step 4 of 4 — {STEP_LABELS[3]}
        </div>
        <h2 className="t-heading-xl mt-2" style={{ color: 'var(--text-primary)' }}>
          How do you like to study?
        </h2>
        <p className="t-body-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          You can always change these later in Settings.
        </p>

        <div className="space-y-3 mt-6">
          {toggles.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.toggle}
              className="w-full rounded-lg p-4 text-left transition-all duration-150 btn-press flex items-start justify-between gap-3"
              style={{
                background: item.value ? 'rgba(51, 88, 196, 0.08)' : 'transparent',
                border: `1px solid ${item.value ? 'var(--ink-400)' : 'var(--border-subtle)'}`,
              }}
              onMouseEnter={(e) => {
                if (!item.value) e.currentTarget.style.borderColor = 'var(--ink-400)'
              }}
              onMouseLeave={(e) => {
                if (!item.value) e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div>
                <div className="t-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {item.description}
                </div>
              </div>
              <div
                className="shrink-0 w-10 h-6 rounded-full relative transition-colors duration-200 mt-0.5"
                style={{
                  background: item.value ? 'var(--ink-400)' : 'var(--ink-800)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                  style={{
                    left: item.value ? '20px' : '2px',
                    background: item.value ? 'var(--gold-400)' : 'var(--text-faint)',
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Finish button */}
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSaving}
          className="w-full h-12 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-8 btn-press"
          style={{
            background: 'var(--gold-400)',
            color: 'var(--ink-950)',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSaving) e.currentTarget.style.background = 'var(--gold-300)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--gold-400)'
          }}
        >
          {isSaving ? 'Saving...' : 'Start Preparing →'}
        </button>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <motion.div
      {...fadeUp}
      className="w-full max-w-lg mx-auto"
    >
      <div
        className="p-8 sm:p-10 relative"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* ── Top bar: Back + Skip ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-150"
            style={{
              color: step === 0 ? 'var(--text-faint)' : 'var(--text-secondary)',
              cursor: step === 0 ? 'default' : 'pointer',
            }}
            aria-label="Go back"
          >
            ←
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={skipAll}
              className="t-body-sm transition-colors duration-150"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-faint)'
              }}
            >
              Skip
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* ── Step indicator ─────────────────────────────────────────────── */}
        {renderStepIndicator()}

        {/* ── Step content with AnimatePresence ───────────────────────────── */}
        <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {step === 0 && renderStep1()}
              {step === 1 && renderStep2()}
              {step === 2 && renderStep3()}
              {step === 3 && renderStep4()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Next button for steps 1–3 ──────────────────────────────────── */}
        {step < 3 && (
          <button
            type="button"
            onClick={goNext}
            className="w-full h-12 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-8 btn-press"
            style={{
              background: 'var(--ink-500)',
              color: '#ffffff',
              cursor: step === 1 ? 'pointer' : step === 0 && !targetExam ? 'not-allowed' : 'pointer',
              opacity: step === 0 && !targetExam ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (step !== 0 || targetExam) {
                e.currentTarget.style.background = 'var(--ink-600)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--ink-500)'
            }}
          >
            Continue →
          </button>
        )}

        {/* ── Range input styling ─────────────────────────────────────────── */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--gold-400);
            cursor: pointer;
            border: 2px solid var(--ink-800);
            box-shadow: 0 0 6px rgba(232, 168, 19, 0.3);
          }
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--gold-400);
            cursor: pointer;
            border: 2px solid var(--ink-800);
            box-shadow: 0 0 6px rgba(232, 168, 19, 0.3);
          }
          select option {
            background: var(--ink-800);
            color: var(--text-primary);
          }
        `}</style>
      </div>

      {/* ── AkalLoksewa branding ──────────────────────────────────────────── */}
      <div className="text-center mt-6">
        <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
          AkalLoksewa
        </span>
      </div>
    </motion.div>
  )
}
