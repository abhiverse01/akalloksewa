"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Sparkles } from "lucide-react"

const OPTIONS = ["(अ) ५ वटा", "(ब) ६ वटा", "(ग) ७ वटा", "(घ) ८ वटा"]

function LiveMockup() {
  const [active, setActive] = React.useState(0)
  const [timer, setTimer] = React.useState("42:15")
  const secondsRef = React.useRef(2535)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % 4)
      secondsRef.current--
      if (secondsRef.current < 0) secondsRef.current = 2535
      const m = Math.floor(secondsRef.current / 60)
      const s = secondsRef.current % 60
      setTimer(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative"
      style={{
        background: "var(--ink-900)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24,
        maxWidth: 440,
        animation: "float 4s ease-in-out infinite",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center size-9 rounded-lg"
            style={{ background: "rgba(37,64,160,0.25)" }}
          >
            <svg className="size-4" style={{ color: "var(--ink-200)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white">Mock Test — Paper I</div>
            <div className="text-[11px]" style={{ color: "var(--ink-300)" }}>सामान्य ज्ञान</div>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
          style={{ background: "rgba(232,168,19,0.15)", color: "var(--gold-400)" }}
        >
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timer}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "var(--ink-300)" }}>
          <span>Question 12 of 50</span>
          <span>24%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "24%" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--ink-400)" }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        className="rounded-xl p-4 mb-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[14px] font-medium text-white leading-relaxed mb-4">
          नेपालको संविधान २०७२ मा संघीय संरचनामा कति वटा प्रदेशहरू छन्?
        </p>
        <div className="space-y-2">
          {OPTIONS.map((opt, i) => {
            const isActive = i === active
            const isCorrect = i === 2
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-300"
                style={{
                  background: isActive && isCorrect
                    ? "rgba(16,163,104,0.15)"
                    : isActive
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                  border: `1px solid ${
                    isActive && isCorrect
                      ? "rgba(16,163,104,0.4)"
                      : isActive
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.04)"
                  }`,
                  color: isActive ? "white" : "var(--ink-300)",
                  boxShadow: isActive && isCorrect ? "0 0 12px rgba(16,163,104,0.2)" : "none",
                }}
              >
                <div
                  className="flex items-center justify-center size-6 rounded-full text-[11px] font-bold flex-shrink-0"
                  style={{
                    background: isActive && isCorrect ? "var(--green-500)" : isActive ? "var(--ink-400)" : "transparent",
                    border: `1px solid ${isActive ? "transparent" : "rgba(255,255,255,0.1)"}`,
                    color: isActive ? "white" : "var(--ink-300)",
                  }}
                >
                  {String.fromCharCode(193 + i)}
                </div>
                {opt}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between text-[11px]" style={{ color: "var(--ink-300)" }}>
        <span>Marked for review: 2</span>
        <span style={{ color: "var(--green-400)" }}>Answered: 11</span>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

/* ── Simplified mobile-friendly preview ── */
function MobilePreview() {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % 4)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="lg:hidden mt-8 flex justify-center md:mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: "var(--ink-900)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center size-7 rounded-md"
              style={{ background: "rgba(37,64,160,0.25)" }}
            >
              <svg className="size-3.5" style={{ color: "var(--ink-200)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-white">Mock Test — सामान्य ज्ञान</span>
          </div>
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--gold-400)" }}
          >
            Q12/50
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "24%" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--ink-400)" }}
          />
        </div>

        {/* Mini question */}
        <p className="text-[13px] font-medium text-white leading-relaxed mb-3">
          नेपालको संविधान २०७२ मा संघीय संरचनामा कति वटा प्रदेशहरू छन्?
        </p>

        {/* Mini options (compact) */}
        <div className="space-y-1.5">
          {["(अ) ५ वटा", "(ब) ६ वटा", "(ग) ७ वटा", "(घ) ८ वटा"].map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all duration-300"
              style={{
                background: i === active ? "rgba(255,255,255,0.06)" : "transparent",
                border: `1px solid ${i === active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                color: i === active ? "white" : "var(--ink-300)",
              }}
            >
              <div
                className="flex items-center justify-center size-5 rounded-full text-[10px] font-bold flex-shrink-0"
                style={{
                  background: i === active ? "var(--ink-400)" : "transparent",
                  border: `1px solid ${i === active ? "transparent" : "rgba(255,255,255,0.1)"}`,
                  color: i === active ? "white" : "var(--ink-300)",
                }}
              >
                {String.fromCharCode(193 + i)}
              </div>
              {opt}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section
      data-hero
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "100vh", paddingTop: 64, background: "var(--bg-base)" }}
    >
      {/* Decorative circle behind right column */}
      <div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          right: -80,
          width: 'min(640px, 50vw)',
          height: 'min(640px, 50vw)',
          borderRadius: "50%",
          background: "var(--ink-50)",
          opacity: 0.6,
        }}
      />

      {/* Diagonal grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            var(--ink-500) 0px,
            var(--ink-500) 1px,
            transparent 1px,
            transparent 60px
          )`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-8 items-center">
          {/* LEFT COLUMN */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <span
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium max-w-full"
                style={{
                  background: "var(--ink-50)",
                  color: "var(--ink-500)",
                  border: "1px solid var(--ink-100)",
                }}
              >
                <span
                  className="size-2 rounded-full animate-pulse-soft"
                  style={{ background: "var(--green-400)" }}
                />
                Nepal&apos;s #1 Loksewa Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="t-display-xl mb-5"
              style={{ color: "var(--text-primary)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Crack Loksewa.
              <br />
              <span
                className="italic"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: "var(--ink-400)",
                }}
              >
                Not just practice
              </span>
              <br />
              actual preparation.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="t-body-lg mb-8 max-w-lg"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              75,000+ questions. Smart ingestor. Deep analytics.
            </motion.p>

            {/* CTA row — animated primary button */}
            <motion.div
              className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-[16px] bg-gradient-to-r from-[var(--ink-400)] to-[var(--gold-400)] opacity-0 group-hover:opacity-30 blur-md transition-all duration-500" />
                <Link
                  href="/auth/register"
                  className="relative flex items-center gap-2 h-12 px-8 text-[15px] font-semibold text-white w-full sm:w-auto overflow-hidden rounded-[14px] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(37,64,160,0.25)]"
                  style={{ background: "linear-gradient(135deg, var(--ink-500), var(--ink-600))" }}
                >
                  <Sparkles className="size-4 relative z-10" />
                  <span className="relative z-10">Start Preparing Free</span>
                  <motion.svg
                    className="size-4 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                  {/* Shimmer sweep effect */}
                  <span className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
                    <span className="absolute inset-0 animate-cta-shimmer" />
                  </span>
                </Link>
              </motion.div>
              <motion.a
                href="/auth/register"
                className="text-[14px] font-medium transition-colors flex items-center gap-1"
                style={{ color: "var(--ink-400)" }}
                whileHover={{ x: 2 }}
              >
                Browse Questions
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Trusted by 50,000+
              </span>
              {/* Overlapping avatar circles */}
              <div className="flex -space-x-2">
                {["S", "R", "P", "A", "K"].map((letter, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center size-7 rounded-full text-[10px] font-bold text-white border-2"
                    style={{
                      background: ["var(--ink-500)", "var(--ink-600)", "var(--ink-400)", "var(--ink-700)", "var(--ink-500)"][i],
                      borderColor: "var(--bg-base)",
                      zIndex: 5 - i,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-3.5" style={{ color: "var(--gold-400)", fill: "var(--gold-400)" }} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>4.9/5</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — desktop mockup */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <LiveMockup />
          </motion.div>
        </div>

        {/* Mobile preview below hero text */}
        <MobilePreview />
      </div>
    </section>
  )
}
