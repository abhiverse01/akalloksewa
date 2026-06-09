'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Bell,
  LogOut,
  Palette,
  SlidersHorizontal,
} from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useAuthStore } from '@/stores/authStore'
import { updateUserRecord, changePassword } from '@/lib/auth/service'
import { UserAvatar } from '@/components/user/UserAvatar'
import type { NepalProvince, ExamTarget } from '@/types/auth'
import { PROVINCE_MAP, EXAM_TARGETS } from '@/types/auth'
import { getDBAsync } from '@/lib/db/schema'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

// ── Constants ────────────────────────────────────────────────────────────────

type TabId = 'profile' | 'preferences' | 'security' | 'data'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profile Info' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data' },
]

const EDUCATION_LEVELS = [
  { value: 'see', label: 'SEE / SLC' },
  { value: 'intermediate', label: '+2 / Intermediate' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatJoinedDate(ts: number): string {
  if (!ts) return 'Recently'
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (/[a-z]/.test(pw)) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: 'Weak', color: 'var(--red-500)' }
  if (s <= 2) return { score: s, label: 'Fair', color: 'var(--amber-400)' }
  if (s <= 3) return { score: s, label: 'Good', color: 'var(--gold-400)' }
  if (s <= 4) return { score: s, label: 'Strong', color: 'var(--green-400)' }
  return { score: s, label: 'Very Strong', color: 'var(--green-400)' }
}

// ── Inline-styled input classes ─────────────────────────────────────────────

const inputCls =
  'w-full bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-400)] transition-shadow'
const inputStyle: React.CSSProperties = { color: 'var(--text-primary)' }

const sectionHeaderCls = 't-heading-sm tracking-wider uppercase'

// ── Segmented Control ───────────────────────────────────────────────────────

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      className="inline-flex rounded-[10px] p-1 gap-1"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-150"
          style={
            value === opt.value
              ? { background: 'var(--ink-500)', color: '#fff' }
              : { color: 'var(--text-tertiary)' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <p className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {description && (
          <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {description}
          </p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-400)]"
        style={{ background: checked ? 'var(--ink-500)' : 'var(--border-strong)' }}
      >
        <span
          className="pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)', marginTop: 1 }}
        />
      </button>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useAuthStore((s) => s.logout)

  // ── UI State ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [profileSaved, setProfileSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Profile Info State ───────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [province, setProvince] = useState<string>('')
  const [educationLevel, setEducationLevel] = useState('')
  const [targetExam, setTargetExam] = useState<string>('')
  const [targetDate, setTargetDate] = useState('')
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(4)

  // ── Preferences State ──────────────────────────────────────────────────
  const [themePref, setThemePref] = useState<'dark' | 'light' | 'system'>('dark')
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [optionLabelStyle, setOptionLabelStyle] = useState<'latin' | 'devanagari'>('latin')
  const [showExplanation, setShowExplanation] = useState<'immediate' | 'after-next' | 'manual'>('immediate')
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [showKeyboardHints, setShowKeyboardHints] = useState(true)
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(20)
  const [defaultTestDuration, setDefaultTestDuration] = useState(30)
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true)
  const [negativeMarkValue, setNegativeMarkValue] = useState(0.25)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [practiceReminder, setPracticeReminder] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')

  // ── Security State ────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // ── Data State ──────────────────────────────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  // ── Initialize from user ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName)
    setBio(user.profile.bio ?? '')
    setProvince(user.profile.province ?? '')
    setEducationLevel(user.profile.educationLevel ?? '')
    setTargetExam(user.profile.targetExam ?? '')
    setTargetDate(
      user.profile.targetDate ? new Date(user.profile.targetDate).toISOString().split('T')[0] : ''
    )
    setStudyHoursPerDay(user.profile.studyHoursPerDay ?? 4)

    setThemePref(user.preferences.theme)
    setFontSize(user.preferences.fontSize)
    setOptionLabelStyle(user.preferences.optionLabelStyle)
    setShowExplanation(user.preferences.showExplanationInPractice)
    setAutoAdvance(user.preferences.autoAdvance)
    setShowKeyboardHints(user.preferences.showKeyboardHints)
    setDefaultQuestionCount(user.preferences.defaultQuestionCount)
    setDefaultTestDuration(user.preferences.defaultTestDuration)
    setNegativeMarkingEnabled(user.preferences.negativeMarkingEnabled)
    setNegativeMarkValue(user.preferences.negativeMarkValue)
    setPracticeReminder(user.preferences.practiceReminder)
    setReminderTime(user.preferences.reminderTime ?? '08:00')
  }, [user])

  // ── Profile save ────────────────────────────────────────────────────────
  const handleSaveProfile = useCallback(async () => {
    if (!user) return
    const updatedProfile = {
      ...user.profile,
      bio: bio.trim() || undefined,
      province: (province || undefined) as NepalProvince | undefined,
      educationLevel: educationLevel || undefined,
      targetExam: (targetExam || undefined) as ExamTarget | undefined,
      targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
      studyHoursPerDay: studyHoursPerDay || undefined,
    }
    await updateUserRecord({
      id: user.id,
      displayName: displayName.trim(),
      profile: updatedProfile,
    })
    updateUser({ displayName: displayName.trim(), profile: updatedProfile })

    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setProfileSaved(true)
    savedTimerRef.current = setTimeout(() => setProfileSaved(false), 2000)
  }, [user, displayName, bio, province, educationLevel, targetExam, targetDate, studyHoursPerDay, updateUser])

  // ── Preferences save on change ─────────────────────────────────────────
  const savePref = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!user) return
      const updatedPrefs = { ...user.preferences, ...patch }
      await updateUserRecord({ id: user.id, preferences: updatedPrefs })
      updateUser({ preferences: updatedPrefs })
    },
    [user, updateUser]
  )

  // ── Password change ───────────────────────────────────────────────────
  const handleChangePassword = useCallback(async () => {
    if (!user) return
    setPasswordError('')
    setPasswordSuccess(false)
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in all fields')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    const result = await changePassword(user.id, currentPassword, newPassword)
    setPasswordLoading(false)
    if (result.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordError(
        result.error === 'invalid-current' ? 'Current password is incorrect' : 'Failed to change password'
      )
    }
  }, [user, currentPassword, newPassword, confirmPassword])

  // ── Export data ────────────────────────────────────────────────────────
  const handleExportData = useCallback(async () => {
    if (!user) return
    setExportLoading(true)
    try {
      const db = await getDBAsync()
      if (!db) return
      const { passwordHash, salt, ...safeUser } = user
      const testSessions = await db.getAll('testSessions')
      const notes = await db.getAll('notes')
      const bookmarks = await db.getAll('bookmarks')
      const payload = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        user: safeUser,
        testSessions,
        notes,
        bookmarks,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `akalloksewa-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // best effort
    } finally {
      setExportLoading(false)
    }
  }, [user])

  // ── Reset study data ──────────────────────────────────────────────────
  const handleResetStudyData = useCallback(async () => {
    if (!user) return
    const resetStats = {
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalTests: 0,
      totalStudyMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: 0,
      subjectAccuracy: {} as Record<string, number>,
      joinedAt: user.stats.joinedAt,
    }
    await updateUserRecord({ id: user.id, stats: resetStats })
    updateUser({ stats: resetStats })
    setShowResetConfirm(false)
    setResetConfirmText('')
  }, [user, updateUser])

  // ── Delete account ─────────────────────────────────────────────────────
  const handleDeleteAccount = useCallback(async () => {
    if (!user) return
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
    const db = await getDBAsync()
    if (db) {
      try {
        await db.delete('users', user.id)
      } catch {
        /* best effort */
      }
    }
    await logout()
  }, [user, logout])

  // ── Guard ──────────────────────────────────────────────────────────────
  if (!user) return null

  // ── Computed ────────────────────────────────────────────────────────────
  const accuracy =
    user.stats.totalQuestionsAttempted > 0
      ? Math.round((user.stats.totalCorrect / user.stats.totalQuestionsAttempted) * 100)
      : 0
  const studyHours = Math.round(user.stats.totalStudyMinutes / 60)
  const pwStrength = getPasswordStrength(newPassword)
  const examLabel = EXAM_TARGETS.find((e) => e.value === user.profile.targetExam)?.label

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* ── PROFILE HERO CARD ───────────────────────────────────────────── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Top: Avatar + Info */}
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-5">
          <UserAvatar
            displayName={user.displayName}
            avatarColor={user.avatarColor}
            size="xl"
            showRing
          />
          <div className="flex-1 min-w-0">
            <h1 className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>
              {user.displayName}
            </h1>
            <p
              className="t-body-sm font-mono mt-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              @{user.username}
            </p>
            <p className="t-caption mt-1" style={{ color: 'var(--text-faint)' }}>
              Joined {formatJoinedDate(user.stats.joinedAt)}
            </p>

            {/* Province + Exam pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {user.profile.province && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full t-caption"
                  style={{
                    background: 'var(--bg-raised)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {user.profile.province && PROVINCE_MAP[user.profile.province] ? PROVINCE_MAP[user.profile.province].english : ''}
                </span>
              )}
              {user.profile.targetExam && examLabel && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full t-caption"
                  style={{
                    background: 'rgba(232,168,19,0.12)',
                    color: 'var(--gold-400)',
                    border: '1px solid rgba(232,168,19,0.2)',
                  }}
                >
                  {examLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-5 pt-5 mt-6"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {[
            { value: user.stats.totalQuestionsAttempted, label: 'Questions' },
            { value: user.stats.totalTests, label: 'Tests' },
            { value: `${accuracy}%`, label: 'Accuracy' },
            { value: studyHours, label: 'Study Hours' },
            { value: user.stats.currentStreak, label: 'Streak' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center"
              style={{
                borderLeft: i > 0 ? '1px solid var(--border-subtle)' : undefined,
              }}
            >
              <span className="t-heading-xl" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </span>
              <span className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB BAR (desktop only) ──────────────────────────────────── */}
      <div
        className="hidden md:flex gap-1 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={
              activeTab === tab.id
                ? { color: 'var(--text-primary)' }
                : { color: 'var(--text-tertiary)' }
            }
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: 'var(--ink-400)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT (desktop: tab switching, mobile: all visible) ── */}
      {/* Mobile: Accordion layout */}
      <div className="md:hidden rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <Accordion type="multiple" defaultValue={['profile']}>
          {/* Accordion: Profile Info */}
          <AccordionItem value="profile" className="border-b border-[var(--border-subtle)]">
            <AccordionTrigger className="h-[52px] px-4 no-underline hover:no-underline" style={{ color: 'var(--text-primary)' }}>
              <span className="t-body-sm font-medium">Profile Info</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} style={inputStyle} maxLength={50} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                    <span className="t-caption" style={{ color: bio.length > 160 ? 'var(--red-400)' : 'var(--text-faint)' }}>{bio.length}/160</span>
                  </div>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} rows={2} className={`${inputCls} resize-none`} style={inputStyle} placeholder="A brief bio…" />
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Province</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Not set</option>
                    {(Object.keys(PROVINCE_MAP) as NepalProvince[]).map((key) => (<option key={key} value={key}>{PROVINCE_MAP[key].english}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Education Level</label>
                  <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Not set</option>
                    {EDUCATION_LEVELS.map((lv) => (<option key={lv.value} value={lv.value}>{lv.label}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Target Exam</label>
                  <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Not set</option>
                    {EXAM_TARGETS.map((exam) => (<option key={exam.value} value={exam.value}>{exam.label}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Target Date</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <button onClick={handleSaveProfile} className="w-full px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2" style={{ background: 'var(--ink-500)', color: '#fff' }}>
                  {profileSaved ? (<><Check className="size-4" /><span style={{ color: 'var(--green-400)' }}>Saved ✓</span></>) : 'Save Profile'}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion: Preferences */}
          <AccordionItem value="preferences" className="border-b border-[var(--border-subtle)]">
            <AccordionTrigger className="h-[52px] px-4 no-underline hover:no-underline" style={{ color: 'var(--text-primary)' }}>
              <span className="t-body-sm font-medium">Preferences</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <ToggleRow label="Keyboard hints" description="Show shortcut hints" checked={showKeyboardHints} onCheckedChange={(v) => { setShowKeyboardHints(v); savePref({ showKeyboardHints: v }) }} />
                <ToggleRow label="Auto-advance" description="Move to next after answering" checked={autoAdvance} onCheckedChange={(v) => { setAutoAdvance(v); savePref({ autoAdvance: v }) }} />
                <ToggleRow label="Shuffle Questions" description="Randomize order in tests" checked={shuffleQuestions} onCheckedChange={(v) => { setShuffleQuestions(v); savePref({ shuffleQuestions: v }) }} />
                <ToggleRow label="Shuffle Options" description="Randomize answer options" checked={shuffleOptions} onCheckedChange={(v) => { setShuffleOptions(v); savePref({ shuffleOptions: v }) }} />
                <ToggleRow label="Negative Marking" description="Deduct marks for wrong answers" checked={negativeMarkingEnabled} onCheckedChange={(v) => { setNegativeMarkingEnabled(v); savePref({ negativeMarkingEnabled: v }) }} />
                <ToggleRow label="Practice Reminder" description="Daily reminder to practice" checked={practiceReminder} onCheckedChange={(v) => { setPracticeReminder(v); savePref({ practiceReminder: v }) }} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion: Security */}
          <AccordionItem value="security" className="border-b border-[var(--border-subtle)]">
            <AccordionTrigger className="h-[52px] px-4 no-underline hover:no-underline" style={{ color: 'var(--text-primary)' }}>
              <span className="t-body-sm font-medium">Security</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} style={inputStyle} placeholder="Current password" />
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }} className={inputCls} style={inputStyle} placeholder="Min 8 chars" />
                </div>
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }} className={inputCls} style={inputStyle} placeholder="Re-enter new password" />
                </div>
                {passwordError && <p className="t-body-sm" style={{ color: 'var(--red-400)' }}>{passwordError}</p>}
                {passwordSuccess && <p className="t-body-sm" style={{ color: 'var(--green-400)' }}>Password updated!</p>}
                <button onClick={handleChangePassword} disabled={passwordLoading} className="w-full px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 disabled:opacity-50" style={{ background: 'var(--ink-500)', color: '#fff' }}>
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion: Data */}
          <AccordionItem value="data">
            <AccordionTrigger className="h-[52px] px-4 no-underline hover:no-underline" style={{ color: 'var(--text-primary)' }}>
              <span className="t-body-sm font-medium">Data</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <button onClick={handleExportData} disabled={exportLoading} className="w-full px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <Download className="size-4" />
                  {exportLoading ? 'Exporting…' : 'Export All Data'}
                </button>
                {/* Mobile: Full-width Delete Account */}
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full px-4 py-3 rounded-[10px] text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]" style={{ border: '2px solid var(--red-400)', color: 'var(--red-400)', background: 'transparent' }}>
                  <Trash2 className="size-4" />
                  Delete Account
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop: Tab-switched content */}
      <div className="hidden md:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  TAB: PROFILE INFO                                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <>
              {/* Personal */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Personal
                </span>

                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Bio
                    </label>
                    <span className="t-caption" style={{ color: bio.length > 160 ? 'var(--red-400)' : 'var(--text-faint)' }}>
                      {bio.length}/160
                    </span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                    placeholder="A brief bio about yourself…"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Province
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option value="">Not set</option>
                      {(Object.keys(PROVINCE_MAP) as NepalProvince[]).map((key) => (
                        <option key={key} value={key}>
                          {PROVINCE_MAP[key].english}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option value="">Not set</option>
                      {EDUCATION_LEVELS.map((lv) => (
                        <option key={lv.value} value={lv.value}>
                          {lv.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exam Preparation */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Exam Preparation
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Target Exam
                    </label>
                    <select
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option value="">Not set</option>
                      {EXAM_TARGETS.map((exam) => (
                        <option key={exam.value} value={exam.value}>
                          {exam.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Study Hours / Day
                    </label>
                    <span
                      className="t-body-sm font-mono font-medium"
                      style={{ color: 'var(--ink-300)' }}
                    >
                      {studyHoursPerDay}h
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={studyHoursPerDay}
                    onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--ink-400) 0%, var(--ink-400) ${
                        ((studyHoursPerDay - 1) / 7) * 100
                      }%, var(--border-subtle) ${((studyHoursPerDay - 1) / 7) * 100}%, var(--border-subtle) 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 flex items-center gap-2"
                  style={{ background: 'var(--ink-500)', color: '#fff' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--ink-600)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'var(--ink-500)')}
                >
                  {profileSaved ? (
                    <>
                      <Check className="size-4" />
                      <span style={{ color: 'var(--green-400)' }}>Saved &#10003;</span>
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  TAB: PREFERENCES                                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <>
              {/* Appearance */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="size-4" style={{ color: 'var(--ink-300)' }} />
                  <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                    Appearance
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <label className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                    Theme
                  </label>
                  <SegmentedControl
                    options={[
                      { value: 'dark', label: 'Dark' },
                      { value: 'light', label: 'Light' },
                      { value: 'system', label: 'System' },
                    ]}
                    value={themePref}
                    onChange={(v) => {
                      const val = v as 'dark' | 'light' | 'system'
                      setThemePref(val)
                      savePref({ theme: val })
                      // Also apply theme to DOM
                      const html = document.documentElement
                      if (val === 'system') {
                        html.removeAttribute('data-theme')
                      } else {
                        html.setAttribute('data-theme', val)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                    Font Size
                  </label>
                  <SegmentedControl
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'large', label: 'Large' },
                    ]}
                    value={fontSize}
                    onChange={(v) => {
                      const val = v as 'normal' | 'large'
                      setFontSize(val)
                      savePref({ fontSize: val })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                    Option Labels
                  </label>
                  <SegmentedControl
                    options={[
                      { value: 'latin', label: 'A B C D' },
                      { value: 'devanagari', label: '\u0915 \u0916 \u0917 \u0918' },
                    ]}
                    value={optionLabelStyle}
                    onChange={(v) => {
                      const val = v as 'latin' | 'devanagari'
                      setOptionLabelStyle(val)
                      savePref({ optionLabelStyle: val })
                    }}
                  />
                </div>
              </div>

              {/* Practice */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-1"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 pb-3">
                  <SlidersHorizontal className="size-4" style={{ color: 'var(--ink-300)' }} />
                  <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                    Practice
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <label className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                    Show Explanation
                  </label>
                  <SegmentedControl
                    options={[
                      { value: 'immediate', label: 'Immediate' },
                      { value: 'after-next', label: 'After Next' },
                      { value: 'manual', label: 'Manual' },
                    ]}
                    value={showExplanation}
                    onChange={(v) => {
                      const val = v as 'immediate' | 'after-next' | 'manual'
                      setShowExplanation(val)
                      savePref({ showExplanationInPractice: val })
                    }}
                  />
                </div>

                <ToggleRow
                  label="Auto-advance"
                  description="Move to next question after answering"
                  checked={autoAdvance}
                  onCheckedChange={(v) => {
                    setAutoAdvance(v)
                    savePref({ autoAdvance: v })
                  }}
                />

                <ToggleRow
                  label="Keyboard hints"
                  description="Show keyboard shortcut hints on buttons"
                  checked={showKeyboardHints}
                  onCheckedChange={(v) => {
                    setShowKeyboardHints(v)
                    savePref({ showKeyboardHints: v })
                  }}
                />

                <div className="grid grid-cols-2 gap-4 py-3">
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Default Question Count
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={defaultQuestionCount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 20
                        setDefaultQuestionCount(v)
                        savePref({ defaultQuestionCount: v })
                      }}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Default Test Duration (min)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={defaultTestDuration}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 30
                        setDefaultTestDuration(v)
                        savePref({ defaultTestDuration: v })
                      }}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Test Engine */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-1"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Test Engine
                </span>

                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 mr-4">
                    <p className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                      Negative Marking
                    </p>
                    <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      Deduct marks for wrong answers
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {negativeMarkingEnabled && (
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.25}
                        value={negativeMarkValue}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v) && v >= 0 && v <= 1) {
                            setNegativeMarkValue(v)
                            savePref({ negativeMarkValue: v })
                          }
                        }}
                        className="w-16 text-center bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[8px] px-2 py-1 text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    )}
                    <button
                      role="switch"
                      aria-checked={negativeMarkingEnabled}
                      onClick={() => {
                        const v = !negativeMarkingEnabled
                        setNegativeMarkingEnabled(v)
                        savePref({ negativeMarkingEnabled: v })
                      }}
                      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-400)]"
                      style={{
                        background: negativeMarkingEnabled ? 'var(--ink-500)' : 'var(--border-strong)',
                      }}
                    >
                      <span
                        className="pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                        style={{
                          transform: negativeMarkingEnabled ? 'translateX(16px)' : 'translateX(0)',
                          marginTop: 1,
                        }}
                      />
                    </button>
                  </div>
                </div>

                <ToggleRow
                  label="Shuffle Questions"
                  description="Randomize question order in tests"
                  checked={shuffleQuestions}
                  onCheckedChange={(v) => { setShuffleQuestions(v); savePref({ shuffleQuestions: v }) }}
                />

                <ToggleRow
                  label="Shuffle Options"
                  description="Randomize answer option order"
                  checked={shuffleOptions}
                  onCheckedChange={(v) => { setShuffleOptions(v); savePref({ shuffleOptions: v }) }}
                />
              </div>

              {/* Notifications */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-1"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 pb-3">
                  <Bell className="size-4" style={{ color: 'var(--ink-300)' }} />
                  <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                    Notifications
                  </span>
                </div>

                <ToggleRow
                  label="Practice Reminder"
                  description="Get a daily reminder to practice"
                  checked={practiceReminder}
                  onCheckedChange={(v) => {
                    setPracticeReminder(v)
                    savePref({ practiceReminder: v })
                  }}
                />

                {practiceReminder && (
                  <div className="flex items-center justify-between py-2 pl-0">
                    <label className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => {
                        setReminderTime(e.target.value)
                        savePref({ reminderTime: e.target.value })
                      }}
                      className="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[8px] px-2 py-1.5 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                <p className="t-caption pt-2" style={{ color: 'var(--text-faint)' }}>
                  Browser push notifications will be available in Phase 2.
                </p>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  TAB: SECURITY                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <>
              <div
                className="rounded-xl p-5 sm:p-6 space-y-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Change Password
                </span>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputCls} pr-10`}
                      style={inputStyle}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setPasswordError('')
                      }}
                      className={`${inputCls} pr-10`}
                      style={inputStyle}
                      placeholder="Min 8 chars, uppercase, number"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-colors duration-200"
                            style={{
                              background:
                                i < pwStrength.score ? pwStrength.color : 'var(--border-subtle)',
                            }}
                          />
                        ))}
                      </div>
                      <p className="t-caption" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setPasswordError('')
                    }}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Re-enter new password"
                  />
                </div>

                {/* Error / Success */}
                {passwordError && (
                  <p className="t-body-sm" style={{ color: 'var(--red-400)' }}>
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="t-body-sm" style={{ color: 'var(--green-400)' }}>
                    Password updated successfully!
                  </p>
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 disabled:opacity-50"
                  style={{ background: 'var(--ink-500)', color: '#fff' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--ink-600)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'var(--ink-500)')}
                >
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>

              {/* Active Session */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Active Sessions
                </span>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="t-body-sm" style={{ color: 'var(--text-primary)' }}>
                      This browser
                    </p>
                    <p className="t-caption" style={{ color: 'var(--green-400)' }}>
                      Active now
                    </p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1.5 rounded-[8px] t-body-sm transition-colors duration-150 flex items-center gap-1.5"
                    style={{
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                </div>

                <p className="t-caption" style={{ color: 'var(--text-faint)' }}>
                  Multi-device session management will be available in Phase 2.
                </p>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  TAB: DATA                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'data' && (
            <>
              {/* Export */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className={sectionHeaderCls} style={{ color: 'var(--text-tertiary)' }}>
                  Export
                </span>
                <p className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Download all your data as a JSON file including profile, test sessions, notes,
                  and bookmarks.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
                  style={{
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Download className="size-4" />
                  {exportLoading ? 'Exporting…' : 'Export All Data'}
                </button>
              </div>

              {/* Danger Zone */}
              <div
                className="rounded-xl p-5 sm:p-6 space-y-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(193,39,45,0.25)',
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4" style={{ color: 'var(--red-400)' }} />
                  <span className={sectionHeaderCls} style={{ color: 'var(--red-400)' }}>
                    Danger Zone
                  </span>
                </div>

                {/* Reset Study Data */}
                <div
                  className="rounded-[10px] p-4 space-y-3"
                  style={{ background: 'var(--bg-raised)' }}
                >
                  <div>
                    <p className="t-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Reset Study Data
                    </p>
                    <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      Reset all study statistics, streak, and test history. This cannot be undone.
                    </p>
                  </div>

                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 rounded-[8px] t-body-sm font-medium transition-colors duration-150 flex items-center gap-1.5"
                      style={{
                        border: '1px solid rgba(193,39,45,0.3)',
                        color: 'var(--red-400)',
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Reset Study Data
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Type <span className="font-mono font-bold" style={{ color: 'var(--red-400)' }}>RESET</span> to confirm:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resetConfirmText}
                          onChange={(e) => setResetConfirmText(e.target.value)}
                          placeholder="Type RESET here"
                          className={`${inputCls} flex-1`}
                          style={inputStyle}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (resetConfirmText === 'RESET') handleResetStudyData()
                          }}
                          disabled={resetConfirmText !== 'RESET'}
                          className="px-4 py-2 rounded-[8px] t-body-sm font-medium transition-all duration-150 disabled:opacity-40"
                          style={{
                            background: resetConfirmText === 'RESET' ? 'var(--red-500)' : 'var(--red-500)',
                            color: '#fff',
                          }}
                        >
                          Confirm
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowResetConfirm(false)
                          setResetConfirmText('')
                        }}
                        className="t-caption transition-colors duration-150"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Account */}
                <div
                  className="rounded-[10px] p-4 space-y-3"
                  style={{ background: 'var(--bg-raised)' }}
                >
                  <div>
                    <p className="t-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Delete Account
                    </p>
                    <p className="t-caption mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      Permanently delete your account and all associated data. This action is
                      irreversible.
                    </p>
                  </div>

                  <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-[8px] t-body-sm font-medium transition-colors duration-150 flex items-center gap-1.5"
                      style={{
                        background: 'var(--red-500)',
                        color: '#fff',
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Delete Account
                    </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      </div>

      {/* ── Delete Account Confirm Dialog ── */}
      {showDeleteConfirm && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Account"
          description="This will permanently delete your account and all data. This action cannot be undone."
          variant="destructive"
          onConfirm={handleDeleteAccount}
        />
      )}
    </motion.div>
  )
}
