<p align="center">
  <img src="download/akalloksewa-logo.png" alt="AkalLoksewa" width="280" />
</p>

<h1 align="center">AkalLoksewa</h1>

<p align="center">
  <strong>Nepal's Most Powerful Loksewa (Civil Service) Preparation Platform</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://ui.shadcn.com/" target="_blank"><img src="https://img.shields.io/badge/shadcn%2Fui-New_York-18181B?style=flat-square&logo=shadcn%2Fui&logoColor=white" alt="shadcn/ui" /></a>
  <a href="https://zustand-demo.pmnd.rs/" target="_blank"><img src="https://img.shields.io/badge/Zustand-State_Mgmt-764ABC?style=flat-square" alt="Zustand" /></a>
  <br />
  <a href="https://www.framer.com/motion/" target="_blank"><img src="https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  <a href="https://recharts.org/" target="_blank"><img src="https://img.shields.io/badge/Recharts-Charts-FF6384?style=flat-square&logo=recharts&logoColor=white" alt="Recharts" /></a>
  <a href="https://indexeddb.org/" target="_blank"><img src="https://img.shields.io/badge/IndexedDB-Database-4A90D9?style=flat-square" alt="IndexedDB" /></a>
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
</p>

---

## Overview

**AkalLoksewa** is a comprehensive, mobile-first web application built with Next.js 16 for Nepali civil service exam (Loksewa / लोकसेवा) aspirants. It provides **75,000+ practice questions** across **17 subjects**, mock tests, analytics, study planning, and a personalized preparation environment — all running locally via IndexedDB (Phase 1) with planned Supabase migration (Phase 2).

---

## Features

### Practice Engine

- Free practice by subject with difficulty filtering
- Curated question sets (PSC past papers, subject drills)
- 4-option MCQ with instant feedback and explanations
- Keyboard shortcuts (`1-4`, arrows, vim keys)
- Bookmark questions for later review
- Auto-resume from last practice session

### Mock Test System

- Timed test simulations with configurable duration
- Question navigator grid with color-coded status
- Score calculation with optional negative marking
- Detailed test results with answer review

### Dashboard (Bento Grid)

- Time-based greeting with user name
- Exam countdown timer (Nepali date support)
- Streak tracking with 7-day visual calendar
- Quick practice actions & subject radar chart
- Score trend visualization & weak areas identification
- Recent tests table & leaderboard position

### Analytics

- Activity heatmap (52-week GitHub-style)
- Subject breakdown with accuracy bars
- Performance trend lines (score + accuracy over time)
- Weak topics identification
- Date range filtering (7d / 30d / 90d / all)

### Study Tools

- **Notes Editor** — Rich text formatting (Bold, Italic, Headings, Lists, Code, Blockquote)
- Subject-linked notes with search and filtering
- Pin/unpin important notes with auto-save debouncing

### Bookmarks

- Bookmark any question during practice
- Filter by subject and difficulty, grouped view
- Practice bookmarked questions directly

### Syllabus Tracking

- Exam-level filtering (Kharidar, Nayab Subba, Section Officer)
- Chapter-level progress tracking with topic-level question counts
- Mark chapters as reviewed

### Study Plan

- Personalized preparation schedule with weekly timeline view
- 7-day planning grid
- Subject coverage tracker with on-track / behind status
- Weighted question distribution by weakness

### Daily Challenge

- 10-question daily set generated deterministically
- Seeded PRNG for consistent daily questions
- Weighted toward weak subjects with balanced difficulty
- Streak integration (double credit)

### Mobile Experience

- Bottom navigation with 5 items + elevated center test button
- Context-aware mobile top bar (5 variants)
- Glass-morphism navigation bars with backdrop blur
- Safe area support (iPhone notch / home indicator)
- Touch-optimized: 44×44px minimum targets
- Swipe gestures, pull-to-refresh, long-press context menus
- Explanation bottom sheet on mobile

### Environmental Design

- Subtle grid texture background & ambient glow lighting
- Sidebar glow accent with session timer persistence
- Focus Mode toggle
- Achievement / milestone celebration toasts

### Achievement System

- 12 milestones (first question, streaks, accuracy, test counts)
- Persistent tracking via IndexedDB
- Gold-accented toast notifications with Trophy icon

### Authentication

- Email + password registration with validation
- Username availability check (debounced) & password strength meter
- Login with email or username
- "Remember me" session persistence with 30-day session tokens
- Phase 2 migration path to Supabase Auth

### Content Management (Admin)

- Text-based question ingestor with file upload & parsing
- Bulk review table with question preview and editing
- Status management (pending → approved / rejected)

### Onboarding

- 4-step post-registration wizard
- Exam target, study schedule, province, & preference setup
- Confetti celebration on completion

### PWA Support

- Web App Manifest for installability
- Apple mobile web app meta tags
- Offline-capable (IndexedDB), portrait orientation optimized

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.1.3 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Custom Design Token System (`ink-*`, `gold-*`, `crimson-*` palettes) |
| **UI Library** | shadcn/ui (New York style) + Radix UI primitives (44 components) |
| **State Management** | Zustand (`authStore`, `layoutStore`, `userStore`, `testStore`, `ingestorStore`) |
| **Database** | IndexedDB via `idb` library (9 object stores, typed schema) |
| **Animations** | Framer Motion (page transitions, stagger animations, gesture feedback) |
| **Fonts** | Fraunces (display/serif), DM Sans (sans), DM Mono (monospace) via Google Fonts |
| **Charts** | Recharts (analytics, radar charts, score trends, heatmaps) |
| **Icons** | Lucide React |
| **Auth** | Local IndexedDB auth (SHA-256 hashing, session tokens, Phase 2 → Supabase) |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Protected app routes
│   │   ├── dashboard/          # Bento grid dashboard
│   │   ├── practice/           # Practice listing + session detail
│   │   ├── test/               # Mock test catalog
│   │   ├── study-plan/         # Personalized study plan
│   │   ├── analytics/          # Progress reports
│   │   ├── notes/              # Notes editor
│   │   ├── bookmarks/          # Saved questions
│   │   ├── syllabus/           # Syllabus tracking
│   │   ├── leaderboard/        # Rankings & benchmarks
│   │   ├── profile/            # Profile settings (4 tabs)
│   │   └── settings/           # App settings
│   ├── (marketing)/           # Public pages (home, features, blog, pricing)
│   ├── auth/                   # Login + Registration
│   ├── ingestor/               # Admin question management
│   └── onboarding/             # Post-registration wizard
├── components/
│   ├── analytics/              # PerformanceChart, StreakCalendar, Radar, WeakAreas
│   ├── auth/                   # AuthGuard, AuthBrandPanel, AuthLoadingScreen
│   ├── dashboard/              # Bento cards (Greeting, Streak, QuickTest, Radar, etc.)
│   ├── ingestor/               # BulkReview, QuestionPreview, TextIngestor, UploadDropzone
│   ├── layout/                 # Sidebar, AppHeader, BottomNav, MobileTopBar, Navbar, Footer
│   ├── legal/                  # Legal page layout
│   ├── marketing/              # Hero, CTA, Features, Pricing, Stats, Testimonials
│   ├── practice/               # QuestionCard, OptionButton, ExplanationSheet
│   ├── shared/                 # EmptyState, ErrorFallback, LoadingSpinner, OfflineIndicator
│   ├── ui/                     # shadcn/ui components (44 components)
│   └── user/                   # UserAvatar
├── contexts/                   # UserContext, SessionTimerContext
├── hooks/                      # useSwipeGesture, usePullToRefresh, useLongPress, useScrollRestoration
├── lib/
│   ├── achievements/           # Achievement system
│   ├── auth/                   # Auth service + defaults
│   ├── challenges/             # Daily challenge generator
│   ├── constants/              # Breakpoints, subjects, etc.
│   ├── db/                     # IndexedDB schema, seed data, CRUD operations
│   └── utils.ts                # Utility functions (cn, etc.)
├── stores/                     # Zustand stores (auth, layout, user, test, ingestor)
└── types/                      # TypeScript type definitions
```

---

## Design System

| Token | Details |
|---|---|
| **Color Tokens** | `ink-950` → `ink-50` (blue spectrum), `gold-600` → `gold-50` (amber/gold), `green` / `red` / `amber` accents |
| **CSS Variables** | `--bg-base`, `--bg-surface`, `--bg-raised`, `--text-primary`, `--text-secondary`, `--border-subtle` |
| **Typography Scale** | `t-display-xl/lg`, `t-heading-xl/lg/md/sm`, `t-body-lg/md/sm`, `t-caption`, `t-mono` |
| **Border Radius** | `xs(4px)`, `sm(6px)`, `DEFAULT(10px)`, `md(14px)`, `lg(20px)`, `pill(999px)` |
| **Animations** | `fadeUp`, `fadeIn`, `pulseSoft`, `shimmer`, `slideInRight`, `accordion-down/up` |
| **Shadows** | `xs` → `xl`, `glow-ink`, `glow-gold` |

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd akalloksewa

# Install dependencies
bun install

# Seed the database with sample questions
bun run seed

# Start the development server
bun run dev
```

### Environment Requirements

- **Node.js** 18+
- **Bun** (recommended) or npm / yarn
- Modern browser with IndexedDB support

---

## Roadmap

- [ ] **Phase 2:** Supabase Auth + PostgreSQL backend
- [ ] **Phase 2:** Real-time leaderboard with server sync
- [ ] **Phase 2:** Cloud question bank sync
- [ ] **Phase 3:** AI-powered question generation
- [ ] **Phase 3:** Adaptive difficulty engine
- [ ] **Phase 3:** Push notifications
- [ ] **Phase 4:** Community features (discussions, doubt resolution)
- [ ] **Phase 4:** Multi-language support (Nepali interface)

---

## Author

**Abhishek Shah** — [Portfolio](https://abhishekshah.vercel.app)

## License

Private — All rights reserved.
