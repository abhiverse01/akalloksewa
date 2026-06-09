"use client"

import * as React from "react"
import Link from "next/link"
import { AuthGuardedLink } from "@/components/shared/AuthGuardedLink"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamic import with ssr: false prevents Radix Sheet from being
// server-rendered, eliminating the aria-controls hydration mismatch entirely.
const MobileNavSheet = dynamic(
  () => import("./MobileNavSheet").then((m) => ({ default: m.MobileNavSheet })),
  { ssr: false }
)

const DESKTOP_LINKS = [
  { label: "Features", href: "/features", badge: "NEW" },
  { label: "Subjects", href: "/syllabus" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent))
  }, [])

  React.useEffect(() => {
    const hero = document.querySelector("[data-hero]")
    if (!hero) {
      setScrolled(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    observer.observe(hero as Element)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[64px] transition-all duration-500",
        scrolled
          ? "navbar-scrolled"
          : "navbar-glass"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-colors duration-150"
        >
          <Image src="/logo.png" alt="AkalLoksewa" width={32} height={32} className="rounded-md" />
          <span
            className="text-[20px] font-semibold tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              textShadow: scrolled ? 'none' : '0 1px 3px rgba(247, 248, 252, 0.8)',
            }}
          >
            akalloksewa
          </span>
        </Link>

        {/* Desktop center — nav links */}
        <div className="hidden md:flex items-center gap-1">
          {/* Keyboard shortcut label */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
            className="mr-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors duration-150"
            style={{ color: 'var(--text-faint)', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
            aria-label="Search"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <kbd className="font-mono text-[10px]" style={{ opacity: 0.6 }}>{isMac ? '\u2318K' : '\u2303K'}</kbd>
          </button>
          {DESKTOP_LINKS.map((link) =>
            link.label === "Subjects" ? (
              <DesktopNavLink key={link.label} label={link.label} href={link.href} badge={link.badge} useAuthGuard />
            ) : (
              <DesktopNavLink key={link.label} label={link.label} href={link.href} badge={link.badge} />
            )
          )}
        </div>

        {/* Desktop right — separator + CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="h-4 mx-1"
            style={{ width: 1, background: "var(--border-subtle)" }}
          />
          <Button
            variant="ghost"
            className="h-9 px-4 text-[13px] font-medium transition-colors duration-150"
            style={{ color: "var(--text-secondary)" }}
            asChild
          >
            <Link href="/auth/login">Log in</Link>
          </Button>

          {/* Animated CTA button */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="absolute -inset-0.5 rounded-[12px] animate-cta-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Link
              href="/auth/register"
              className="relative flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold text-white rounded-[11px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,64,160,0.3)] overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--ink-500), var(--ink-400))" }}
            >
              <Sparkles className="size-3.5 relative z-10" />
              <span className="relative z-10">Start Free</span>
              <motion.svg
                className="size-3.5 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
              {/* Shimmer sweep */}
              <span className="absolute inset-0 overflow-hidden rounded-[11px] pointer-events-none">
                <span className="absolute inset-0 animate-cta-shimmer" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Mobile hamburger — dynamically imported, no SSR */}
        <MobileNavSheet />
      </div>
    </header>
  )
}

/* ─── Desktop Nav Link with ink-dot hover indicator + active state + optional badge ─── */
function DesktopNavLink({ href, label, badge, useAuthGuard }: { href: string; label: string; badge?: string; useAuthGuard?: boolean }) {
  const [hovered, setHovered] = React.useState(false)
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  const Wrapper = useAuthGuard ? AuthGuardedLink : Link

  return (
    <Wrapper
      href={href}
      className="relative flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium transition-colors duration-150"
      style={{
        color: isActive ? "var(--text-primary)" : hovered ? "var(--text-primary)" : "var(--text-secondary)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {badge && (
        <span
          className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
          style={{
            background: "var(--gold-400)",
            color: "var(--ink-950)",
          }}
        >
          {badge}
        </span>
      )}
      {/* Ink-dot indicator below — only active state gets the dot */}
      <span
        className="absolute bottom-0 left-1/2 rounded-full transition-all duration-200"
        style={{
          height: isActive ? 2 : 2,
          width: isActive ? 16 : hovered ? 8 : 0,
          background: isActive ? "var(--ink-400)" : "var(--ink-300)",
          opacity: isActive ? 1 : hovered ? 0.6 : 0,
          transform: "translateX(-50%)",
        }}
      />
    </Wrapper>
  )
}
