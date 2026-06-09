'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Play, Check } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// ═══════════════════════════════════════════════════════════════════
// MOCK SYLLABUS DATA — Nepal Loksewa Exam
// ═══════════════════════════════════════════════════════════════════

interface Topic {
  name: string
  questions: number
}

interface Chapter {
  name: string
  topics: Topic[]
}

interface SubjectData {
  id: string
  name: string
  nameNe: string
  chapters: Chapter[]
}

const MOCK_SYLLABUS: Record<string, SubjectData[]> = {
  kharidar: [
    {
      id: 'nepali', name: 'Nepali Language', nameNe: 'नेपाली भाषा',
      chapters: [
        { name: 'व्याकरण (Grammar)', topics: [{ name: 'Parts of Speech (शब्द पद)', questions: 12 }, { name: 'Sandhi (सन्धि)', questions: 8 }, { name: 'Samas (समास)', questions: 10 }, { name: 'Chhand (छन्द)', questions: 5 }, { name: 'Alankar (अलंकार)', questions: 6 }] },
        { name: 'साहित्य (Literature)', topics: [{ name: 'Adhikavi Bhanubhakta', questions: 4 }, { name: 'Modern Poets', questions: 6 }, { name: 'Stories & Novels', questions: 5 }] },
        { name: 'निबन्ध (Essay Writing)', topics: [{ name: 'Formal Essay', questions: 3 }, { name: 'Informal Essay', questions: 3 }] },
      ],
    },
    {
      id: 'english', name: 'English Language', nameNe: 'अंग्रेजी भाषा',
      chapters: [
        { name: 'Grammar', topics: [{ name: 'Tenses', questions: 10 }, { name: 'Prepositions', questions: 8 }, { name: 'Active & Passive Voice', questions: 7 }, { name: 'Direct & Indirect Speech', questions: 6 }] },
        { name: 'Vocabulary', topics: [{ name: 'Synonyms & Antonyms', questions: 8 }, { name: 'One Word Substitution', questions: 5 }, { name: 'Idioms & Phrases', questions: 6 }] },
        { name: 'Comprehension', topics: [{ name: 'Passage Reading', questions: 10 }] },
      ],
    },
    {
      id: 'general-knowledge', name: 'General Knowledge', nameNe: 'सामान्य ज्ञान',
      chapters: [
        { name: 'Nepal GK', topics: [{ name: 'Geography of Nepal', questions: 15 }, { name: 'History of Nepal', questions: 12 }, { name: 'Culture & Heritage', questions: 8 }, { name: 'Famous Personalities', questions: 6 }] },
        { name: 'World GK', topics: [{ name: 'World Geography', questions: 8 }, { name: 'World Organizations', questions: 6 }, { name: 'Important Events', questions: 5 }] },
        { name: 'Sports & Awards', topics: [{ name: 'Olympics', questions: 4 }, { name: 'Cricket & Football', questions: 5 }, { name: 'Nobel Prizes', questions: 3 }] },
      ],
    },
    {
      id: 'constitution', name: 'Constitution of Nepal', nameNe: 'नेपालको संविधान',
      chapters: [
        { name: 'प्रस्तावना तथा मौलिक हक (Preamble & Fundamental Rights)', topics: [{ name: 'Preamble', questions: 3 }, { name: 'Fundamental Rights', questions: 10 }, { name: 'Directive Principles', questions: 6 }] },
        { name: 'संसदीय व्यवस्था (Parliament)', topics: [{ name: 'House of Representatives', questions: 6 }, { name: 'National Assembly', questions: 4 }, { name: 'Legislative Process', questions: 5 }] },
        { name: 'कार्यपालिका (Executive)', topics: [{ name: 'President', questions: 4 }, { name: 'Prime Minister & Council', questions: 6 }, { name: 'Federal Structure', questions: 8 }] },
        { name: 'न्यायपालिका (Judiciary)', topics: [{ name: 'Supreme Court', questions: 5 }, { name: 'High Courts', questions: 4 }, { name: 'Judicial Council', questions: 3 }] },
        { name: 'लोकसेवा आयोग (Public Service Commission)', topics: [{ name: 'PSC Structure', questions: 5 }, { name: 'Examination Process', questions: 4 }] },
      ],
    },
    {
      id: 'governance', name: 'Governance', nameNe: 'शासन प्रणाली',
      chapters: [
        { name: 'लोक प्रशासन (Public Administration)', topics: [{ name: 'Principles', questions: 8 }, { name: 'Organization Structure', questions: 6 }, { name: 'Personnel Management', questions: 7 }] },
        { name: 'संघीय शासन (Federal Governance)', topics: [{ name: 'Federal, Provincial, Local', questions: 10 }, { name: 'Inter-government Relations', questions: 5 }] },
        { name: 'विकास योजना (Development Planning)', topics: [{ name: 'Five Year Plans', questions: 5 }, { name: 'Budget Process', questions: 6 }] },
      ],
    },
    {
      id: 'mathematics', name: 'Mathematics', nameNe: 'गणित',
      chapters: [
        { name: 'Algebra', topics: [{ name: 'Equations', questions: 8 }, { name: 'Inequalities', questions: 5 }, { name: 'Sequence & Series', questions: 6 }] },
        { name: 'Geometry', topics: [{ name: 'Triangles', questions: 6 }, { name: 'Circles', questions: 5 }, { name: 'Mensuration', questions: 7 }] },
        { name: 'Statistics & Probability', topics: [{ name: 'Mean, Median, Mode', questions: 6 }, { name: 'Probability', questions: 5 }, { name: 'Data Interpretation', questions: 8 }] },
      ],
    },
    {
      id: 'current-affairs', name: 'Current Affairs', nameNe: 'समसामयिक',
      chapters: [
        { name: 'National Affairs', topics: [{ name: 'Politics', questions: 8 }, { name: 'Economy', questions: 6 }, { name: 'Social Issues', questions: 5 }] },
        { name: 'International Affairs', topics: [{ name: 'Global Politics', questions: 6 }, { name: 'Bilateral Relations', questions: 5 }] },
      ],
    },
    {
      id: 'law', name: 'Law', nameNe: 'कानून',
      chapters: [
        { name: 'Constitutional Law', topics: [{ name: 'Basic Principles', questions: 6 }, { name: 'Fundamental Rights Litigation', questions: 4 }] },
        { name: 'Administrative Law', topics: [{ name: 'Administrative Tribunals', questions: 4 }, { name: 'Rule of Law', questions: 3 }] },
        { name: 'Civil & Criminal Law', topics: [{ name: 'Civil Code (Muluki Ain)', questions: 8 }, { name: 'Criminal Code', questions: 6 }] },
      ],
    },
  ],
  'nayab-subba': [
    {
      id: 'nepali', name: 'Nepali Language', nameNe: 'नेपाली भाषा',
      chapters: [
        { name: 'व्याकरण', topics: [{ name: 'Advanced Grammar', questions: 15 }, { name: 'Syntax', questions: 10 }] },
        { name: 'साहित्य', topics: [{ name: 'Classical Poetry', questions: 8 }, { name: 'Modern Literature', questions: 10 }, { name: 'Literary Criticism', questions: 5 }] },
        { name: 'रचना (Composition)', topics: [{ name: 'Essay Writing', questions: 5 }, { name: 'Letter Writing', questions: 3 }, { name: 'Translation', questions: 4 }] },
      ],
    },
    {
      id: 'english', name: 'English Language', nameNe: 'अंग्रेजी भाषा',
      chapters: [
        { name: 'Advanced Grammar', topics: [{ name: 'Complex Structures', questions: 12 }, { name: 'Error Detection', questions: 8 }] },
        { name: 'Comprehension', topics: [{ name: 'Advanced Passages', questions: 12 }] },
      ],
    },
    {
      id: 'constitution', name: 'Constitution of Nepal', nameNe: 'नेपालको संविधान',
      chapters: [
        { name: 'संवैधानिक अंगहरू', topics: [{ name: 'Legislature', questions: 10 }, { name: 'Executive', questions: 8 }, { name: 'Judiciary', questions: 8 }, { name: 'Electoral System', questions: 6 }] },
        { name: 'मौलिक हक तथा कर्तव्य', topics: [{ name: 'Fundamental Rights', questions: 12 }, { name: 'Directive Principles', questions: 8 }, { name: 'Duties of Citizens', questions: 4 }] },
        { name: 'स्थानीय सरकार', topics: [{ name: 'Local Government Structure', questions: 8 }, { name: 'Fiscal Federalism', questions: 6 }] },
      ],
    },
    {
      id: 'governance', name: 'Governance', nameNe: 'शासन प्रणाली',
      chapters: [
        { name: 'Public Administration', topics: [{ name: 'Administrative Theories', questions: 10 }, { name: 'Organization & Management', questions: 8 }] },
        { name: 'Nepal Administrative System', topics: [{ name: 'Civil Service', questions: 10 }, { name: 'Development Administration', questions: 6 }] },
      ],
    },
    {
      id: 'mathematics', name: 'Mathematics', nameNe: 'गणित',
      chapters: [
        { name: 'Quantitative Aptitude', topics: [{ name: 'Number System', questions: 8 }, { name: 'Percentage & Profit/Loss', questions: 10 }, { name: 'Time & Work', questions: 8 }] },
        { name: 'Data Analysis', topics: [{ name: 'Tables & Charts', questions: 10 }, { name: 'Pie Charts', questions: 5 }] },
      ],
    },
    {
      id: 'current-affairs', name: 'Current Affairs', nameNe: 'समसामयिक',
      chapters: [
        { name: 'National', topics: [{ name: 'Government Policies', questions: 10 }, { name: 'Economic Updates', questions: 8 }] },
        { name: 'International', topics: [{ name: 'SAARC & BIMSTEC', questions: 5 }, { name: 'UN & Global Issues', questions: 5 }] },
      ],
    },
  ],
  'section-officer': [
    {
      id: 'nepali', name: 'Nepali Language', nameNe: 'नेपाली भाषा',
      chapters: [
        { name: 'Advanced Grammar', topics: [{ name: 'Phonology', questions: 5 }, { name: 'Morphology', questions: 8 }, { name: 'Semantics', questions: 6 }] },
        { name: 'Literature & Criticism', topics: [{ name: 'Poetics', questions: 10 }, { name: 'Narrative Theory', questions: 6 }] },
      ],
    },
    {
      id: 'english', name: 'English Language', nameNe: 'अंग्रेजी भाषा',
      chapters: [
        { name: 'Grammar & Usage', topics: [{ name: 'Advanced Structures', questions: 10 }, { name: 'Precision Writing', questions: 8 }] },
        { name: 'Reading & Writing', topics: [{ name: 'Critical Comprehension', questions: 10 }, { name: 'Argumentative Writing', questions: 6 }] },
      ],
    },
    {
      id: 'constitution', name: 'Constitution of Nepal', nameNe: 'नेपालको संविधान',
      chapters: [
        { name: 'Constitutional Framework', topics: [{ name: 'Preamble & Basics', questions: 5 }, { name: 'State Structure', questions: 10 }, { name: 'Distribution of Powers', questions: 8 }] },
        { name: 'Constitutional Bodies', topics: [{ name: 'PSC, EC, CIAA, AGO', questions: 12 }, { name: 'NHRC & Women Commission', questions: 6 }] },
        { name: 'Amendments & Cases', topics: [{ name: 'Constitutional Amendments', questions: 8 }, { name: 'Landmark Cases', questions: 6 }] },
      ],
    },
    {
      id: 'governance', name: 'Governance & Administration', nameNe: 'शासन तथा प्रशासन',
      chapters: [
        { name: 'Administrative Theory', topics: [{ name: 'Classical Theories', questions: 8 }, { name: 'Modern Theories', questions: 10 }, { name: 'New Public Management', questions: 6 }] },
        { name: 'Public Policy', topics: [{ name: 'Policy Making Process', questions: 8 }, { name: 'Policy Analysis', questions: 6 }] },
        { name: 'Human Resource Management', topics: [{ name: 'Recruitment & Training', questions: 8 }, { name: 'Performance Management', questions: 6 }] },
      ],
    },
    {
      id: 'economics', name: 'Economics', nameNe: 'अर्थशास्त्र',
      chapters: [
        { name: 'Macro Economics', topics: [{ name: 'National Income', questions: 8 }, { name: 'Monetary Policy', questions: 6 }, { name: 'Fiscal Policy', questions: 6 }] },
        { name: 'Nepal Economy', topics: [{ name: 'Economic Survey', questions: 8 }, { name: 'Development Plans', questions: 6 }] },
      ],
    },
    {
      id: 'current-affairs', name: 'Current Affairs', nameNe: 'समसामयिक',
      chapters: [
        { name: 'Domestic', topics: [{ name: 'Political Developments', questions: 10 }, { name: 'Socio-economic Issues', questions: 8 }] },
        { name: 'International', topics: [{ name: 'Diplomacy', questions: 6 }, { name: 'Global Economy', questions: 5 }] },
      ],
    },
  ],
}

type ExamLevel = 'kharidar' | 'nayab-subba' | 'section-officer'

export default function SyllabusPage() {
  const [activeLevel, setActiveLevel] = useState<ExamLevel>('kharidar')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set())
  const [reviewedChapters, setReviewedChapters] = useState<Set<string>>(new Set())

  const syllabus = MOCK_SYLLABUS[activeLevel] || []

  // ── Total chapters & progress ──
  const allChapterIds: string[] = []
  for (const subj of syllabus) {
    for (const ch of subj.chapters) {
      allChapterIds.push(`${subj.id}::${ch.name}`)
    }
  }
  const reviewedCount = allChapterIds.filter((id) => reviewedChapters.has(id)).length
  const progressPercent = allChapterIds.length > 0 ? (reviewedCount / allChapterIds.length) * 100 : 0

  // ── Toggle chapter collapse ──
  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  // ── Toggle reviewed ──
  const toggleReviewed = (chapterId: string) => {
    setReviewedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  // ── Get total questions for a subject ──
  const getSubjectQCount = (subject: SubjectData) => {
    let count = 0
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        count += t.questions
      }
    }
    return count
  }

  // ── Display subject ──
  const displaySubject = selectedSubject
    ? syllabus.find((s) => s.id === selectedSubject) || null
    : null

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-5">
      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>Loksewa Syllabus</h1>
        <p className="t-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Complete Nepal Public Service Commission exam syllabus
        </p>
      </motion.div>

      {/* ── Exam Level Tabs ── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { id: 'kharidar', label: 'Kharidar' },
          { id: 'nayab-subba', label: 'Nayab Subba' },
          { id: 'section-officer', label: 'Section Officer' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveLevel(tab.id)
              setSelectedSubject(null)
              setCollapsedChapters(new Set())
            }}
            className="t-caption px-4 py-2 rounded-full transition-all whitespace-nowrap"
            style={{
              background: activeLevel === tab.id ? 'var(--ink-500)' : 'var(--bg-raised)',
              color: activeLevel === tab.id ? '#fff' : 'var(--text-tertiary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Two Column Layout ── */}
      <motion.div variants={fadeUp} className="flex gap-6 flex-col md:flex-row">
        {/* ── Left Sidebar — Subject List ── */}
        <div className="shrink-0 md:sticky md:top-[100px] md:self-start" style={{ width: 240 }}>
          <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
            {/* All Subjects option */}
            <button
              onClick={() => setSelectedSubject(null)}
              className="w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors hover:bg-[var(--bg-raised)]"
              style={{
                borderLeft: !selectedSubject ? '2px solid var(--gold-400)' : '2px solid transparent',
                color: !selectedSubject ? 'var(--ink-400)' : 'var(--text-secondary)',
              }}
            >
              <span className="t-heading-sm">All Subjects</span>
              <Badge className="t-caption border-0 rounded-full px-2" style={{ background: 'var(--bg-raised)', color: 'var(--text-faint)' }}>
                {syllabus.length}
              </Badge>
            </button>

            <div className="hairline" />

            <ScrollArea className="max-h-[calc(100vh-300px)]">
              {syllabus.map((subject) => {
                const qCount = getSubjectQCount(subject)
                const isActive = selectedSubject === subject.id
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 transition-colors hover:bg-[var(--bg-raised)]"
                    style={{
                      borderLeft: isActive ? '2px solid var(--gold-400)' : '2px solid transparent',
                      color: isActive ? 'var(--ink-400)' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="min-w-0">
                      <span className="t-heading-sm block truncate">{subject.name}</span>
                      <span className="t-caption block mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>
                        {subject.nameNe}
                      </span>
                    </div>
                    <span className="t-caption shrink-0" style={{ color: 'var(--text-faint)' }}>
                      {qCount} Qs
                    </span>
                  </button>
                )
              })}
            </ScrollArea>
          </div>

          {/* Download Note */}
          <div className="mt-4 p-3 rounded-[10px]" style={{ background: 'var(--bg-raised)' }}>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              For the official syllabus PDF, visit the{' '}
              <a
                href="https://www.psc.gov.np"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 transition-colors hover:underline"
                style={{ color: 'var(--ink-400)' }}
              >
                PSC Nepal website <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p className="t-caption mt-1" style={{ color: 'var(--text-faint)', fontSize: 10 }}>
              * This syllabus is for reference. Always verify with official PSC notifications.
            </p>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <div className="mb-5 p-4 rounded-[14px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Chapter Review Progress
              </span>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                {reviewedCount} / {allChapterIds.length} chapters reviewed
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: 'var(--ink-400)',
                }}
              />
            </div>
          </div>

          {/* Content: show selected subject or all subjects */}
          {(displaySubject ? [displaySubject] : syllabus).map((subject) => {
            const subjectQCount = getSubjectQCount(subject)
            const isSingleSubject = !!selectedSubject

            return (
              <div key={isSingleSubject ? subject.id : `all-${subject.id}`} className="mb-6">
                {/* Subject heading */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="t-heading-md" style={{ color: 'var(--text-primary)' }}>
                    {subject.name}
                    {!isSingleSubject && (
                      <span className="ml-2 font-normal" style={{ color: 'var(--text-tertiary)' }}>
                        ({subject.nameNe})
                      </span>
                    )}
                  </h2>
                  <Badge className="t-caption bg-ink-500/15 text-ink-300 border-0 rounded-full px-2.5">
                    {subjectQCount} Qs
                  </Badge>
                </div>

                {/* Chapters */}
                <div className="space-y-1.5">
                  {subject.chapters.map((chapter) => {
                    const chapterId = `${subject.id}::${chapter.name}`
                    const isCollapsed = collapsedChapters.has(chapterId)
                    const isReviewed = reviewedChapters.has(chapterId)
                    const topicCount = chapter.topics.length
                    const chapterQCount = chapter.topics.reduce((sum, t) => sum + t.questions, 0)

                    return (
                      <div
                        key={chapterId}
                        className="rounded-[10px] overflow-hidden"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {/* Chapter row */}
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          {/* Collapse toggle */}
                          <button
                            onClick={() => toggleChapter(chapterId)}
                            className="shrink-0"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>

                          {/* Chapter name */}
                          <div className="flex-1 min-w-0">
                            <span className="t-body-sm font-medium truncate block" style={{ color: 'var(--text-primary)' }}>
                              {chapter.name}
                            </span>
                            <span className="t-caption" style={{ color: 'var(--text-faint)' }}>
                              {topicCount} topics · {chapterQCount} questions
                            </span>
                          </div>

                          {/* Reviewed checkbox */}
                          <button
                            onClick={() => toggleReviewed(chapterId)}
                            className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-[var(--bg-raised)]"
                            title="Mark as reviewed"
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                              style={{
                                background: isReviewed ? 'var(--green-400)' : 'var(--bg-raised)',
                                border: `1px solid ${isReviewed ? 'var(--green-400)' : 'var(--border-subtle)'}`,
                              }}
                            >
                              {isReviewed && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="t-caption hidden sm:inline" style={{ color: isReviewed ? 'var(--green-400)' : 'var(--text-faint)' }}>
                              Reviewed
                            </span>
                          </button>
                        </div>

                        {/* Topics */}
                        {!isCollapsed && (
                          <div className="px-3 pb-2.5 pl-9 space-y-0.5">
                            {chapter.topics.map((topic, ti) => (
                              <div
                                key={ti}
                                className="flex items-center justify-between py-1.5 px-2 rounded-md transition-colors hover:bg-[var(--bg-raised)]"
                              >
                                <span className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {topic.name}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge className="t-caption border-0 rounded-full px-2" style={{ background: 'var(--bg-raised)', color: 'var(--text-faint)' }}>
                                    {topic.questions} Qs
                                  </Badge>
                                  <Link href="/practice">
                                    <button
                                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors hover:bg-ink-500/15"
                                      style={{ color: 'var(--ink-300)' }}
                                    >
                                      <Play className="h-3 w-3" />
                                      Practice
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
