'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  User,
  Palette,
  BookOpen,
  FlaskConical,
  Bell,
  Keyboard,
  Shield,
  Info,
  Download,
  ExternalLink,
  Mail,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { updateUserRecord } from '@/lib/auth/service'
import { UserAvatar } from '@/components/user/UserAvatar'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/hooks/useTheme'
import { APP_VERSION } from '@/lib/constants'
import { initDB } from '@/lib/db/schema'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { UserPreferences } from '@/types/auth'

// ─── Nav Configuration ─────────────────────────────────────────────

type SectionId =
  | 'account'
  | 'appearance'
  | 'study'
  | 'test-engine'
  | 'notifications'
  | 'shortcuts'
  | 'privacy'
  | 'about'

const NAV_ITEMS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'study', label: 'Study Preferences', icon: BookOpen },
  { id: 'test-engine', label: 'Test Engine', icon: FlaskConical },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'privacy', label: 'Data & Privacy', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
]

// ─── Helper Components ────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-[8px] t-body-sm font-medium transition-all duration-150 cursor-pointer',
            value === opt.value
              ? 'bg-[var(--ink-500)] text-white shadow-xs'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="min-w-0">
        <p className="t-body-sm text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="t-caption text-[var(--text-faint)] mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  )
}

function SectionCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      {children}
    </div>
  )
}

// ── iOS-style setting row for mobile ──
function SettingRow({
  label,
  value,
  onClick,
  chevron = true,
}: {
  label: string
  value?: string
  onClick?: () => void
  chevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-[var(--bg-raised)]"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <span className="t-body-sm text-[var(--text-primary)]">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="t-caption text-[var(--text-faint)]">{value}</span>
        )}
        {chevron && (
          <ChevronRight className="h-4 w-4 text-[var(--text-faint)]" />
        )}
      </div>
    </button>
  )
}

function SettingRowToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="min-w-0">
        <p className="t-body-sm text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="t-caption text-[var(--text-faint)] mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  )
}

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string
  icon: LucideIcon
}) {
  return (
    <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2.5 bg-[var(--bg-raised)]">
      <Icon className="h-4 w-4 text-[var(--ink-300)] shrink-0" />
      <h3 className="t-heading-sm text-[var(--text-tertiary)]">{title}</h3>
    </div>
  )
}

function SettingDivider() {
  return <div className="border-b border-[var(--border-subtle)]" />
}

function NavItem({
  item,
  active,
  onClick,
  compact = false,
}: {
  item: (typeof NAV_ITEMS)[number]
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-[8px] transition-all duration-150 cursor-pointer w-full text-left',
        compact
          ? 'px-3 py-1.5 text-xs whitespace-nowrap'
          : 'px-3 py-2 t-body-sm',
        active
          ? 'bg-[var(--ink-800)] text-[var(--ink-300)] border-l-2 border-[var(--ink-400)]'
          : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-secondary)]',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate">{item.label}</span>}
      {compact && <span className="truncate">{item.label}</span>}
    </button>
  )
}

// ─── Keyboard Shortcuts Data ───────────────────────────────────────

const PRACTICE_SHORTCUTS = [
  { key: '1', action: 'Select option A' },
  { key: '2', action: 'Select option B' },
  { key: '3', action: 'Select option C' },
  { key: '4', action: 'Select option D' },
  { key: 'Space', action: 'Next question' },
  { key: 'B', action: 'Bookmark question' },
  { key: 'Esc', action: 'Pause / Resume' },
]

const TEST_SHORTCUTS = [
  { key: '1', action: 'Select option A' },
  { key: '2', action: 'Select option B' },
  { key: '3', action: 'Select option C' },
  { key: '4', action: 'Select option D' },
  { key: 'Tab', action: 'Next question' },
  { key: 'Shift+Tab', action: 'Previous question' },
  { key: 'N', action: 'Toggle question navigator' },
  { key: 'Esc', action: 'Submit test' },
]

function ShortcutTable({
  shortcuts,
}: {
  shortcuts: { key: string; action: string }[]
}) {
  return (
    <div className="divide-y divide-[var(--border-subtle)]">
      {shortcuts.map((s, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-between px-4 py-2.5',
            i % 2 === 1 && 'bg-[var(--bg-raised)]/50',
          )}
        >
          <kbd className="t-mono text-[11px] bg-[var(--bg-sunken)] text-[var(--text-secondary)] px-2 py-0.5 rounded-[5px] border border-[var(--border-subtle)] font-medium">
            {s.key}
          </kbd>
          <span className="t-body-sm text-[var(--text-secondary)] ml-3">{s.action}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Settings Page ───────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { theme, setTheme } = useTheme()

  const [activeSection, setActiveSection] = useState<SectionId>('account')

  // ─── Derived preferences with safe defaults ─────────────────────
  const prefs: UserPreferences = user?.preferences ?? {
    theme: 'dark',
    language: 'en',
    defaultTestDuration: 30,
    defaultQuestionCount: 20,
    negativeMarkingEnabled: true,
    negativeMarkValue: 0.25,
    showKeyboardHints: true,
    emailNotifications: false,
    practiceReminder: false,
    fontSize: 'normal',
    optionLabelStyle: 'latin',
    autoAdvance: false,
    showExplanationInPractice: 'immediate',
    shuffleQuestions: true,
    shuffleOptions: true,
  }

  // ─── Save helper ─────────────────────────────────────────────────
  const savePrefs = useCallback(
    (patch: Partial<UserPreferences>) => {
      if (!user) return
      const newPrefs: UserPreferences = { ...prefs, ...patch }
      updateUser({ preferences: newPrefs })
      updateUserRecord({ id: user.id, preferences: newPrefs })
    },
    [user, prefs, updateUser],
  )

  // ─── Theme change (also applies to DOM) ───────────────────────────
  const handleThemeChange = useCallback(
    (newTheme: 'dark' | 'light' | 'system') => {
      setTheme(newTheme)
      savePrefs({ theme: newTheme })
    },
    [setTheme, savePrefs],
  )

  // ─── Export data ─────────────────────────────────────────────────
  const exportData = useCallback(async () => {
    try {
      const db = await initDB()
      const data: Record<string, unknown[]> = {}
      const names = Array.from(db.objectStoreNames) as string[]
      for (const name of names) {
        data[name] = await db.getAll(name as never)
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `akalloksewa-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch {
      toast.error('Failed to export data')
    }
  }, [])

  // ─── Number input helpers ─────────────────────────────────────────
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

  // ═════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="t-heading-xl text-[var(--text-primary)]">Settings</h1>
        <p className="t-body-sm text-[var(--text-tertiary)] mt-1">
          Manage your profile, preferences, and data
        </p>
      </div>

      {/* Mobile horizontal nav */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-4 -mx-4 px-4 mb-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
            compact
          />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* ─── Left nav (desktop, sticky) ─── */}
        <nav className="hidden md:block w-[200px] shrink-0">
          <div className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                active={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* ─── Right content area (desktop) ─── */}
        <div className="hidden md:block flex-1 min-w-0 space-y-6">
          {/* ━━━ ACCOUNT ━━━ */}
          {activeSection === 'account' && (
            <SectionCard>
              <SectionHeader title="Account" icon={User} />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    displayName={user?.displayName ?? 'User'}
                    avatarColor={user?.avatarColor ?? 'ink'}
                    size="xl"
                    showRing
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="t-heading-md text-[var(--text-primary)] truncate">
                      {user?.displayName ?? 'User'}
                    </p>
                    <p className="t-body-sm text-[var(--text-tertiary)] truncate">
                      @{user?.username ?? 'user'}
                    </p>
                    <p className="t-body-sm text-[var(--text-faint)] truncate">
                      {user?.email ?? ''}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 t-body-sm font-medium text-[var(--ink-400)] hover:text-[var(--ink-300)] transition-colors duration-150"
                  >
                    Edit Profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ APPEARANCE ━━━ */}
          {activeSection === 'appearance' && (
            <SectionCard>
              <SectionHeader title="Appearance" icon={Palette} />
              <div className="p-5 space-y-5">
                {/* Theme */}
                <div className="space-y-2">
                  <Label className="t-body-sm text-[var(--text-secondary)]">Theme</Label>
                  <SegmentedControl
                    options={[
                      { value: 'dark', label: 'Dark' },
                      { value: 'light', label: 'Light' },
                      { value: 'system', label: 'System' },
                    ]}
                    value={theme}
                    onChange={handleThemeChange}
                  />
                </div>

                <SettingDivider />

                {/* Font Size */}
                <div className="space-y-2">
                  <Label className="t-body-sm text-[var(--text-secondary)]">Font Size</Label>
                  <SegmentedControl
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'large', label: 'Large' },
                    ]}
                    value={prefs.fontSize}
                    onChange={(v) => savePrefs({ fontSize: v })}
                  />
                </div>

                <SettingDivider />

                {/* Option Labels */}
                <div className="space-y-2">
                  <Label className="t-body-sm text-[var(--text-secondary)]">
                    Option Labels
                  </Label>
                  <SegmentedControl
                    options={[
                      { value: 'latin', label: 'A B C D' },
                      { value: 'devanagari', label: 'क ख ग घ' },
                    ]}
                    value={prefs.optionLabelStyle}
                    onChange={(v) => savePrefs({ optionLabelStyle: v })}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ STUDY PREFERENCES ━━━ */}
          {activeSection === 'study' && (
            <SectionCard>
              <SectionHeader title="Study Preferences" icon={BookOpen} />
              <div className="p-5 space-y-1">
                {/* Show Explanation */}
                <div className="space-y-2 py-3">
                  <Label className="t-body-sm text-[var(--text-secondary)]">
                    Show Explanation
                  </Label>
                  <SegmentedControl
                    options={[
                      { value: 'immediate', label: 'Immediately' },
                      { value: 'after-next', label: 'After Next' },
                      { value: 'manual', label: 'Manual' },
                    ]}
                    value={prefs.showExplanationInPractice}
                    onChange={(v) =>
                      savePrefs({ showExplanationInPractice: v })
                    }
                  />
                </div>

                <SettingDivider />

                {/* Auto-advance */}
                <ToggleRow
                  label="Auto-advance to next question"
                  description="Automatically go to the next question after answering"
                  checked={prefs.autoAdvance}
                  onCheckedChange={(v) => savePrefs({ autoAdvance: v })}
                />

                <SettingDivider />

                {/* Keyboard hints */}
                <ToggleRow
                  label="Keyboard hints"
                  description="Show keyboard shortcut hints on option buttons"
                  checked={prefs.showKeyboardHints}
                  onCheckedChange={(v) => savePrefs({ showKeyboardHints: v })}
                />

                <SettingDivider />

                {/* Default Question Count & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                  <div className="space-y-1.5">
                    <Label className="t-body-sm text-[var(--text-secondary)]">
                      Default Question Count
                    </Label>
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={prefs.defaultQuestionCount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value)
                        if (!isNaN(v)) savePrefs({ defaultQuestionCount: clamp(v, 10, 100) })
                      }}
                      className="bg-[var(--bg-raised)] border-[var(--border-default)] rounded-[10px] h-10"
                    />
                    <p className="t-caption text-[var(--text-faint)]">10 – 100 questions</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="t-body-sm text-[var(--text-secondary)]">
                      Default Test Duration
                    </Label>
                    <Input
                      type="number"
                      min={10}
                      max={180}
                      value={prefs.defaultTestDuration}
                      onChange={(e) => {
                        const v = parseInt(e.target.value)
                        if (!isNaN(v)) savePrefs({ defaultTestDuration: clamp(v, 10, 180) })
                      }}
                      className="bg-[var(--bg-raised)] border-[var(--border-default)] rounded-[10px] h-10"
                    />
                    <p className="t-caption text-[var(--text-faint)]">10 – 180 minutes</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ TEST ENGINE ━━━ */}
          {activeSection === 'test-engine' && (
            <SectionCard>
              <SectionHeader title="Test Engine" icon={FlaskConical} />
              <div className="p-5 space-y-1">
                {/* Negative Marking toggle */}
                <ToggleRow
                  label="Negative Marking"
                  description="Deduct marks for incorrect answers"
                  checked={prefs.negativeMarkingEnabled}
                  onCheckedChange={(v) => savePrefs({ negativeMarkingEnabled: v })}
                />

                <SettingDivider />

                {/* Negative Mark Value */}
                <div className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="t-body-sm text-[var(--text-primary)]">
                      Negative Mark Value
                    </p>
                    <p className="t-caption text-[var(--text-faint)] mt-0.5">
                      Marks deducted per wrong answer (0.00 – 1.00)
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.25}
                    value={prefs.negativeMarkValue}
                    disabled={!prefs.negativeMarkingEnabled}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) savePrefs({ negativeMarkValue: clamp(v, 0, 1) })
                    }}
                    className="bg-[var(--bg-raised)] border-[var(--border-default)] rounded-[10px] h-10 w-24 text-center appearance-none"
                  />
                </div>

                <SettingDivider />

                {/* Shuffle Questions */}
                <ToggleRow
                  label="Shuffle Questions"
                  description="Randomize question order in tests"
                  checked={prefs.shuffleQuestions ?? true}
                  onCheckedChange={(v) => savePrefs({ shuffleQuestions: v })}
                />

                <SettingDivider />

                {/* Shuffle Options */}
                <ToggleRow
                  label="Shuffle Options"
                  description="Randomize answer option order per question"
                  checked={prefs.shuffleOptions ?? true}
                  onCheckedChange={(v) => savePrefs({ shuffleOptions: v })}
                />
              </div>
            </SectionCard>
          )}

          {/* ━━━ NOTIFICATIONS ━━━ */}
          {activeSection === 'notifications' && (
            <SectionCard>
              <SectionHeader title="Notifications" icon={Bell} />
              <div className="p-5 space-y-1">
                {/* Practice Reminder toggle */}
                <ToggleRow
                  label="Practice Reminder"
                  description="Get a daily reminder to practice"
                  checked={prefs.practiceReminder}
                  onCheckedChange={(v) => savePrefs({ practiceReminder: v })}
                />

                <SettingDivider />

                {/* Reminder Time */}
                <div className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="t-body-sm text-[var(--text-primary)]">Reminder Time</p>
                    <p className="t-caption text-[var(--text-faint)] mt-0.5">
                      When to send your daily practice reminder
                    </p>
                  </div>
                  <Input
                    type="time"
                    value={prefs.reminderTime ?? '08:00'}
                    disabled={!prefs.practiceReminder}
                    onChange={(e) => savePrefs({ reminderTime: e.target.value })}
                    className="bg-[var(--bg-raised)] border-[var(--border-default)] rounded-[10px] h-10 w-32"
                  />
                </div>

                <SettingDivider />

                {/* Phase 2 note */}
                <div className="py-3">
                  <div className="rounded-[10px] bg-[var(--bg-raised)] p-3.5 border border-[var(--border-subtle)]">
                    <p className="t-body-sm text-[var(--text-tertiary)]">
                      <span className="text-[var(--ink-300)] font-medium">💡 Phase 2</span>
                      {' — '}Browser push notifications are coming in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ KEYBOARD SHORTCUTS ━━━ */}
          {activeSection === 'shortcuts' && (
            <SectionCard>
              <SectionHeader title="Keyboard Shortcuts" icon={Keyboard} />
              <div className="p-5 space-y-4">
                <p className="t-body-sm text-[var(--text-tertiary)]">
                  Use these shortcuts during practice and test sessions for faster navigation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Practice shortcuts */}
                  <div className="rounded-[10px] border border-[var(--border-subtle)] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-raised)]">
                      <h4 className="t-caption text-[var(--text-faint)] font-semibold uppercase tracking-wider">
                        Practice
                      </h4>
                    </div>
                    <ShortcutTable shortcuts={PRACTICE_SHORTCUTS} />
                  </div>

                  {/* Test shortcuts */}
                  <div className="rounded-[10px] border border-[var(--border-subtle)] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-raised)]">
                      <h4 className="t-caption text-[var(--text-faint)] font-semibold uppercase tracking-wider">
                        Test
                      </h4>
                    </div>
                    <ShortcutTable shortcuts={TEST_SHORTCUTS} />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ DATA & PRIVACY ━━━ */}
          {activeSection === 'privacy' && (
            <SectionCard>
              <SectionHeader title="Data & Privacy" icon={Shield} />
              <div className="p-5 space-y-5">
                {/* Export */}
                <div className="space-y-3">
                  <div>
                    <p className="t-body-sm text-[var(--text-primary)]">
                      Export All Data
                    </p>
                    <p className="t-caption text-[var(--text-faint)] mt-0.5">
                      Download a complete backup of all your data as JSON
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportData}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] t-body-sm font-medium transition-all duration-150 cursor-pointer border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </button>
                </div>

                <SettingDivider />

                {/* Destructive actions link */}
                <div className="rounded-[10px] bg-[var(--bg-raised)] p-4 border border-[var(--border-subtle)]">
                  <p className="t-body-sm text-[var(--text-tertiary)]">
                    For destructive actions such as resetting data or deleting your account,
                    visit your{' '}
                    <Link
                      href="/profile"
                      className="text-[var(--ink-400)] hover:text-[var(--ink-300)] underline underline-offset-2 transition-colors duration-150"
                    >
                      Profile page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ━━━ ABOUT ━━━ */}
          {activeSection === 'about' && (
            <SectionCard>
              <SectionHeader title="About" icon={Info} />
              <div className="p-5 space-y-5">
                {/* Version badge */}
                <div>
                  <span className="t-mono text-xs bg-[var(--ink-800)] text-[var(--gold-400)] px-2.5 py-1 rounded-[6px] border border-[var(--ink-700)]">
                    v{APP_VERSION}
                  </span>
                </div>

                <SettingDivider />

                {/* Tech stack */}
                <div className="space-y-1">
                  <p className="t-body-sm text-[var(--text-secondary)]">
                    Built with Next.js 16, TypeScript, Tailwind CSS, IndexedDB, and Framer
                    Motion.
                  </p>
                </div>

                <SettingDivider />

                {/* Developer */}
                <div className="space-y-1">
                  <p className="t-body-sm text-[var(--text-primary)] font-medium">
                    Developed by Abhishek Shah
                  </p>
                </div>

                <SettingDivider />

                {/* Links */}
                <div className="space-y-2.5">
                  <a
                    href="https://abhishekshah.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 t-body-sm text-[var(--ink-400)] hover:text-[var(--ink-300)] transition-colors duration-150"
                  >
                    abhishekshah.vercel.app
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://github.com/abhiverse01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 t-body-sm text-[var(--ink-400)] hover:text-[var(--ink-300)] transition-colors duration-150"
                  >
                    github.com/abhiverse01
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="mailto:abhishek.aimarine@gmail.com"
                    className="flex items-center gap-1.5 t-body-sm text-[var(--ink-400)] hover:text-[var(--ink-300)] transition-colors duration-150"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    abhishek.aimarine@gmail.com
                  </a>
                </div>

                <SettingDivider />

                {/* Report bug */}
                <div>
                  <a
                    href="mailto:abhishek.aimarine@gmail.com?subject=Bug Report — AkalLoksewa"
                    className="inline-flex items-center gap-1.5 t-body-sm font-medium text-[var(--ink-400)] hover:text-[var(--ink-300)] transition-colors duration-150"
                  >
                    Report a bug
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ─── Mobile: iOS-style list layout ─── */}
        <div className="md:hidden space-y-6">
          {/* ━━━ ACCOUNT ━━━ */}
          {activeSection === 'account' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <User className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Account</span>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <UserAvatar displayName={user?.displayName ?? 'User'} avatarColor={user?.avatarColor ?? 'ink'} size="lg" showRing />
                <div className="min-w-0 flex-1">
                  <p className="t-body-sm font-medium text-[var(--text-primary)] truncate">{user?.displayName ?? 'User'}</p>
                  <p className="t-caption text-[var(--text-faint)] truncate">@{user?.username ?? 'user'}</p>
                </div>
              </div>
              <SettingRow label="Edit Profile" onClick={() => window.location.href = '/profile'} />
            </div>
          )}

          {/* ━━━ APPEARANCE ━━━ */}
          {activeSection === 'appearance' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Palette className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Appearance</span>
              </div>
              <SettingRow label="Theme" value={theme.charAt(0).toUpperCase() + theme.slice(1)} onClick={() => { const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'; handleThemeChange(next as 'dark'|'light'|'system'); }} />
              <SettingRow label="Font Size" value={prefs.fontSize === 'large' ? 'Large' : 'Normal'} onClick={() => savePrefs({ fontSize: prefs.fontSize === 'normal' ? 'large' : 'normal' })} />
              <SettingRow label="Option Labels" value={prefs.optionLabelStyle === 'devanagari' ? 'क ख ग घ' : 'A B C D'} onClick={() => savePrefs({ optionLabelStyle: prefs.optionLabelStyle === 'latin' ? 'devanagari' : 'latin' })} />
            </div>
          )}

          {/* ━━━ STUDY PREFERENCES ━━━ */}
          {activeSection === 'study' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <BookOpen className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Study Preferences</span>
              </div>
              <SettingRow label="Show Explanation" value={prefs.showExplanationInPractice === 'immediate' ? 'Immediately' : prefs.showExplanationInPractice === 'after-next' ? 'After Next' : 'Manual'} onClick={() => { const modes = ['immediate','after-next','manual'] as const; const i = modes.indexOf(prefs.showExplanationInPractice); savePrefs({ showExplanationInPractice: modes[(i+1)%3] }); }} />
              <SettingRowToggle label="Auto-advance to next question" description="Automatically go to the next question after answering" checked={prefs.autoAdvance} onCheckedChange={(v) => savePrefs({ autoAdvance: v })} />
              <SettingRowToggle label="Keyboard hints" description="Show keyboard shortcut hints on option buttons" checked={prefs.showKeyboardHints} onCheckedChange={(v) => savePrefs({ showKeyboardHints: v })} />
              <SettingRow label="Default Question Count" value={`${prefs.defaultQuestionCount} questions`} onClick={() => savePrefs({ defaultQuestionCount: prefs.defaultQuestionCount >= 50 ? 10 : prefs.defaultQuestionCount + 10 })} />
              <SettingRow label="Default Test Duration" value={`${prefs.defaultTestDuration} min`} onClick={() => savePrefs({ defaultTestDuration: prefs.defaultTestDuration >= 60 ? 10 : prefs.defaultTestDuration + 10 })} />
            </div>
          )}

          {/* ━━━ TEST ENGINE ━━━ */}
          {activeSection === 'test-engine' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <FlaskConical className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Test Engine</span>
              </div>
              <SettingRowToggle label="Negative Marking" description="Deduct marks for incorrect answers" checked={prefs.negativeMarkingEnabled} onCheckedChange={(v) => savePrefs({ negativeMarkingEnabled: v })} />
              {prefs.negativeMarkingEnabled && (
                <SettingRow label="Negative Mark Value" value={`${prefs.negativeMarkValue}`} onClick={() => savePrefs({ negativeMarkValue: prefs.negativeMarkValue >= 0.5 ? 0.125 : +(prefs.negativeMarkValue + 0.125).toFixed(3) })} />
              )}
              <SettingRowToggle label="Shuffle Questions" description="Randomize question order in tests" checked={prefs.shuffleQuestions ?? true} onCheckedChange={(v) => savePrefs({ shuffleQuestions: v })} />
              <SettingRowToggle label="Shuffle Options" description="Randomize answer option order per question" checked={prefs.shuffleOptions ?? true} onCheckedChange={(v) => savePrefs({ shuffleOptions: v })} />
            </div>
          )}

          {/* ━━━ NOTIFICATIONS ━━━ */}
          {activeSection === 'notifications' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Bell className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Notifications</span>
              </div>
              <SettingRowToggle label="Practice Reminder" description="Get a daily reminder to practice" checked={prefs.practiceReminder} onCheckedChange={(v) => savePrefs({ practiceReminder: v })} />
              {prefs.practiceReminder && (
                <SettingRow label="Reminder Time" value={prefs.reminderTime ?? '08:00'} onClick={() => { const h = parseInt((prefs.reminderTime ?? '08:00').split(':')[0]); const next = `${String((h+1)%24).padStart(2,'0')}:00`; savePrefs({ reminderTime: next }); }} />
              )}
            </div>
          )}

          {/* ━━━ KEYBOARD SHORTCUTS ━━━ */}
          {activeSection === 'shortcuts' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Keyboard className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Keyboard Shortcuts</span>
              </div>
              <div className="px-4 py-3">
                <p className="t-caption text-[var(--text-faint)] mb-3">Use these shortcuts during practice and test sessions.</p>
                <div className="space-y-1">
                  {[...PRACTICE_SHORTCUTS, ...TEST_SHORTCUTS].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <kbd className="t-mono text-[11px] bg-[var(--bg-sunken)] text-[var(--text-secondary)] px-2 py-0.5 rounded-[5px] border border-[var(--border-subtle)] font-medium">{s.key}</kbd>
                      <span className="t-body-sm text-[var(--text-secondary)] ml-3">{s.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ DATA & PRIVACY ━━━ */}
          {activeSection === 'privacy' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Shield className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">Data & Privacy</span>
              </div>
              <SettingRow label="Export All Data" onClick={exportData} />
              <SettingRow label="Reset Study Data" onClick={() => window.location.href = '/profile'} />
              <SettingRow label="Delete Account" onClick={() => window.location.href = '/profile'} />
            </div>
          )}

          {/* ━━━ ABOUT ━━━ */}
          {activeSection === 'about' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2.5 bg-[var(--bg-raised)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Info className="h-4 w-4 text-[var(--ink-300)]" />
                <span className="t-caption font-semibold uppercase tracking-wider text-[var(--text-faint)]">About</span>
              </div>
              <div className="px-4 py-3 space-y-0">
                <SettingRow label="Version" value={`v${APP_VERSION}`} chevron={false} />
                <SettingRow label="Developer" value="Abhishek Shah" chevron={false} />
                <SettingRow label="Website" value="abhishekshah.vercel.app" onClick={() => window.open('https://abhishekshah.vercel.app', '_blank')} />
                <SettingRow label="GitHub" value="github.com/abhiverse01" onClick={() => window.open('https://github.com/abhiverse01', '_blank')} />
                <SettingRow label="Contact" value="abhishek.aimarine@gmail.com" onClick={() => window.location.href = 'mailto:abhishek.aimarine@gmail.com'} />
                <SettingRow label="Report a Bug" onClick={() => window.location.href = 'mailto:abhishek.aimarine@gmail.com?subject=Bug Report — AkalLoksewa'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
