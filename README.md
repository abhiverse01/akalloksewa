<div align="center">

![AkalLoksewa](public/logo512.png)

# AkalLoksewa

**Nepal's Most Powerful Loksewa (Civil Service) Exam Preparation Platform**

A mobile-first, offline-capable web application designed for Nepali civil service aspirants preparing for Public Service Commission (PSC) examinations.

<p>
  <img src="https://img.shields.io/badge/Next.js-16.1.3-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=black" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Zustand-5-orange?logo=data:image/svg+xml;base64," alt="Zustand" />
  <img src="https://img.shields.io/badge/IndexedDB-idb-4CAF50?logo=data:image/svg+xml;base64," alt="IndexedDB" />
  <img src="https://img.shields.io/badge/PWA-Installable-6C63FF?logo=data:image/svg+xml;base64," alt="PWA" />
  <img src="https://img.shields.io/badge/Recharts-2-8884d8?logo=data:image/svg+xml;base64," alt="Recharts" />
</p>

<p>
  <img src="https://img.shields.io/badge/App_Router-Next.js_16-black" alt="App Router" />
  <img src="https://img.shields.io/badge/Radix_UI-shadcn%2Fui-6E56CF?logo=data:image/svg+xml;base64," alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Lucide_Icons-0.525-FF6B35?logo=data:image/svg+xml;base64," alt="Lucide" />
  <img src="https://img.shields.io/badge/Offline_First-100%25-10B981" alt="Offline First" />
</p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [Route Groups](#route-groups)
  - [Design Tokens](#design-tokens)
  - [Layout System](#layout-system)
  - [Offline & IndexedDB Architecture](#offline--indexeddb-architecture)
- [Feature Deep-Dives](#feature-deep-dives)
  - [Question Bank & Practice Engine](#question-bank--practice-engine)
  - [Mock Test System](#mock-test-system)
  - [Daily Challenge](#daily-challenge)
  - [Study Plan Generator](#study-plan-generator)
  - [Analytics Dashboard](#analytics-dashboard)
  - [Notes Editor](#notes-editor)
  - [Achievement System](#achievement-system)
  - [Streak Tracking](#streak-tracking)
  - [Environmental Design](#environmental-design)
  - [PWA Support](#pwa-support)
  - [Keyboard Shortcuts & Command Palette](#keyboard-shortcuts--command-palette)
- [Touch & Gesture System](#touch--gesture-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Environment](#environment)
- [Exam Coverage](#exam-coverage)
- [Project Statistics](#project-statistics)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

AkalLoksewa is a comprehensive, production-ready Loksewa exam preparation platform built with Next.js 16. It provides aspirants with structured practice sessions, timed mock tests, detailed analytics, personalized study plans, and a distraction-free study environment — **all working fully offline** via IndexedDB persistence.

The platform targets **Nepali civil service (Lok Sewa Aayog) examinations** at three levels — **Kharidar**, **Nayab Subba**, and **Section Officer** — covering 18 subjects from the official PSC syllabus.

> **"Akha Loksewa"** — आफ्नो लक्ष्यतिर 🎯

---

## Key Features

| Feature | Description |
|---------|-------------|
| 📝 **Question Bank** | Practice mode with swipe navigation and 5-state option machine |
| ⏱️ **Mock Tests** | Timed tests with pause/resume, crash recovery, and integrity checks |
| 🎯 **Daily Challenge** | Seeded PRNG with weighted subject selection for daily practice |
| 📅 **Study Plan** | Personalized generator based on exam date, study hours, and weak areas |
| 📊 **Analytics Dashboard** | Heatmap, radar chart, score trends, and weak-area identification |
| 📒 **Notes Editor** | Rich text editor with formatting toolbar and subject tagging |
| 🔖 **Bookmarks** | Long-press context menu to save questions for later review |
| 📱 **Mobile-First** | BottomNav, MobileTopBar, split practice layout, pull-to-refresh |
| 📡 **Offline-First** | Full IndexedDB persistence with offline indicator |
| 📲 **PWA** | Installable with manifest, beforeinstallprompt, and service worker |
| 🎨 **Environmental Design** | Grid texture, ambient glow, subject coloring, Lock In mode |
| 🏆 **Achievements** | Milestone toasts for streaks, accuracy, question counts |
| 🔥 **Streak Tracking** | Daily streak with motivational micro-copy |
| ⏳ **Session Timer** | Persistent cross-page study time tracker |
| ⌨️ **Keyboard Shortcuts** | ⌘K / Ctrl+K command palette for quick navigation |
| 🌙 **Dark Theme** | Custom ink/gold/crimson design tokens |
| 🔍 **SEO** | Optimized marketing pages with meta tags and Open Graph |
| 👨‍💼 **Admin Ingestor** | Bulk question management and seeding tool |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router, Turbopack) | 16.1.3 |
| **Language** | TypeScript | 5 |
| **UI Components** | Radix UI + shadcn/ui | Latest |
| **Styling** | Tailwind CSS 4 with custom design tokens | 4 |
| **Animation** | Framer Motion | 12 |
| **State Management** | Zustand | 5 |
| **Client Database** | IndexedDB (via `idb` library, schema versioning) | 8 |
| **Charts** | Recharts | 2 |
| **Icons** | Lucide React | 0.525 |
| **Forms** | React Hook Form + Zod | 7 / 4 |
| **PWA** | Next.js native manifest + beforeinstallprompt | — |
| **Theming** | next-themes (dark mode) | 0.4 |
| **Drag & Drop** | dnd-kit | 6 |
| **Markdown** | react-markdown + react-syntax-highlighter | — |
| **Date Utilities** | date-fns | 4 |
| **ID Generation** | nanoid | 5 |

---

## Architecture

### Route Groups

The application uses Next.js App Router route groups to organize pages by concern:

```
src/app/
├── (app)/                    # Authenticated app shell
│   ├── dashboard/            # Personalized bento-grid dashboard
│   ├── practice/             # Practice catalog + [setId] session
│   ├── test/                 # Mock test catalog + session
│   ├── analytics/            # KPIs, heatmap, radar, trends
│   ├── bookmarks/            # Saved questions
│   ├── notes/                # Rich text note editor
│   ├── profile/              # User profile (4 tabs)
│   ├── settings/             # App settings (8 sections)
│   ├── study-plan/           # Personalized study schedule
│   ├── syllabus/             # PSC syllabus browser
│   └── leaderboard/           # Personal benchmarking
│
├── (marketing)/              # Public pages
│   ├── page.tsx              # Landing page
│   ├── features/             # Feature showcase
│   ├── pricing/              # Pricing page
│   ├── blog/                 # Blog
│   ├── about/                # About page
│   └── contact/              # Contact page
│
├── auth/                     # Login & Register
├── onboarding/               # Multi-step new user onboarding flow
└── ingestor/                 # Admin question ingestion tool
```

### Design Tokens

AkalLoksewa uses a **custom token-based design system** built on Tailwind CSS custom properties. The dark theme features an ink/gold/crimson palette:

| Token Family | Purpose | Example |
|-------------|---------|---------|
| `ink-*` | Primary brand palette (blue-indigo spectrum) | `ink-400` → `#3358c4` |
| `gold-*` | Accent and achievement highlights | `gold-400` → `#e8a813` |
| `crimson-*` | Error and destructive states | `crimson-400` → `#e03030` |
| `slate-*` | Muted UI surfaces | `slate-400` → `#64748b` |
| `green-*` | Success states | `green-400` → `#10a368` |
| `amber-*` | Warning and offline states | `amber-400` → `#fbbf24` |

Typography uses **Fraunces** (display serif for headings and motivational micro-copy) and **DM Sans** (UI sans-serif for body text), with **DM Mono** for code and data.

### Layout System

The platform is designed **mobile-first** with two distinct layout modes:

**Mobile (< 1024px / `lg` breakpoint):**
- `MobileTopBar` (56px) — context-aware header with 5 variants (default, practice, test, ingestor, profile)
- `BottomNav` (64px) — 5 navigation items with an elevated center Test button in gold
- Safe area insets for iPhone notch and home indicator
- Split practice layout (question + options side-by-side on larger phones)

**Desktop (>= 1024px / `lg` breakpoint):**
- Collapsible `Sidebar` (240px / 64px) with navigation groups, exam countdown, streak widget, focus mode toggle, session timer, and user menu
- `AppHeader` with breadcrumbs, search (⌘K), and streak display

Both layouts share a **grid-textured background** with an ambient radial gradient glow, creating a professional study environment.

### Offline & IndexedDB Architecture

All user data is stored in **IndexedDB** via the `idb` library with full schema versioning. The database schema (`AkalDB`) contains 11 object stores:

| Store | Purpose |
|-------|---------|
| `questions` | Question bank with subject, difficulty, year indexes |
| `testSessions` | Test session state, answers, scores, crash recovery |
| `notes` | Rich text notes with subject tagging and auto-save |
| `bookmarks` | Saved question references with subject filters |
| `analyticsEvents` | Practice, test, streak events for analytics |
| `userProfile` | Extended user profile data |
| `users` | User accounts with indexed email/username |
| `sessions` | Auth session tokens with expiry |
| `dailyChallenges` | Daily challenge state and scores |
| `achievements` | Triggered achievement records (prevents re-trigger) |
| `ingestBatches` | Question ingestion batch state |

---

## Feature Deep-Dives

### Question Bank & Practice Engine

The practice interface is the heart of the platform:

- **Free Practice** — Answer questions from any subject with instant feedback
- **Subject Drill** — Focused practice on a single subject
- **5-State Option Machine** — idle → selected-pending → correct/incorrect → revealed-correct, with pulse and shake animations
- **Swipe Navigation** — Pointer-event based (touch, mouse, stylus) with Framer Motion drag physics
- **Devanagari Labels** — Option labels toggle between A/B/C/D and क/ख/ग/घ
- **Explanation Bottom Sheet** — Mobile-first draggable sheet with correct/incorrect result, explanation text, bookmark and flag actions

### Mock Test System

- **Timed Mock Tests** — Full exam simulation with configurable duration
- **Pause/Resume** — Manual pause via top bar or automatic pause on tab switch (`visibilitychange` event)
- **Crash Recovery** — Full test state persisted to IndexedDB; resumes after browser crash or tab close
- **Question Navigator** — Grid view showing answered, unanswered, and marked-for-review questions
- **Score Calculation** — Percentage, correct/total, time taken
- **Test Integrity** — Auto-pause when switching tabs prevents cheating patterns

### Daily Challenge

- **Seeded PRNG** — Uses mulberry32 algorithm seeded by today's date, ensuring every user gets the same daily questions
- **Weighted Subject Selection** — Algorithm prioritizes the user's weakest subjects for targeted improvement
- **10 Questions Daily** — Consistent daily practice commitment
- **Score Tracking** — Historical daily challenge scores stored in IndexedDB

### Study Plan Generator

- **Personalized Schedule** — Weekly plan generated based on days to exam, available study hours, and subject proficiency
- **Subject Weight Balancing** — Weaker subjects get more allocated time
- **Timeline View** — Visual representation of the study schedule
- **7-Day Plan** — Detailed daily breakdown with topics and estimated time
- **Subject Coverage Tracker** — Tracks which subjects have been covered

### Analytics Dashboard

- **KPI Cards** — Questions practiced, tests completed, average score, current streak
- **Activity Heatmap** — GitHub-style contribution grid showing daily practice activity (last 16 weeks on mobile, 52 on desktop)
- **Score Trend Chart** — Line chart showing score progression across tests
- **Subject Radar Chart** — Multi-axis radar chart comparing accuracy across all subjects
- **Weak Areas** — Identifies lowest-accuracy subjects with targeted practice links

### Notes Editor

- **Rich Toolbar** — Formatting options with contentEditable
- **Subject Tagging** — Organize notes by subject
- **Auto-Save** — Debounced auto-save to IndexedDB
- **Two-Panel Desktop Layout** — Note list + editor side-by-side on larger screens

### Achievement System

Milestones are tracked, celebrated, and persisted to prevent re-triggering:

| Achievement | Trigger | Message |
|-----------|---------|---------|
| First Question | `totalQuestionsAttempted === 1` | "First question answered!" |
| Ten Questions | `totalQuestionsAttempted === 10` | "10 questions in!" |
| First Test | `totalTests === 1` | "First test complete!" |
| 3-Day Streak | `currentStreak === 3` | "3-day streak" |
| 7-Day Streak | `currentStreak === 7` | "One week strong!" |
| 30-Day Streak | `currentStreak === 30` | "One month of dedication." |
| 80% Accuracy | `overallAccuracy >= 80%` | "80% accuracy reached." |
| 100 Questions | `totalQuestionsAttempted === 100` | "100 questions practiced." |
| Subject Master | `anySubjectAccuracy >= 90%` | "Subject mastered: [subject]" |

Achievements trigger special **Trophy toasts** with gold styling and are persisted to IndexedDB.

### Streak Tracking

- **Daily Streak Counter** — Tracks consecutive days of practice
- **Motivational Micro-Copy** — Context-aware messages:
  - *"Still at it"* — practicing at midnight
  - *"Weekly Warrior"* — 7-day streak
  - *"One month of dedication"* — 30-day streak
- **Streak Widget** — Visible in sidebar and dashboard
- **Streak Safety Net** — Grace period logic for missed days

### Environmental Design

The platform creates a dedicated "preparation environment" rather than a generic web app:

- **Grid Texture Background** — Subtle repeating SVG grid pattern (32px × 32px, 2.5% opacity)
- **Ambient Glow** — Radial gradient in upper-left (ink-blue, 6% opacity) that subtly shifts color based on the current subject being practiced
- **Subject Coloring** — Each subject has a unique color identity throughout the UI
- **Lock In Mode** — Dedicated study sessions that change the browser tab title, add session timer, and detect idle time
- **Session Timer** — Persistent timer across page navigation (stored in sessionStorage) showing total study time
- **Focus Mode** — Toggle that hides BottomNav and auto-collapses sidebar for distraction-free study

### PWA Support

- **Installable** — PWA manifest with standalone display mode, portrait orientation
- **Offline-First** — All data in IndexedDB, no server dependency for core functionality
- **Install Prompt** — Custom "Add to Home Screen" card shown after 3+ practice sessions using `beforeinstallprompt` event
- **Offline Indicator** — Amber bar appears when connection is lost, green bar on reconnection

### Keyboard Shortcuts & Command Palette

- **⌘K / Ctrl+K** — Opens the command palette for quick navigation
- **Rapid Navigation** — Jump to any page, subject, or action from the keyboard
- **Accessibility** — All interactive elements are keyboard-navigable with proper ARIA support

---

## Touch & Gesture System

Built for one-thumb mobile operation:

- **Swipe Navigation** — Pointer-event based (works on touch, mouse, stylus). Swipe left/right to navigate questions with Framer Motion drag physics (spring: stiffness 400, damping 30)
- **Pull-to-Refresh** — 70px threshold with damped visual indicator, haptic feedback at threshold, arc spinner during refresh
- **Long Press** — 500ms detection with 8px move cancellation threshold, haptic feedback, context menu popup for bookmarks
- **Touch Targets** — All interactive elements minimum 44 × 44px

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useSwipeGesture` | Pointer-event based swipe detection with drag physics |
| `usePullToRefresh` | Pull-to-refresh with threshold, feedback, and callback |
| `useLongPress` | Long press detection with cancellation threshold |
| `useScrollRestoration` | Restore scroll position on back navigation |
| `useDB` | IndexedDB database client access |
| `useSessionTimer` | Cross-page session timer management |
| `useMobile` | Responsive breakpoint detection |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (app)/                  # Authenticated app pages
│   │   ├── dashboard/          # Personalized bento-grid dashboard
│   │   ├── practice/           # Practice catalog + session
│   │   ├── test/               # Mock test catalog + session
│   │   ├── analytics/          # KPIs, heatmap, radar, trends
│   │   ├── bookmarks/          # Saved questions
│   │   ├── notes/              # Rich text note editor
│   │   ├── profile/            # User profile (4 tabs)
│   │   ├── settings/           # App settings (8 sections)
│   │   ├── study-plan/         # AI-generated study schedule
│   │   ├── syllabus/           # PSC syllabus browser
│   │   └── leaderboard/        # Personal benchmarking
│   ├── (marketing)/           # Public landing and SEO pages
│   ├── auth/                  # Login & Register
│   ├── onboarding/            # Multi-step onboarding flow
│   └── ingestor/              # Admin question ingestion
│
├── components/
│   ├── layout/                # AppHeader, Sidebar, BottomNav, MobileTopBar, Footer
│   ├── practice/              # QuestionCard, OptionButton, ExplanationSheet
│   ├── dashboard/             # GreetingCard, StreakCard, ScoreTrendCard, etc.
│   ├── analytics/             # PerformanceChart, StreakCalendar, SubjectRadar, WeakAreaList
│   ├── shared/                # AchievementToast, OfflineIndicator, InstallPrompt, DualLogoLoader
│   ├── ui/                    # shadcn/ui primitives (accordion, dialog, sheet, etc.)
│   ├── auth/                  # AuthGuard, AuthBrandPanel, AuthLoadingScreen
│   ├── user/                  # UserAvatar
│   ├── marketing/             # HeroSection, FeatureGrid, PricingSection
│   └── ingestor/              # TextIngestor, BulkReviewTable, QuestionPreview
│
├── contexts/                   # React Contexts
│   ├── UserContext.tsx         # Computed user data provider
│   └── SessionTimerContext.tsx  # Persistent session timer
│
├── stores/                     # Zustand stores
│   ├── authStore.ts            # Authentication state
│   ├── layoutStore.ts          # Layout preferences
│   ├── testStore.ts            # Test session state
│   └── ingestorStore.ts        # Admin ingestor state
│
├── hooks/                      # Custom React hooks
│   ├── useSwipeGesture.ts
│   ├── usePullToRefresh.ts
│   ├── useLongPress.ts
│   ├── useScrollRestoration.ts
│   ├── useSessionTimer.ts
│   ├── useDB.ts
│   ├── use-mobile.ts
│   └── useTheme.ts
│
├── lib/                        # Utilities and core logic
│   ├── auth.ts                 # Authentication service
│   ├── db.ts                   # IndexedDB schema & client
│   ├── constants.ts            # App-wide constants
│   ├── utils.ts                # Utility functions
│   ├── challenges.ts           # Daily challenge PRNG logic
│   └── study-plan.ts           # Study plan generation
│
└── types/                      # TypeScript interfaces
    ├── auth.ts
    ├── questions.ts
    ├── tests.ts
    ├── analytics.ts
    └── ...
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **npm** or **bun** package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd akalloksewa

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development

```bash
# Development server (Turbopack)
npm run dev

# Lint code
npm run lint

# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### Environment

> **No external API keys needed.** All data is stored locally in IndexedDB. The application runs entirely in the browser with no external API dependencies.

Admin users can seed questions via the **built-in ingestor tool** at `/ingestor`.

---

## Exam Coverage

AkalLoksewa covers the official **Public Service Commission (Lok Sewa Aayog)** syllabus:

**Exam Levels:**

| Level | Nepali | English |
|-------|--------|---------|
| Kharidar | खरदार | Non-Gazetted Officer |
| Nayab Subba | नायब सुब्बा | Non-Gazetted Officer |
| Section Officer | सेक्सन अफिसर | Gazetted Officer (3rd Class) |

**18 Subjects Covered:**

Nepali · English · General Knowledge · Constitution · Political Science · Economics · Geography · History · Mathematics · Logic & Reasoning · Administration · Law · Human Rights · Current Affairs · Science & Technology · Computer · Sociology · International Relations

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Source Files | 206+ (TSX + TS + CSS) |
| Lines of Code | ~34,000 |
| React Components | 85+ |
| App Pages | 31 |
| Custom Hooks | 8 |
| Zustand Stores | 4 |
| React Contexts | 2 |
| IndexedDB Object Stores | 11 |
| Loksewa Subjects Covered | 18 |
| Design Token Colors | 40+ |

---

## Roadmap

- [ ] **Phase 2 Auth** — Supabase integration replacing local authentication
- [ ] **Server-Side Question Bank** — Cloud-hosted questions with sync
- [ ] **Multiplayer Leaderboard** — Real anonymous rankings
- [ ] **AI-Powered Explanations** — LLM-generated question explanations
- [ ] **Push Notifications** — Study reminders and streak alerts
- [ ] **Community Features** — Discussion forums for tricky questions
- [ ] **Offline Question Packs** — Downloadable subject-specific question bundles
- [ ] **Exam Simulation Mode** — Full-length timed exam matching real PSC format

---

## License

Private project. All rights reserved.

---

<div align="center">

Built with dedication for Nepal's civil service aspirants.

**Akha Loksewa** — आफ्नो लक्ष्यतिर 🎯

</div>
