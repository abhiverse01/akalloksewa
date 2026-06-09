"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Users,
  Layers,
  Zap,
  ArrowRight,
  Quote,
  Trophy,
  Brain,
  Clock,
  Star,
} from "lucide-react"

/* ── Feature highlights ── */
const FEATURES = [
  { text: "75,000+ practice questions with explanations", icon: BookOpen },
  { text: "Bilingual: Nepali & English content", icon: Brain },
  { text: "Smart analytics & weak-area detection", icon: Trophy },
  { text: "Timed mock tests mirroring real exams", icon: Clock },
]

/* ── Statistics ── */
const STATS = [
  { label: "75,000+", sublabel: "Questions", icon: BookOpen },
  { label: "17", sublabel: "Subjects", icon: Layers },
  { label: "50,000+", sublabel: "Aspirants", icon: Users },
  { label: "Free", sublabel: "to Start", icon: Zap },
]

/* ── Dot positions for particle effect (relative to container) ── */
const PARTICLES = [
  { top: "8%", left: "12%", size: 4, delay: 0 },
  { top: "15%", left: "85%", size: 3, delay: 0.8 },
  { top: "30%", left: "5%", size: 5, delay: 1.6 },
  { top: "45%", left: "92%", size: 3, delay: 0.4 },
  { top: "55%", left: "18%", size: 4, delay: 1.2 },
  { top: "70%", left: "78%", size: 5, delay: 2.0 },
  { top: "82%", left: "30%", size: 3, delay: 0.6 },
  { top: "88%", left: "65%", size: 4, delay: 1.4 },
  { top: "22%", left: "55%", size: 3, delay: 1.8 },
  { top: "65%", left: "42%", size: 4, delay: 0.2 },
  { top: "38%", left: "72%", size: 5, delay: 2.4 },
  { top: "92%", left: "90%", size: 3, delay: 1.0 },
]

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const fadeSlideUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const fadeSlideRight = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
}

/* ── Counter animation component ── */
function AnimatedStat({ label, sublabel, icon: Icon, index }: {
  label: string
  sublabel: string
  icon: React.ElementType
  index: number
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="group relative text-center"
    >
      {/* Hover glow background */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at center, rgba(232,168,19,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Icon */}
      <div className="relative flex justify-center mb-3">
        <div
          className="flex items-center justify-center size-12 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "rgba(232,168,19,0.1)",
            border: "1px solid rgba(232,168,19,0.2)",
          }}
        >
          <Icon
            className="size-5 transition-colors duration-300"
            style={{ color: "var(--gold-400)" }}
          />
        </div>
      </div>
      {/* Value */}
      <div
        className="relative t-heading-sm mb-1"
        style={{
          color: "var(--gold-300)",
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textTransform: "none",
        }}
      >
        {label}
      </div>
      {/* Sublabel */}
      <div
        className="relative t-caption"
        style={{ color: "var(--ink-400)" }}
      >
        {sublabel}
      </div>
    </motion.div>
  )
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "var(--ink-950)",
        padding: "clamp(64px, 8vw, 120px) 0",
      }}
    >
      {/* ━━━ DECORATIVE BACKGROUND LAYERS ━━━ */}

      {/* Layer 1: Radial gradient base — subtle center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(37,64,160,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(232,168,19,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Layer 2: Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Layer 3: Diagonal accent lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.5) 80px,
            rgba(255,255,255,0.5) 81px
          )`,
        }}
      />

      {/* Layer 4: Floating gradient orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "-5%",
          width: "clamp(300px, 35vw, 600px)",
          height: "clamp(300px, 35vw, 600px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(51,88,196,0.15) 0%, rgba(51,88,196,0.05) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "clamp(250px, 30vw, 500px)",
          height: "clamp(250px, 30vw, 500px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,168,19,0.12) 0%, rgba(232,168,19,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          y: [0, 15, 0],
          x: [0, -12, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Small floating gold orb */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          right: "25%",
          width: "clamp(80px, 10vw, 160px)",
          height: "clamp(80px, 10vw, 160px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,168,19,0.1) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          y: [0, -12, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Layer 5: Particle dots */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              background:
                i % 3 === 0
                  ? "rgba(232,168,19,0.35)"
                  : "rgba(135,164,239,0.2)",
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Layer 6: Grain texture */}
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* Layer 7: Devanagari decorative watermark */}
      <motion.div
        className="absolute bottom-2 right-6 sm:bottom-4 sm:right-10 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          color: "white",
          opacity: 0.03,
          lineHeight: 1,
          fontSize: "clamp(100px, 15vw, 320px)",
        }}
        animate={{ opacity: [0.03, 0.045, 0.03] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        लोक
      </motion.div>

      {/* Layer 8: Top-edge decorative line */}
      <div className="absolute top-0 inset-x-0 h-px">
        <div
          className="mx-auto"
          style={{
            width: "clamp(200px, 50%, 600px)",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(232,168,19,0.4), rgba(51,88,196,0.3), transparent)",
          }}
        />
      </div>

      {/* ━━━ MAIN CONTENT ━━━ */}
      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* ── Top badge / eyebrow ── */}
        <motion.div variants={fadeSlideUp} className="flex justify-center mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Star
              className="size-3.5"
              style={{ color: "var(--gold-400)", fill: "var(--gold-400)" }}
            />
            <span
              className="t-caption"
              style={{ color: "var(--ink-200)" }}
            >
              TRUSTED BY 50,000+ ASPIRANTS
            </span>
          </div>
        </motion.div>

        {/* ── Split Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 xl:gap-20 items-start">

          {/* ══════ LEFT COLUMN ══════ */}
          <div>
            {/* Heading */}
            <motion.h2
              variants={fadeSlideUp}
              className="t-display-lg mb-3"
              style={{
                color: "white",
                fontFamily: "var(--font-fraunces), Georgia, serif",
              }}
            >
              तपाईंको सफलता,{" "}
              <span
                className="italic"
                style={{
                  color: "var(--gold-400)",
                }}
              >
                हाम्रो लक्ष्य।
              </span>
            </motion.h2>

            {/* English subtitle */}
            <motion.p
              variants={fadeSlideUp}
              className="t-heading-lg mb-1 italic"
              style={{
                color: "var(--ink-300)",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontWeight: 400,
              }}
            >
              Your success is our mission.
            </motion.p>

            {/* Body text */}
            <motion.p
              variants={fadeSlideUp}
              className="t-body-lg mb-10 max-w-xl"
              style={{ color: "var(--ink-200)" }}
            >
              Join thousands of Loksewa aspirants preparing smarter with
              AI-powered practice, analytics, and a question bank built for
              Nepal&apos;s public service exams.
            </motion.p>

            {/* Feature highlights with staggered animation */}
            <motion.ul
              variants={containerVariants}
              className="space-y-4 mb-10"
            >
              {FEATURES.map(({ text, icon: FeatureIcon }) => (
                <motion.li
                  key={text}
                  variants={fadeSlideRight}
                  className="flex items-center gap-3.5 group"
                >
                  <div
                    className="flex items-center justify-center size-8 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(232,168,19,0.1)",
                      border: "1px solid rgba(232,168,19,0.15)",
                    }}
                  >
                    <FeatureIcon
                      className="size-4"
                      style={{ color: "var(--gold-400)" }}
                    />
                  </div>
                  <span
                    className="t-body"
                    style={{ color: "var(--ink-200)" }}
                  >
                    {text}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeSlideUp}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Primary CTA */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Glow ring behind button */}
                <div
                  className="absolute -inset-1 rounded-[16px] opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--gold-400), var(--gold-500))",
                  }}
                />
                <Link
                  href="/auth/register"
                  className="relative flex items-center gap-2 h-[52px] px-8 text-[15px] font-semibold rounded-[14px] overflow-hidden transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, var(--gold-400), var(--gold-500))",
                    color: "var(--ink-950)",
                    boxShadow: "0 2px 16px rgba(232,168,19,0.25)",
                  }}
                >
                  <Sparkles className="size-4 relative z-10" />
                  <span className="relative z-10">
                    Get Started — It&apos;s Free
                  </span>
                  <motion.svg
                    className="size-4 relative z-10 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                  {/* Shimmer sweep */}
                  <span className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
                    <span className="absolute inset-0 animate-cta-shimmer" />
                  </span>
                </Link>
              </motion.div>

              {/* Secondary CTA */}
              <Link
                href="/questions"
                className="group/browse inline-flex items-center gap-2 h-[52px] px-6 text-[14px] font-medium rounded-[14px] transition-all duration-300"
                style={{
                  color: "var(--ink-200)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <BookOpen className="size-4" />
                <span>Browse Questions</span>
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/browse:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* ══════ RIGHT COLUMN ══════ */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-5"
          >
            {/* ── Stats Grid Card ── */}
            <motion.div
              variants={fadeSlideUp}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Inner accent glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: "60%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(232,168,19,0.3), transparent)",
                }}
              />

              <div className="p-6 sm:p-8">
                {/* Stats heading */}
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className="flex items-center justify-center size-7 rounded-md"
                    style={{
                      background: "rgba(51,88,196,0.15)",
                      border: "1px solid rgba(51,88,196,0.2)",
                    }}
                  >
                    <Zap className="size-3.5" style={{ color: "var(--ink-300)" }} />
                  </div>
                  <span
                    className="t-caption"
                    style={{ color: "var(--ink-300)" }}
                  >
                    PLATFORM AT A GLANCE
                  </span>
                </div>

                {/* Stats grid */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-5 sm:gap-6"
                >
                  {STATS.map((stat, i) => (
                    <AnimatedStat key={stat.sublabel} {...stat} index={i} />
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* ── Testimonial Card ── */}
            <motion.div
              variants={fadeSlideUp}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Decorative top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(16,163,104,0.3), transparent)",
                }}
              />

              <div className="p-6 sm:p-8">
                {/* Large decorative quote mark */}
                <div
                  className="mb-2 select-none pointer-events-none"
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "var(--gold-400)",
                    opacity: 0.2,
                  }}
                >
                  &ldquo;
                </div>

                {/* Testimonial text */}
                <p
                  className="t-body italic leading-relaxed mb-6"
                  style={{
                    color: "var(--ink-200)",
                    paddingLeft: "4px",
                  }}
                >
                  I practiced 200+ mock tests before the Nasu exam. The
                  timed sessions were incredibly close to the real test
                  experience. AkalLoksewa gave me the confidence I needed.
                </p>

                {/* Author info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="flex items-center justify-center size-11 rounded-full text-[13px] font-bold text-white flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--green-500), var(--green-400))",
                      boxShadow: "0 0 16px rgba(16,163,104,0.25)",
                    }}
                  >
                    PS
                  </div>
                  <div>
                    <div
                      className="text-[14px] font-semibold"
                      style={{ color: "white" }}
                    >
                      Priya Sharma
                    </div>
                    <div
                      className="t-body-sm flex items-center gap-1.5"
                      style={{ color: "var(--ink-400)" }}
                    >
                      <CheckCircle2 className="size-3" style={{ color: "var(--green-400)" }} />
                      Nasu — Passed First Attempt
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Social proof micro-strip ── */}
            <motion.div
              variants={fadeSlideUp}
              className="flex items-center justify-between rounded-xl px-5 py-3.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2">
                {/* Overlapping avatars */}
                <div className="flex -space-x-2">
                  {[
                    { letter: "S", bg: "var(--ink-500)" },
                    { letter: "R", bg: "var(--ink-600)" },
                    { letter: "P", bg: "var(--green-500)" },
                    { letter: "A", bg: "var(--ink-400)" },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center size-7 rounded-full text-[9px] font-bold text-white"
                      style={{
                        background: a.bg,
                        border: "2px solid var(--ink-950)",
                        zIndex: 4 - i,
                      }}
                    >
                      {a.letter}
                    </div>
                  ))}
                </div>
                <span
                  className="t-body-sm"
                  style={{ color: "var(--ink-300)" }}
                >
                  +50,000 active users
                </span>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3"
                    style={{
                      color: "var(--gold-400)",
                      fill: "var(--gold-400)",
                    }}
                  />
                ))}
                <span
                  className="t-body-sm ml-1 font-semibold"
                  style={{ color: "var(--ink-200)" }}
                >
                  4.9
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom decorative divider ── */}
        <motion.div
          variants={fadeSlideUp}
          className="mt-16 sm:mt-20 lg:mt-24"
        >
          <div
            className="mx-auto"
            style={{
              width: "clamp(100px, 30%, 400px)",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            }}
          />
          <p
            className="text-center t-body-sm mt-5 italic"
            style={{ color: "var(--ink-600)" }}
          >
            सफलता हाम्रो प्रतिबद्धता हो — Success is our commitment.
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
