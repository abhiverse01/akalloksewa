'use client'

import Link from "next/link"
import Image from "next/image"
import { AuthGuardedLink } from "@/components/shared/AuthGuardedLink"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  Shield,
  Mail,
  Zap,
  Send,
  Heart,
  CheckCircle2,
  CalendarDays,
  Lightbulb,
  HelpCircle,
  Trophy,
  FileText,
  Sparkles,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

/* ═══════════════════════════════════════════════════════════════
   DATA — Link collections
   ═══════════════════════════════════════════════════════════════ */

const PRODUCT_LINKS = [
  { href: "/practice", label: "Practice Mode" },
  { href: "/syllabus", label: "Question Bank" },
  { href: "/analytics", label: "Analytics" },
]

const QUICK_LINKS = [
  { href: "/features", label: "Features", icon: Zap },
  { href: "/pricing", label: "Pricing", icon: Trophy },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/about", label: "About", icon: GraduationCap },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/auth/register", label: "Get Started", icon: Sparkles },
]

const LEARN_LINKS = [
  { href: "/syllabus", label: "Syllabus" },
  { href: "/notes", label: "Study Notes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
]

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/contact", label: "Contact" },
]

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com/akalloksewa",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/akalloksewa",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/akalloksewa",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@akalloksewa",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/9779841234567",
    path: "M17.472 14.382c-.297-.149-1.758-.867-3.16-1.61l-2.904-1.592c-.724-.397-1.387-.777-1.97-1.155l-1.09-.763c-.459-.322-.842-.197-.987.345-.146.542-.064.967.183 1.36 2.06 2.488l.399.403c.376.38.733.78 1.07 1.196 1.698 1.332 3.432 1.332 5.096 0 1.655-.462 3.296-1.382 4.858-.919 1.564-2.404 2.97-4.246 4.08-3.326 2.074-5.55 3.164-9.412 3.164-3.864 0-7.188-1.34-9.89-4.022-2.26-2.26-4.076-3.956-7.194-3.956-3.124 0-5.86 1.168-7.964 3.508-2.1 2.34-3.464 5.282-3.464 8.736 0 1.668.12 3.24.348 4.488.977 1.248 2.12 2.29 3.428 2.84.458.15.796.282 1.044.512l2.746 1.332c.802.39 1.57.787 2.272 1.244.478.29.962.652.702 1.044-.08.104-.164.204-.28l-2.72-1.328c-.8-.39-1.564-.77-2.28-1.164zM12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 5.477 2 10 4.477 10 10S18.523 22 12 22z",
  },
]

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */

const columnVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [email, setEmail] = useState("")
  const [newsletter, setNewsletter] = useState<{ subscribed: boolean; savedEmail: string | null }>({
    subscribed: false,
    savedEmail: null,
  })

  // Hydrate newsletter state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("akalloksewa_newsletter")
    if (stored) {
      const id = requestAnimationFrame(() => {
        setNewsletter({ subscribed: true, savedEmail: stored })
      })
      return () => cancelAnimationFrame(id)
    }
  }, [])

  // Show back-to-top button when scrolled down
  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return
      localStorage.setItem("akalloksewa_newsletter", email.trim())
      setNewsletter({ subscribed: true, savedEmail: email.trim() })
    },
    [email]
  )

  const subscribed = newsletter.subscribed
  const savedEmail = newsletter.savedEmail

  return (
    <footer
      className="relative grain rounded-t-3xl overflow-hidden"
      style={{ background: "var(--ink-950)", marginTop: "24px" }}
    >
      {/* ─── Gold accent line at top ─── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--gold-400), transparent)",
        }}
      />

      {/* ─── Decorative Nepal mountain silhouette ─── */}
      <div
        className="absolute top-[2px] left-0 right-0 h-16 sm:h-20 opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-full"
          fill="currentColor"
          style={{ color: "var(--gold-400)" }}
        >
          {/* Mountain range silhouette */}
          <path d="M0,120 L0,90 L60,55 L120,70 L180,40 L240,60 L300,30 L340,45 L380,15 L420,35 L480,25 L540,50 L600,20 L660,40 L720,10 L780,30 L840,45 L900,15 L960,35 L1020,50 L1080,20 L1140,40 L1200,55 L1260,30 L1320,50 L1380,35 L1440,60 L1440,120 Z" />
          {/* Second layer — slightly transparent */}
          <path
            d="M0,120 L0,95 L80,70 L160,80 L240,55 L320,70 L400,50 L480,65 L560,45 L640,60 L720,40 L800,55 L880,50 L960,60 L1040,45 L1120,65 L1200,55 L1280,70 L1360,60 L1440,75 L1440,120 Z"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          NEWSLETTER SECTION
         ═══════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(232,168,19,0.08) 0%, rgba(37,64,160,0.12) 100%)",
            border: "1px solid rgba(232,168,19,0.15)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(232,168,19,0.08)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(37,64,160,0.08)" }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: text */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div
                className="flex items-center justify-center size-10 rounded-xl shrink-0"
                style={{ background: "rgba(232,168,19,0.15)", color: "var(--gold-400)" }}
              >
                <Mail className="size-5" />
              </div>
              <div className="min-w-0">
                <h3
                  className="text-[15px] sm:text-[16px] font-semibold"
                  style={{ color: "var(--ink-100)" }}
                >
                  Stay ahead of the exam
                </h3>
                <p
                  className="text-[13px] mt-0.5"
                  style={{ color: "var(--ink-400)" }}
                >
                  Get study tips, exam updates, and practice questions in your inbox.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="shrink-0 w-full sm:w-auto sm:min-w-[340px]">
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="subscribed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(16,163,104,0.1)",
                      border: "1px solid rgba(16,163,104,0.2)",
                    }}
                  >
                    <CheckCircle2 className="size-4 shrink-0" style={{ color: "var(--green-400)" }} />
                    <span className="text-[13px] font-medium truncate max-w-[260px]" style={{ color: "var(--green-400)" }}>
                      Subscribed with {savedEmail}
                    </span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubscribe}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all duration-200 placeholder:text-[var(--ink-500)] focus:ring-2 focus:ring-[var(--gold-400)]"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--ink-100)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <motion.button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold shrink-0 transition-colors duration-200"
                      style={{ background: "var(--gold-400)", color: "var(--ink-950)" }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(232,168,19,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Send className="size-3.5" />
                      <span className="hidden sm:inline">Subscribe</span>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN FOOTER GRID
         ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          {/* ─── Column 1: Brand ─── */}
          <motion.div className="col-span-1" variants={columnVariant}>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <Image
                src="/logo-dark-32.png"
                alt="AkalLoksewa"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span
                className="text-[20px] font-semibold tracking-tight"
                style={{
                  color: "var(--ink-100)",
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                }}
              >
                akalloksewa
              </span>
            </Link>
            <p
              className="text-[13px] leading-relaxed mb-5 max-w-[220px]"
              style={{
                color: "var(--ink-400)",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic",
              }}
            >
              Nepal&apos;s smartest Loksewa preparation platform.
            </p>

            {/* Social icons with animated hover */}
            <div className="flex items-center gap-2 mb-4">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center size-9 rounded-xl transition-all duration-300 hover:shadow-[0_0_16px_rgba(232,168,19,0.25)]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--ink-400)",
                  }}
                  aria-label={social.label}
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </motion.a>
              ))}
            </div>

            {/* Email with icon */}
            <motion.a
              href="mailto:akalloksewa@gmail.com"
              className="inline-flex items-center gap-2 text-[12px] font-medium transition-all duration-200 hover:text-white hover:gap-2.5"
              style={{ color: "var(--ink-400)" }}
              whileHover={{ scale: 1.02 }}
            >
              <Mail className="size-3.5" />
              akalloksewa@gmail.com
            </motion.a>
          </motion.div>

          {/* ─── Column 2: Product ─── */}
          <motion.div variants={columnVariant}>
            <h3
              className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--ink-200)" }}
            >
              <BookOpen className="size-3.5" />
              Product
            </h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-block"
                  >
                    <AuthGuardedLink
                      href={link.href}
                      className="text-[14px] transition-colors duration-200 hover:text-[var(--ink-100)] inline-flex items-center gap-1.5 group"
                      style={{ color: "var(--ink-400)" }}
                    >
                      <span
                        className="inline-block size-0 group-hover:w-3 group-hover:border-t-[1.5px] group-hover:border-l-[1.5px] group-hover:border-t-[var(--gold-400)] group-hover:border-l-[var(--gold-400)] transition-all duration-300"
                        style={{
                          borderTop: "1.5px solid transparent",
                          borderLeft: "1.5px solid transparent",
                        }}
                        aria-hidden="true"
                      />
                      {link.label}
                    </AuthGuardedLink>
                  </motion.span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ─── Column 3: Quick Links ─── */}
          <motion.div variants={columnVariant}>
            <h3
              className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--ink-200)" }}
            >
              <Zap className="size-3.5" style={{ color: "var(--gold-400)" }} />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-block"
                  >
                    <Link
                      href={link.href}
                      className="text-[14px] transition-colors duration-200 hover:text-[var(--ink-100)] inline-flex items-center gap-2 group"
                      style={{ color: "var(--ink-400)" }}
                    >
                      <link.icon
                        className="size-3.5 text-[var(--ink-600)] group-hover:text-[var(--gold-400)] transition-colors duration-200"
                      />
                      {link.label}
                    </Link>
                  </motion.span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ─── Column 4: Learn ─── */}
          <motion.div variants={columnVariant}>
            <h3
              className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--ink-200)" }}
            >
              <GraduationCap className="size-3.5" />
              Learn
            </h3>
            <ul className="space-y-2.5">
              {LEARN_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-block"
                  >
                    <AuthGuardedLink
                      href={link.href}
                      className="text-[14px] transition-colors duration-200 hover:text-[var(--ink-100)] inline-block"
                      style={{ color: "var(--ink-400)" }}
                    >
                      {link.label}
                    </AuthGuardedLink>
                  </motion.span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ─── Column 5: Legal ─── */}
          <motion.div variants={columnVariant}>
            <h3
              className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--ink-200)" }}
            >
              <Shield className="size-3.5" />
              Legal
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-block"
                  >
                    <Link
                      href={link.href}
                      className="text-[14px] transition-colors duration-200 hover:text-[var(--ink-100)] inline-block"
                      style={{ color: "var(--ink-400)" }}
                    >
                      {link.label}
                    </Link>
                  </motion.span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* ─── Divider with gradient ─── */}
        <div
          className="mt-8 mb-5 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />

        {/* ─── Bottom bar ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: copyright + made with love */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p
              className="text-[12px] flex items-center gap-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <span>&copy; 2026 Abhishek Shah</span>
              <span style={{ color: "var(--ink-600)" }}>&middot;</span>
              <span style={{ color: "var(--ink-400)" }}>AkalLoksewa</span>
            </p>

            {/* Made with love in Nepal */}
            <motion.p
              className="text-[11px] flex items-center gap-1"
              style={{ color: "var(--ink-600)" }}
              whileHover={{ scale: 1.02 }}
            >
              <span>Made with</span>
              <Heart
                className="size-3"
                style={{ color: "var(--gold-400)" }}
                fill="currentColor"
              />
              <span>in Nepal</span>
              <span className="ml-1" aria-hidden="true">
                🇳🇵
              </span>
            </motion.p>
          </div>

          {/* Back to top button — animated */}
          <motion.button
            onClick={scrollToTop}
            className="flex items-center justify-center size-10 rounded-full transition-all duration-300 group"
            style={{
              background: "var(--ink-800)",
              color: "var(--ink-300)",
              border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: showTopBtn ? "auto" : "none",
            }}
            whileHover={{
              scale: 1.15,
              boxShadow: "0 0 20px rgba(232,168,19,0.3)",
              background: "var(--ink-700)",
            }}
            whileTap={{ scale: 0.9 }}
            animate={
              showTopBtn
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 4, pointerEvents: "none" as const }
            }
            aria-label="Back to top"
          >
            <svg
              className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ─── Decorative bottom gold shimmer line ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, var(--gold-400) 50%, transparent 90%)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </footer>
  )
}
