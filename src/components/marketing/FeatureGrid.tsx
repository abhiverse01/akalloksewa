"use client"

import { motion } from "framer-motion"
import {
  BrainCircuit,
  FileCheck2,
  Timer,
  BarChart3,
  Upload,
  Bookmark,
  BookOpen,
  Flame,
  StickyNote,
  CheckCircle2,
} from "lucide-react"

const FEATURES = [
  // Row 1
  {
    icon: BrainCircuit,
    title: "Smart Practice",
    description: "Adaptive difficulty that targets your weak areas. Spaced repetition ensures you never forget what you learn.",
    cols: 5,
    row: 1,
  },
  {
    icon: FileCheck2,
    title: "Mock Tests",
    description: null,
    cols: 4,
    row: 1,
    hasMiniQuestion: true,
  },
  {
    icon: Timer,
    title: "Timed Sessions",
    description: "Customizable countdown timers to build speed and accuracy under real exam pressure conditions.",
    cols: 3,
    row: 1,
  },
  // Row 2
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Subject-level performance breakdowns with visual radar charts, heatmaps, and trend tracking over time.",
    cols: 3,
    row: 2,
  },
  {
    icon: Upload,
    title: "Ingestor Engine",
    description: null,
    cols: 6,
    row: 2,
    hero: true,
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    description: "Save questions for later review. Build a personalized revision list sorted by subject and difficulty.",
    cols: 3,
    row: 2,
  },
  // Row 3
  {
    icon: BookOpen,
    title: "17 Subjects",
    description: "Complete coverage from Constitution to Computer IT. Every subject in the Loksewa syllabus, organized by chapter.",
    cols: 4,
    row: 3,
  },
  {
    icon: Flame,
    title: "Study Streaks",
    description: "Daily practice streaks with visual tracking. Build consistency and watch your progress compound over weeks.",
    cols: 4,
    row: 3,
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    description: "Attach notes to any question or topic. Review them before exams. Your personal knowledge base, always synced.",
    cols: 4,
    row: 3,
  },
]

const PIPELINE_STEPS = [
  { label: "Paste Text", color: "var(--ink-200)" },
  { label: "Parse", color: "var(--ink-200)" },
  { label: "Classify", color: "var(--ink-200)" },
  { label: "Review", color: "var(--ink-200)" },
  { label: "Live in DB", color: "var(--gold-400)" },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

/* ─── Mini Mock Question (inside Mock Tests card) ─── */
function MiniMockQuestion() {
  return (
    <div
      className="mt-4 rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <p className="text-[12px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        नेपालको राष्ट्रिय फूल के हो?
      </p>
      <div className="space-y-1.5">
        {["ललिगुरास", "गोदावरी", "सयाँत्री"].map((opt, i) => {
          const isCorrect = i === 0
          return (
            <div
              key={opt}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors"
              style={{
                background: isCorrect ? "rgba(16,163,104,0.12)" : "transparent",
                border: `1px solid ${isCorrect ? "rgba(16,163,104,0.3)" : "var(--border-subtle)"}`,
                color: isCorrect ? "var(--green-400)" : "var(--text-tertiary)",
              }}
            >
              <span
                className="flex items-center justify-center size-5 rounded text-[10px] font-bold flex-shrink-0"
                style={{
                  background: isCorrect ? "var(--green-500)" : "var(--bg-raised)",
                  color: isCorrect ? "white" : "var(--text-faint)",
                  border: `1px solid ${isCorrect ? "transparent" : "var(--border-subtle)"}`,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {isCorrect && <CheckCircle2 className="size-3 ml-auto flex-shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FeatureGrid() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-10 sm:mb-14"
        >
          <span className="t-heading-sm" style={{ color: "var(--text-faint)" }}>
            WHAT&apos;S INSIDE
          </span>
          <h2 className="t-display-lg mt-3 mb-3" style={{ color: "var(--text-primary)" }}>
            Every tool you need.
          </h2>
          <p className="t-body-lg" style={{ color: "var(--text-secondary)" }}>
            Designed for how Nepali aspirants actually study.
          </p>
        </motion.div>

        {/* Bento grid — 12 columns on md+, single column on mobile */}
        <motion.div
          variants={containerVariants}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="feature-card overflow-hidden"
                data-cols={feature.cols}
                style={{
                  ...(feature.hero
                    ? { background: "var(--ink-900)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20 }
                    : {
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 20,
                      }),
                  padding: 20,
                }}
              >
                {feature.hero ? (
                  /* ─── Ingestor hero card ─── */
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <Icon className="size-5" style={{ color: "var(--ink-200)" }} />
                      <h3 className="t-heading-md text-white">{feature.title}</h3>
                    </div>
                    <p className="t-body-sm mb-6" style={{ color: "var(--ink-300)" }}>
                      Upload past papers or any text. Our 6-stage pipeline parses, classifies, deduplicates, and publishes questions — automatically.
                    </p>
                    {/* Pipeline visualization */}
                    <div className="flex items-center gap-0 flex-wrap">
                      {PIPELINE_STEPS.map((step, i) => (
                        <div key={step.label} className="flex items-center">
                          <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap"
                            style={{
                              background: i === PIPELINE_STEPS.length - 1
                                ? "rgba(232,168,19,0.15)"
                                : "rgba(255,255,255,0.06)",
                              color: step.color,
                              border: `1px solid ${
                                i === PIPELINE_STEPS.length - 1
                                  ? "rgba(232,168,19,0.3)"
                                  : "rgba(255,255,255,0.08)"
                              }`,
                            }}
                          >
                            {step.label}
                          </span>
                          {i < PIPELINE_STEPS.length - 1 && (
                            <svg
                              className="mx-1.5 flex-shrink-0"
                              width="16"
                              height="12"
                              viewBox="0 0 16 12"
                              fill="none"
                            >
                              <path d="M1 6H14M14 6L10 2M14 6L10 10" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : feature.hasMiniQuestion ? (
                  /* ─── Mock Tests card with mini question ─── */
                  <>
                    <div className="flex items-center gap-2">
                      <Icon className="size-5" style={{ color: "var(--ink-400)" }} />
                      <h3 className="t-heading-md" style={{ color: "var(--text-primary)" }}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className="t-body-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                      Full-length timed papers that simulate real Loksewa exam conditions exactly.
                    </p>
                    <MiniMockQuestion />
                  </>
                ) : (
                  /* ─── Standard card ─── */
                  <>
                    <Icon className="size-5" style={{ color: "var(--ink-400)" }} />
                    <h3
                      className="t-heading-md mt-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="t-body-sm mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {feature.description}
                    </p>
                  </>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
