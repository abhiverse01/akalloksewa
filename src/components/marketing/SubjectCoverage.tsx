"use client"

import { motion } from "framer-motion"
import { LOKSEWA_SUBJECTS } from "@/lib/constants"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

export function SubjectCoverage() {
  return (
    <section
      id="subjects"
      className="py-12 sm:py-16 lg:py-28"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-10 sm:mb-14"
        >
          <span className="t-heading-sm" style={{ color: "var(--text-faint)" }}>
            FULL COVERAGE
          </span>
          <h2 className="t-display-lg mt-3" style={{ color: "var(--text-primary)" }}>
            17 Subjects. One Platform.
          </h2>
        </motion.div>

        {/* Table-like list */}
        <motion.div
          variants={containerVariants}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl"
        >
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
              borderRadius: 20,
              overflow: 'hidden',
              border: "1px solid var(--border-subtle)",
            }}
          >
            {LOKSEWA_SUBJECTS.map((subject, i) => (
              <motion.div
                key={subject.id}
                variants={rowVariants}
                className="grid grid-cols-[32px_1fr] sm:grid-cols-[48px_1fr_1fr] items-center gap-3 sm:gap-4 py-3 px-2 sm:px-4 transition-colors cursor-default"
                style={{
                  borderBottom:
                    i < LOKSEWA_SUBJECTS.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-raised)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Number */}
                <span
                  className="t-mono text-right"
                  style={{
                    color: "var(--gold-400)",
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: 13,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Nepali name */}
                <span
                  className="font-medium truncate"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 16,
                  }}
                >
                  {subject.label}
                </span>

                {/* English name — hidden on mobile */}
                <span
                  className="hidden sm:block t-body-sm truncate"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {subject.labelEn}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
