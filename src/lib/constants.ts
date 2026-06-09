import type { LoksewaSubject } from '@/types/question'

export interface SubjectInfo {
  id: LoksewaSubject
  label: string
  labelEn: string
  icon: string
  color: string
  chapters: string[]
}

export const LOKSEWA_SUBJECTS: SubjectInfo[] = [
  {
    id: 'nepali',
    label: 'नेपाली भाषा',
    labelEn: 'Nepali Language',
    icon: 'BookA',
    color: 'emerald',
    chapters: ['व्याकरण', 'साहित्य', 'निबन्ध', 'पत्र लेखन', 'अनुवाद'],
  },
  {
    id: 'english',
    label: 'English',
    labelEn: 'English Language',
    icon: 'Languages',
    color: 'blue',
    chapters: ['Grammar', 'Vocabulary', 'Comprehension', 'Writing', 'Translation'],
  },
  {
    id: 'general-knowledge',
    label: 'सामान्य ज्ञान',
    labelEn: 'General Knowledge',
    icon: 'Globe',
    color: 'purple',
    chapters: ['Nepal GK', 'World GK', 'Sports', 'Awards', 'Organizations'],
  },
  {
    id: 'current-affairs',
    label: 'समसामयिक',
    labelEn: 'Current Affairs',
    icon: 'Newspaper',
    color: 'orange',
    chapters: ['National', 'International', 'Economy', 'Sports', 'Science'],
  },
  {
    id: 'constitution',
    label: 'संविधान',
    labelEn: 'Constitution of Nepal',
    icon: 'Scale',
    color: 'red',
    chapters: [
      'प्रस्तावना', 'मौलिक हक', 'राज्यको निर्देशक सिद्धान्त',
      'संसद', 'कार्यपालिका', 'न्यायपालिका', 'स्थानीय सरकार',
      'निर्वाचन आयोग', 'लोकसेवा आयोग', 'संवैधानिक अंगहरू',
    ],
  },
  {
    id: 'governance',
    label: 'शासन प्रणाली',
    labelEn: 'Governance',
    icon: 'Landmark',
    color: 'indigo',
    chapters: ['लोकसेवा', 'निजामती सेवा', 'संघीय संरचना', 'विकास योजना', 'शासन व्यवस्था'],
  },
  {
    id: 'mathematics',
    label: 'गणित',
    labelEn: 'Mathematics',
    icon: 'Calculator',
    color: 'cyan',
    chapters: ['Algebra', 'Geometry', 'Statistics', 'Trigonometry', 'Probability'],
  },
  {
    id: 'science-technology',
    label: 'विज्ञान तथा प्रविधि',
    labelEn: 'Science & Technology',
    icon: 'Atom',
    color: 'teal',
    chapters: ['Physics', 'Chemistry', 'Biology', 'IT', 'Innovation'],
  },
  {
    id: 'geography',
    label: 'भूगोल',
    labelEn: 'Geography',
    icon: 'Mountain',
    color: 'green',
    chapters: ['Physical', 'Human', 'Nepal Geography', 'World Geography', 'Climate'],
  },
  {
    id: 'history',
    label: 'इतिहास',
    labelEn: 'History',
    icon: 'ScrollText',
    color: 'amber',
    chapters: ['Ancient Nepal', 'Medieval Nepal', 'Modern Nepal', 'World History', 'Revolution'],
  },
  {
    id: 'economics',
    label: 'अर्थशास्त्र',
    labelEn: 'Economics',
    icon: 'TrendingUp',
    color: 'rose',
    chapters: ['Macro', 'Micro', 'Nepal Economy', 'Development', 'Trade'],
  },
  {
    id: 'law',
    label: 'कानून',
    labelEn: 'Law',
    icon: 'Gavel',
    color: 'slate',
    chapters: ['Constitutional Law', 'Civil Law', 'Criminal Law', 'Administrative Law', 'International Law'],
  },
  {
    id: 'public-administration',
    label: 'लोक प्रशासन',
    labelEn: 'Public Administration',
    icon: 'Building',
    color: 'violet',
    chapters: ['Principles', 'Organization', 'Personnel', 'Financial', 'Development Admin'],
  },
  {
    id: 'ethics',
    label: 'नैतिकता',
    labelEn: 'Ethics',
    icon: 'HeartHandshake',
    color: 'pink',
    chapters: ['Moral Philosophy', 'Professional Ethics', 'Corruption', 'Accountability', 'Integrity'],
  },
  {
    id: 'computer-it',
    label: 'कम्प्युटर तथा IT',
    labelEn: 'Computer & IT',
    icon: 'Monitor',
    color: 'sky',
    chapters: ['Hardware', 'Software', 'Networking', 'Database', 'Security'],
  },
  {
    id: 'environment',
    label: 'वातावरण',
    labelEn: 'Environment',
    icon: 'Leaf',
    color: 'lime',
    chapters: ['Ecology', 'Pollution', 'Conservation', 'Climate Change', 'Policy'],
  },
  {
    id: 'social-development',
    label: 'सामाजिक विकास',
    labelEn: 'Social Development',
    icon: 'Users',
    color: 'fuchsia',
    chapters: ['Education', 'Health', 'Gender', 'Inclusion', 'Poverty'],
  },
]

export const SUBJECT_MAP = Object.fromEntries(
  LOKSEWA_SUBJECTS.map((s) => [s.id, s])
) as Record<LoksewaSubject, SubjectInfo>

export const DIFFICULTY_LABELS: Record<string, { label: string; labelNe: string; color: string; dots: number }> = {
  easy: { label: 'Easy', labelNe: 'सजिलो', color: 'text-green-400 bg-green-500/15', dots: 1 },
  medium: { label: 'Medium', labelNe: 'मध्यम', color: 'text-amber-400 bg-amber-500/15', dots: 2 },
  hard: { label: 'Hard', labelNe: 'गाह्रो', color: 'text-red-400 bg-red-500/15', dots: 3 },
  'very-hard': { label: 'Very Hard', labelNe: 'अति गाह्रो', color: 'text-red-400 bg-red-500/15', dots: 3 },
}

/** Subtle ambient glow colors per subject — used with `--ambient-color` CSS custom property */
export const SUBJECT_AMBIENT_COLORS: Record<string, string> = {
  constitution:      'rgba(220, 60, 60, 0.07)',
  nepali:            'rgba(52, 211, 153, 0.07)',
  english:           'rgba(96, 165, 250, 0.07)',
  'general-knowledge': 'rgba(168, 85, 247, 0.07)',
  'current-affairs': 'rgba(251, 146, 60, 0.07)',
  mathematics:       'rgba(34, 211, 238, 0.07)',
  governance:        'rgba(37, 64, 160, 0.07)',
  'science-technology': 'rgba(45, 212, 191, 0.07)',
  geography:         'rgba(74, 222, 128, 0.07)',
  history:           'rgba(251, 191, 36, 0.07)',
  economics:         'rgba(251, 113, 133, 0.07)',
  law:               'rgba(148, 163, 184, 0.07)',
  'public-administration': 'rgba(196, 181, 253, 0.07)',
  ethics:            'rgba(249, 168, 212, 0.07)',
  'computer-it':     'rgba(125, 211, 252, 0.07)',
  environment:       'rgba(163, 230, 53, 0.07)',
  'social-development': 'rgba(232, 121, 249, 0.07)',
}

export const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  constitution: { bg: 'bg-red-500/15', text: 'text-red-400' },
  nepali: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  english: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'general-knowledge': { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  'current-affairs': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  mathematics: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  governance: { bg: 'bg-ink-500/20', text: 'text-ink-200' },
  'science-technology': { bg: 'bg-teal-500/15', text: 'text-teal-400' },
  geography: { bg: 'bg-green-500/15', text: 'text-green-400' },
  history: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  economics: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  law: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  'public-administration': { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  ethics: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  'computer-it': { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  environment: { bg: 'bg-lime-500/15', text: 'text-lime-400' },
  'social-development': { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
}

export const PSC_EXAM_DATE = {
  label: 'PSC Exam',
  dateBS: 'पुष १५, २०८२ BS',
  /** Computed dynamically at call sites */
  _examDate: new Date('2026-01-29'),
  get daysRemaining() {
    return Math.max(0, Math.ceil((this._examDate.getTime() - Date.now()) / 86400000))
  },
}

export const DEVANAGARI_OPTIONS = ['क', 'ख', 'ग', 'घ']

export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+K', context: 'Global', action: 'Open search command palette' },
  { key: 'Ctrl+B', context: 'Practice/Test', action: 'Bookmark question' },
  { key: '1–4', context: 'Practice/Test', action: 'Select option A–D' },
  { key: '→ / L', context: 'Practice', action: 'Next question' },
  { key: '← / H', context: 'Practice', action: 'Previous question' },
  { key: 'E', context: 'Practice', action: 'Toggle explanation' },
  { key: 'M', context: 'Test', action: 'Mark for review' },
  { key: 'P', context: 'Test', action: 'Pause test' },
  { key: '?', context: 'Global', action: 'Show keyboard shortcuts panel' },
  { key: 'Escape', context: 'Global', action: 'Close modal/dialog' },
]

export const APP_NAME = 'AkalLoksewa'
export const APP_TAGLINE = "Nepal's most powerful Loksewa preparation platform"
export const APP_VERSION = '1.0.0'
