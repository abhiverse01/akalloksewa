"use client"

import { motion } from "framer-motion"

const STATS = [
  { value: "75,000+", label: "Questions" },
  { value: "17 Subjects", label: "Full Coverage" },
  { value: "50,000+", label: "Students" },
  { value: "2018 — Present", label: "Years Running" },
]

export function StatsBar() {
  return (
    <section
      className="relative overflow-hidden mx-4 sm:mx-6 lg:mx-auto max-w-7xl"
      style={{
        background: "var(--bg-surface)",
        borderRadius: 24,
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Subtle gradient overlay at top for depth */}
      <div
        className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--bg-surface), transparent)" }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop: 4-col grid with vertical hairlines between cells */}
        <div className="hidden lg:grid lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex flex-col items-center py-10 text-center"
            >
              {/* Vertical hairline divider */}
              {i < STATS.length - 1 && (
                <div
                  className="absolute right-0 top-[15%] h-[70%]"
                  style={{ width: 1, background: "var(--border-subtle)" }}
                />
              )}
              <span
                className="font-semibold tracking-tight"
                style={{ color: "var(--ink-500)", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "clamp(28px, 3vw, 48px)" }}
              >
                {stat.value}
              </span>
              <span className="t-body-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Mobile: 2×2 grid */}
        <div className="lg:hidden grid grid-cols-2">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center py-6 sm:py-8 text-center"
              style={{
                borderTop: i >= 2 ? "1px solid var(--border-subtle)" : "none",
                borderLeft: i % 2 === 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <span
                className="font-semibold tracking-tight"
                style={{ color: "var(--ink-500)", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "clamp(20px, 4vw, 32px)" }}
              >
                {stat.value}
              </span>
              <span className="t-body-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
