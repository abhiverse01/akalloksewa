"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles } from "lucide-react"
import Link from "next/link"

const PLANS = [
  {
    name: "Free",
    description: "Get started with your Loksewa preparation",
    price: "Rs 0",
    period: "forever",
    highlight: false,
    features: [
      { text: "Unlimited practice questions", included: true },
      { text: "Basic performance analytics", included: true },
      { text: "All 17 subjects", included: true },
      { text: "Timed practice sessions", included: true },
      { text: "Study notes", included: true },
      { text: "AI-powered insights", included: false },
      { text: "Advanced analytics & reports", included: false },
      { text: "Priority support", included: false },
    ],
    cta: { label: "Start Free", href: "/auth/register" },
  },
  {
    name: "Premium",
    description: "For serious aspirants aiming for top positions",
    price: "Coming",
    period: "Soon",
    highlight: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "AI-powered study insights", included: true },
      { text: "Advanced analytics & reports", included: true },
      { text: "Priority support", included: true },
      { text: "Full mock test simulations", included: true },
      { text: "Question bank downloads", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Personal study plan", included: true },
    ],
    cta: { label: "Get Early Access", href: "/auth/register" },
  },
]

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-12 sm:py-16 lg:py-28"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-10 sm:mb-14"
        >
          <span className="t-heading-sm" style={{ color: "var(--text-faint)" }}>
            PRICING
          </span>
          <h2 className="t-display-lg mt-3 mb-3" style={{ color: "var(--text-primary)" }}>
            Simple, transparent.
          </h2>
          <p className="t-body-lg" style={{ color: "var(--text-secondary)" }}>
            Start free. Upgrade when you need more.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative"
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, var(--ink-900), var(--ink-800))"
                  : "var(--bg-surface)",
                border: plan.highlight
                  ? "1px solid var(--ink-400)"
                  : "1px solid var(--border-subtle)",
                borderRadius: 22,
                padding: 24,
              }}
            >
              {plan.highlight && (
                <motion.span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1"
                  style={{ background: "var(--ink-500)" }}
                  animate={{ boxShadow: ["0 0 0 rgba(37,64,160,0)", "0 0 12px rgba(37,64,160,0.4)", "0 0 0 rgba(37,64,160,0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="size-3" />
                  Coming Soon
                </motion.span>
              )}

              <div className="mb-1 t-heading-md" style={{ color: plan.highlight ? "white" : "var(--text-primary)" }}>
                {plan.name}
              </div>
              <p className="t-body-sm mb-5" style={{ color: plan.highlight ? "var(--ink-300)" : "var(--text-tertiary)" }}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span
                  className="t-display-lg font-semibold"
                  style={{
                    color: plan.highlight ? "white" : "var(--text-primary)",
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period !== "Soon" && (
                  <span className="t-body-sm ml-1" style={{ color: plan.highlight ? "var(--ink-300)" : "var(--text-tertiary)" }}>
                    /{plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check
                        className="size-4 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlight ? "var(--ink-300)" : "var(--ink-500)" }}
                      />
                    ) : (
                      <X
                        className="size-4 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlight ? "var(--ink-500)" : "var(--text-faint)" }}
                      />
                    )}
                    <span
                      className="t-body-sm"
                      style={{
                        color: f.included
                          ? plan.highlight ? "var(--ink-200)" : "var(--text-secondary)"
                          : plan.highlight ? "var(--ink-500)" : "var(--text-faint)",
                      }}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full h-11 text-[14px] font-semibold btn-press rounded-[16px] transition-all duration-300"
                  style={
                    plan.highlight
                      ? { background: "var(--gold-400)", color: "var(--ink-950)" }
                      : { background: "var(--bg-raised)", color: "var(--text-primary)" }
                  }
                  asChild
                >
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
