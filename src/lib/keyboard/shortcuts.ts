/**
 * Keyboard Shortcuts Registry
 *
 * Central definition of all keyboard shortcuts for the application.
 * Organised by context so that only relevant shortcuts are active
 * in any given view.
 */

export type ShortcutContext = 'global' | 'practice' | 'test' | 'notes' | 'ingestor'

export type ShortcutGroup = 'navigation' | 'action' | 'formatting' | 'goto'

export interface Shortcut {
  /** Key identifier (e.g. 'k', 'Escape', '1'–'4') */
  key: string
  /** Modifier keys required (all must be pressed) */
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]
  /** Human-readable description for the help overlay */
  description: string
  /** Which context this shortcut belongs to */
  context: ShortcutContext | ShortcutContext[]
  /** Unique action identifier used by the handler registry */
  action: string
  /** Visual grouping in the help overlay */
  group: ShortcutGroup
}

/**
 * Master shortcuts list.
 * The `context` field may be an array when a shortcut applies in multiple views.
 */
export const SHORTCUTS: Shortcut[] = [
  // ── Global ──────────────────────────────────────────────
  {
    key: 'k',
    modifiers: ['ctrl'],
    description: 'Open command palette',
    context: 'global',
    action: 'global.search',
    group: 'navigation',
  },
  {
    key: '/',
    description: 'Open command palette (alternative)',
    context: 'global',
    action: 'global.search',
    group: 'navigation',
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts help',
    context: 'global',
    action: 'global.help',
    group: 'action',
  },
  {
    key: 'Escape',
    description: 'Close dialog / exit mode',
    context: 'global',
    action: 'global.escape',
    group: 'action',
  },
  {
    key: 'g',
    description: 'Enter goto mode (press G, then target key)',
    context: 'global',
    action: 'global.goto-prefix',
    group: 'goto',
  },

  // ── Goto targets (active after pressing G) ─────────────
  {
    key: 'd',
    description: 'Goto Dashboard',
    context: 'global',
    action: 'goto.dashboard',
    group: 'goto',
  },
  {
    key: 'p',
    description: 'Goto Practice',
    context: 'global',
    action: 'goto.practice',
    group: 'goto',
  },
  {
    key: 't',
    description: 'Goto Test',
    context: 'global',
    action: 'goto.test',
    group: 'goto',
  },
  {
    key: 'a',
    description: 'Goto Analytics',
    context: 'global',
    action: 'goto.analytics',
    group: 'goto',
  },
  {
    key: 'n',
    description: 'Goto Notes',
    context: 'global',
    action: 'goto.notes',
    group: 'goto',
  },
  {
    key: 's',
    description: 'Goto Settings',
    context: 'global',
    action: 'goto.settings',
    group: 'goto',
  },

  // ── Practice ───────────────────────────────────────────
  {
    key: '1',
    description: 'Select option A',
    context: 'practice',
    action: 'practice.select-a',
    group: 'action',
  },
  {
    key: '2',
    description: 'Select option B',
    context: 'practice',
    action: 'practice.select-b',
    group: 'action',
  },
  {
    key: '3',
    description: 'Select option C',
    context: 'practice',
    action: 'practice.select-c',
    group: 'action',
  },
  {
    key: '4',
    description: 'Select option D',
    context: 'practice',
    action: 'practice.select-d',
    group: 'action',
  },
  {
    key: 'ArrowRight',
    description: 'Next question',
    context: 'practice',
    action: 'practice.next',
    group: 'navigation',
  },
  {
    key: 'ArrowLeft',
    description: 'Previous question',
    context: 'practice',
    action: 'practice.prev',
    group: 'navigation',
  },
  {
    key: 'b',
    description: 'Toggle bookmark',
    context: 'practice',
    action: 'practice.bookmark',
    group: 'action',
  },
  {
    key: 'e',
    description: 'Toggle explanation',
    context: 'practice',
    action: 'practice.explanation',
    group: 'action',
  },
  {
    key: 'f',
    description: 'Flag question',
    context: 'practice',
    action: 'practice.flag',
    group: 'action',
  },
  {
    key: 'l',
    description: 'Toggle language',
    context: 'practice',
    action: 'practice.language',
    group: 'action',
  },

  // ── Test ────────────────────────────────────────────────
  {
    key: 'm',
    description: 'Mark current question for review',
    context: 'test',
    action: 'test.mark-review',
    group: 'action',
  },
  {
    key: 'n',
    description: 'Next question',
    context: 'test',
    action: 'test.next',
    group: 'navigation',
  },
  {
    key: 'p',
    description: 'Previous question',
    context: 'test',
    action: 'test.prev',
    group: 'navigation',
  },
  {
    key: 'Enter',
    description: 'Submit test / confirm action',
    context: 'test',
    action: 'test.submit',
    group: 'action',
  },
  // Options 1-4 also apply in test mode
  {
    key: '1',
    description: 'Select option A',
    context: ['practice', 'test'],
    action: 'practice.select-a',
    group: 'action',
  },
  {
    key: '2',
    description: 'Select option B',
    context: ['practice', 'test'],
    action: 'practice.select-b',
    group: 'action',
  },
  {
    key: '3',
    description: 'Select option C',
    context: ['practice', 'test'],
    action: 'practice.select-c',
    group: 'action',
  },
  {
    key: '4',
    description: 'Select option D',
    context: ['practice', 'test'],
    action: 'practice.select-d',
    group: 'action',
  },

  // ── Notes ───────────────────────────────────────────────
  {
    key: 'b',
    modifiers: ['ctrl'],
    description: 'Bold text',
    context: 'notes',
    action: 'notes.bold',
    group: 'formatting',
  },
  {
    key: 'i',
    modifiers: ['ctrl'],
    description: 'Italic text',
    context: 'notes',
    action: 'notes.italic',
    group: 'formatting',
  },
  {
    key: 'u',
    modifiers: ['ctrl'],
    description: 'Underline text',
    context: 'notes',
    action: 'notes.underline',
    group: 'formatting',
  },
  {
    key: 's',
    modifiers: ['ctrl'],
    description: 'Save note',
    context: 'notes',
    action: 'notes.save',
    group: 'action',
  },
]

// ── Helpers ──────────────────────────────────────────────

/**
 * Return only the shortcuts that match a given context.
 */
export function getShortcutsForContext(
  context: ShortcutContext,
): Shortcut[] {
  return SHORTCUTS.filter((s) => {
    if (Array.isArray(s.context)) return s.context.includes(context)
    return s.context === context
  })
}

/**
 * Check whether a shortcut definition matches a keyboard event
 * (key + modifiers).
 */
export function shortcutMatches(
  shortcut: Shortcut,
  key: string,
  ctrl: boolean,
  shift: boolean,
  alt: boolean,
  meta: boolean,
): boolean {
  if (shortcut.key !== key) return false
  const required = shortcut.modifiers ?? []
  if (required.includes('ctrl') !== ctrl) return false
  if (required.includes('shift') !== shift) return false
  if (required.includes('alt') !== alt) return false
  if (required.includes('meta') !== meta) return false
  return true
}

/**
 * Human-readable label for a modifier combination.
 */
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = []
  if (shortcut.modifiers?.includes('ctrl')) parts.push('Ctrl')
  if (shortcut.modifiers?.includes('shift')) parts.push('Shift')
  if (shortcut.modifiers?.includes('alt')) parts.push('Alt')
  if (shortcut.modifiers?.includes('meta')) parts.push('⌘')
  parts.push(shortcut.key.length > 1 ? shortcut.key : shortcut.key.toUpperCase())
  return parts.join(' + ')
}
