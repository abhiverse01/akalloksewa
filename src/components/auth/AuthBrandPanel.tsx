'use client'

import Image from "next/image"

const QUOTES = [
  'सफलता एक यात्रा हो, गन्तव्य होइन। हरेक प्रश्न एक कदम अगाडि।',
  'The civil service is not a privilege — it is a responsibility. Prepare accordingly.',
  'तपाईंको परिश्रम र लगनले लोकसेवाको ढोका खोल्छ।',
  'Consistency beats intensity. Thirty minutes daily beats ten hours on weekends.',
  'जो मेहनत गर्छ, उसले नै सफलता पाउँछ।',
]

const STATS = [
  { value: '75K+', label: 'Questions' },
  { value: '50K+', label: 'Aspirants' },
  { value: '17', label: 'Subjects' },
]

function getDailyQuoteIndex(): number {
  return Math.floor(Date.now() / 86400000) % 5
}

export function AuthBrandPanel() {
  const quoteIndex = getDailyQuoteIndex()

  return (
    <div
      className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
      style={{ background: 'var(--ink-900, #0d1030)' }}
    >
      {/* Grain overlay */}
      <div className="grain" />

      {/* Glass overlay tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(13, 16, 48, 0.25)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* ── Background SVG layer ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 600 800"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        {/* Concentric quarter-circle arcs from bottom-left */}
        <g stroke="var(--ink-800, #121640)" strokeWidth="1" fill="none">
          <path d="M0,800 A120,120 0 0,1 120,680" />
          <path d="M0,800 A200,200 0 0,1 200,600" />
          <path d="M0,800 A280,280 0 0,1 280,520" />
          <path d="M0,800 A360,360 0 0,1 360,440" />
          <path d="M0,800 A440,440 0 0,1 440,360" />
          <path d="M0,800 A520,520 0 0,1 520,280" />
          <path d="M0,800 A600,600 0 0,1 600,200" />
          <path d="M0,800 A680,680 0 0,1 680,120" />
          <path d="M0,800 A760,760 0 0,1 760,40" />
        </g>

        {/* Decorative Devanagari glyphs at 5% opacity */}
        <text x="480" y="160" fontSize="28" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">क</text>
        <text x="120" y="280" fontSize="22" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">ख</text>
        <text x="380" y="420" fontSize="32" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">ग</text>
        <text x="80" y="540" fontSize="24" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">क</text>
        <text x="320" y="640" fontSize="20" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">ख</text>
        <text x="540" y="720" fontSize="26" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">ग</text>
        <text x="200" y="100" fontSize="18" fill="var(--ink-700, #18204f)" opacity="0.05" fontFamily="system-ui">क</text>
      </svg>

      {/* ── Foreground content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-8">
        <div className="flex flex-col items-center justify-center gap-12 max-w-sm w-full">
          {/* ── Logo + Wordmark — just "akalloksewa" text ── */}
          <div className="flex flex-col items-center gap-3">
            <Image src="/logo.png" alt="AkalLoksewa" width={48} height={48} className="rounded-xl" />
            <div
              className="text-2xl font-semibold"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                color: 'var(--ink-200, #8fa4ef)',
              }}
            >
              akalloksewa
            </div>
          </div>

          {/* ── Quote block ── */}
          <div className="w-full">
            <blockquote
              className="pl-5"
              style={{
                borderLeft: '2px solid var(--gold-400, #e8a813)',
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: 'var(--ink-200, #8fa4ef)',
                  fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                }}
              >
                {QUOTES[quoteIndex]}
              </p>
            </blockquote>
            <p
              className="mt-3 pl-5 text-xs"
              style={{
                color: 'var(--ink-400, #3358c4)',
              }}
            >
              — PSC Nepal Aspirant
            </p>
          </div>

          {/* ── Stat trio ── */}
          <div className="flex items-center w-full justify-center">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="flex items-center">
                <div className="flex flex-col items-center px-4 sm:px-6">
                  <span
                    className="text-lg font-semibold"
                    style={{
                      fontFamily: 'var(--font-fraunces), Georgia, serif',
                      color: 'var(--ink-200, #8fa4ef)',
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-xs mt-0.5"
                    style={{
                      color: 'var(--ink-400, #3358c4)',
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
                {idx < STATS.length - 1 && (
                  <div className="hairline-v h-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
