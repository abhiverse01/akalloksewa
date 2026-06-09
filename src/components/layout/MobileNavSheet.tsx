"use client"

import * as React from "react"
import Link from "next/link"
import { AuthGuardedLink } from "@/components/shared/AuthGuardedLink"
import Image from "next/image"
import { Menu, Home, Zap, CreditCard, Users, FileText, MessageSquare, BookOpen } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { usePathname } from "next/navigation"

const MOBILE_LINKS = [
  { label: "Home", href: "/", icon: <Home className="size-4" /> },
  { label: "Features", href: "/features", icon: <Zap className="size-4" />, badge: "NEW" },
  { label: "Pricing", href: "/pricing", icon: <CreditCard className="size-4" /> },
  { label: "Subjects", href: "/syllabus", icon: <BookOpen className="size-4" /> },
  { label: "About", href: "/about", icon: <Users className="size-4" /> },
  { label: "Blog", href: "/blog", icon: <FileText className="size-4" /> },
  { label: "Contact", href: "/contact", icon: <MessageSquare className="size-4" /> },
]

export function MobileNavSheet() {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="md:hidden flex items-center justify-center size-11 rounded-lg"
        style={{ color: "var(--text-primary)" }}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="md:hidden flex items-center justify-center size-11 rounded-lg"
          style={{ color: "var(--text-primary)" }}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle
            className="flex items-center gap-2 text-[20px] font-semibold tracking-tight"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-fraunces), Georgia, serif",
            }}
          >
            <Image src="/logo.png" alt="AkalLoksewa" width={28} height={28} className="rounded-md" />
            <span>akalloksewa</span>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation links with icons */}
        <div className="flex flex-col px-4 pt-4">
          <p
            className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: "var(--text-faint)" }}
          >
            Navigation
          </p>
          {MOBILE_LINKS.map((link, idx) => {
            const LinkComponent = link.label === "Subjects" ? AuthGuardedLink : Link
            return (
            <SheetClose key={link.label} asChild>
              <LinkComponent
                href={link.href}
                className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-[14px] font-medium rounded-lg transition-colors duration-150 animate-slide-in-r"
                style={{
                  color: "var(--text-primary)",
                  background: (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)) ? 'var(--ink-800)' : 'transparent',
                  borderRadius: '8px',
                  animationDelay: `${idx * 0.04}s`,
                }}
              >
                <span style={{ color: "var(--ink-400)" }}>{link.icon}</span>
                {link.label}
                {link.badge && (
                  <span
                    className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: "var(--gold-400)",
                      color: "var(--ink-950)",
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </LinkComponent>
            </SheetClose>
            )
          })}
        </div>

        <div className="hairline mx-4 my-4" />

        {/* Mobile CTA buttons */}
        <div className="flex flex-col gap-3 px-4 pt-2">
          <SheetClose asChild>
            <Link
              href="/auth/login"
              className="flex items-center justify-center w-full h-10 rounded-lg border font-medium text-sm transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            >
              Log in
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/auth/register"
              className="flex items-center justify-center w-full h-10 rounded-lg text-white font-medium text-sm transition-all hover:brightness-110"
              style={{ background: 'var(--ink-500)' }}
            >
              Start Free
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
