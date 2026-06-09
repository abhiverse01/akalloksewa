"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

/* ── Avatar colours (cycled per card) ── */
const AVATAR_COLORS = [
  "#2540a0",
  "#10a368",
  "#e8a813",
  "#e03030",
  "#5577e0",
  "#d97706",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#0369a1",
]

/* ── Testimonial data ── */
const TESTIMONIALS = [
  {
    quote:
      "AkalLoksewa completely transformed my preparation strategy. The analytics helped me focus on weak areas in General Knowledge and Constitution.",
    name: "Suman Karki",
    score: "Kharidar — Selected",
    initials: "SK",
    rating: 5,
  },
  {
    quote:
      "I practiced 200+ mock tests before the Nasu exam. The timed sessions were incredibly close to the real test experience.",
    name: "Priya Sharma",
    score: "Nasu — Passed First Attempt",
    initials: "PS",
    rating: 5,
  },
  {
    quote:
      "The question bank quality is unmatched. Every answer has detailed explanations in both Nepali and English.",
    name: "Ramesh Adhikari",
    score: "Officer Level — Top 10",
    initials: "RA",
    rating: 5,
  },
  {
    quote:
      "The streak feature kept me motivated. I studied every single day for 3 months straight and it paid off. AkalLoksewa made consistency easy.",
    name: "Binita Thapa",
    score: "Kharidar — Selected, Score: 78%",
    initials: "BT",
    rating: 5,
  },
  {
    quote:
      "I used the content ingestor to add my own notes from coaching classes. Having everything in one place was a game-changer for revision.",
    name: "Dipak Gurung",
    score: "Nayab Subba — Passed, Score: 72%",
    initials: "DG",
    rating: 5,
  },
  {
    quote:
      "The subject-wise accuracy breakdown showed me exactly where I was weak. I focused on Constitution and Governance and improved my score by 18%.",
    name: "Anita Sharma",
    score: "Adhikrit — Selected, Score: 81%",
    initials: "AS",
    rating: 5,
  },
  {
    quote:
      "Clearing the Police Inspector exam on my first attempt felt unreal. AkalLoksewa's law and order section covered every topic that appeared in the actual exam.",
    name: "Bikash Basnet",
    score: "Police Inspector — Selected, Score: 83%",
    initials: "BB",
    rating: 5,
  },
  {
    quote:
      "Being from a rural municipality, I couldn't attend coaching classes. AkalLoksewa's offline mode and study planner let me prepare on my phone during commutes.",
    name: "Srijana Magar",
    score: "Kharidar — Selected, Score: 71%",
    initials: "SM",
    rating: 4,
  },
  {
    quote:
      "The Nepali-English bilingual explanations are what set AkalLoksewa apart. I'm more comfortable in Nepali and the dual-language answers helped me understand concepts deeply.",
    name: "Krishna Poudel",
    score: "Nasu — Passed, Score: 76%",
    initials: "KP",
    rating: 5,
  },
  {
    quote:
      "I appeared for the Armed Police exam after using AkalLoksewa for just 4 months. The daily quiz feature built my speed — I finished the paper 15 minutes early.",
    name: "Laxmi Rai",
    score: "Armed Police — Passed First Attempt",
    initials: "LR",
    rating: 5,
  },
  {
    quote:
      "As a working mother, I only had 2 hours a day for preparation. AkalLoksewa's study planner helped me create a realistic schedule and the progress reports kept me accountable. I cleared Khasi on my second attempt.",
    name: "Mamata Shrestha",
    score: "Khasi — Passed, Score: 68%",
    initials: "MS",
    rating: 4,
  },
  {
    quote:
      "The detailed explanations for every answer were a lifesaver. When I got a question wrong, I didn't just see the correct option — I understood the reasoning. That's what made the difference in my Officer-level result.",
    name: "Hari Bahadur BK",
    score: "Officer Level — Selected, Score: 75%",
    initials: "HB",
    rating: 5,
  },
  {
    quote:
      "I appeared for the Teacher Service Commission exam alongside Loksewa. AkalLoksewa's General Knowledge and Education-related questions overlapped perfectly with both syllabi. The app essentially prepared me for two exams at once.",
    name: "Sunita Nepali",
    score: "Teacher Service — Selected, Loksewa Nasu — Passed",
    initials: "SN",
    rating: 5,
  },
]

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

/* ── Star rating component ── */
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5"
          style={{
            color: i < count ? "var(--gold-400)" : "var(--ink-400)",
            fill: i < count ? "var(--gold-400)" : "none",
          }}
        />
      ))}
    </div>
  )
}

export function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = useState(0)

  /* ── Derive snap point width for dot tracking ── */
  const getScrollIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el) return 0
    const cardWidth = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth ?? 0
    const gap = 16 // gap-4 = 1rem = 16px
    const step = cardWidth + gap
    return Math.round(el.scrollLeft / step)
  }, [])

  const handleScroll = useCallback(() => {
    setActiveDot(getScrollIndex())
  }, [getScrollIndex])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToCard = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth ?? 0
    const gap = 16
    el.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" })
  }

  /* Total scrollable steps (cards - visible count on mobile ≈ 1, so all cards) */
  const totalDots = TESTIMONIALS.length

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-14"
        >
          <span
            className="t-heading-sm"
            style={{ color: "var(--text-faint)" }}
          >
            VOICES
          </span>
          <h2
            className="t-display-lg mt-3"
            style={{ color: "var(--text-primary)" }}
          >
            From aspirants who made it.
          </h2>
        </motion.div>

        {/* Cards — horizontal scroll on mobile, 3-col grid on desktop */}
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="flex-shrink-0 w-[300px] snap-start lg:w-auto"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: 24,
              }}
            >
              {/* Star rating */}
              <div className="mb-4">
                <StarRating count={t.rating} />
              </div>

              {/* Quote */}
              <p
                className="t-body italic leading-relaxed mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="flex items-center justify-center size-10 rounded-full text-[13px] font-semibold text-white flex-shrink-0"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[14px] font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="t-body-sm truncate"
                    style={{ color: "var(--ink-400)" }}
                  >
                    {t.score}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Scroll indicator dots (mobile only) ── */}
        <div
          className="flex items-center justify-center gap-2 mt-6 lg:hidden"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeDot}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => scrollToCard(i)}
              className="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                width: i === activeDot ? 24 : 8,
                height: 8,
                background:
                  i === activeDot ? "var(--gold-400)" : "var(--ink-400)",
                opacity: i === activeDot ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
