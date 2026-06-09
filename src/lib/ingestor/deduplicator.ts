/**
 * Deduplicator — Duplicate detection engine
 * Uses fingerprinting with sorted bigrams and Jaccard similarity
 */

import type { ParsedQuestion, DuplicateReport } from '@/types/ingestor'
import type { Question } from '@/types/question'
import { normalizeForComparison } from './normalizer'

// ─── Nepali + English Stopwords ─────────────────────────────────────

const STOPWORDS = new Set([
  // English
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'must', 'ought',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too',
  'very', 'just', 'about', 'and', 'but', 'or', 'nor', 'if', 'it',
  'its', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
  'whom', 'their', 'they', 'them', 'we', 'our', 'you', 'your',
  'i', 'me', 'my', 'he', 'him', 'his', 'she', 'her',
  // Nepali
  'हो', 'छ', 'थियो', 'थिएन', 'हुन', 'हुन्छ', 'हुन्छन्', 'को', 'का', 'की',
  'के', 'मा', 'ले', 'देखि', 'सम्म', 'पनि', 'र', 'अनि', 'तर', 'किन्कि',
  'जुन', 'त्यो', 'यो', 'यी', 'ती', 'उनी', 'उनको', 'हामी', 'हाम्रो',
  'तपाईं', 'तिमी', 'म', 'मेरो', 'उ', 'उनले', 'यस्तो', 'त्यस्तो', 'कुन',
  'कुनै', 'जति', 'जस्तै', 'जस्तो', 'नै', 'पछि', 'अघि', 'भित्र', 'बाहिर',
  'माथि', 'तल', 'अनुसार', 'लागि', 'बाट', 'बीच', 'वरिपरि', 'सँग',
  'विना', 'न', 'अरु', 'केही', 'धेरै', 'कम', 'सबै', 'कोही', 'जो',
  'जे', 'किन', 'कहाँ', 'कति', 'कहिले', 'कसरी', 'कुन', 'गरी', 'गर्दै',
  'हुने', 'गरेको', 'गर्न', 'भन्न', 'थप', 'अझ', 'एक', 'दुई', 'तीन',
  'चार', 'पाँच',
])

// ─── Fingerprinting ─────────────────────────────────────────────────

/** Create a fingerprint from text: normalize → remove stopwords → sorted bigrams → hash */
export function fingerprint(text: string): string {
  const normalized = normalizeForComparison(text)

  // Remove stopwords
  const words = normalized.split(/\s+/).filter((w) => !STOPWORDS.has(w))

  if (words.length < 2) return normalized

  // Create sorted bigrams
  const bigrams: string[] = []
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]}:${words[i + 1]}`)
  }
  bigrams.sort()

  // Create a deterministic string hash
  const combined = bigrams.join('|')

  // Simple hash function (FNV-1a inspired)
  let hash = 2166136261
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// ─── Similarity Computation ─────────────────────────────────────────

/** Jaccard similarity on word sets */
function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = new Set(normalizeForComparison(text1).split(/\s+/))
  const set2 = new Set(normalizeForComparison(text2).split(/\s+/))

  if (set1.size === 0 && set2.size === 0) return 1
  if (set1.size === 0 || set2.size === 0) return 0

  let intersection = 0
  for (const word of set1) {
    if (set2.has(word)) intersection++
  }

  const union = set1.size + set2.size - intersection
  return union > 0 ? intersection / union : 0
}

// ─── Duplicate Detection ───────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.85

/**
 * Find duplicates among parsed questions and against existing DB questions.
 *
 * NOTE: This function uses O(n²) pairwise comparison (nested loops) for
 * Jaccard similarity checks. This is acceptable for Phase 1 batch sizes
 * (<1000 questions) where the quadratic cost is negligible. For larger
 * datasets (10k+ questions), this should be replaced with a MinHash or
 * LSH-based approximate similarity index to reduce complexity to O(n log n).
 */
export function findDuplicates(
  parsedQuestions: ParsedQuestion[],
  existingDB: (Question | ParsedQuestion)[]
): DuplicateReport[] {
  const reports: DuplicateReport[] = []

  // Check new questions against each other
  for (let i = 0; i < parsedQuestions.length; i++) {
    for (let j = i + 1; j < parsedQuestions.length; j++) {
      const q1 = parsedQuestions[i]
      const q2 = parsedQuestions[j]

      const text1 = q1.parsedQuestion?.text || q1.rawText
      const text2 = q2.parsedQuestion?.text || q2.rawText

      const similarity = jaccardSimilarity(text1, text2)

      if (similarity >= SIMILARITY_THRESHOLD) {
        reports.push({ question1: q1, question2: q2, similarity })
      }
    }
  }

  // Check new questions against existing DB
  for (const parsed of parsedQuestions) {
    const newText = parsed.parsedQuestion?.text || parsed.rawText

    for (const existing of existingDB) {
      const existingText =
        'parsedQuestion' in existing
          ? (existing as ParsedQuestion).parsedQuestion?.text || existing.rawText
          : (existing as Question).text

      const similarity = jaccardSimilarity(newText, existingText)

      if (similarity >= SIMILARITY_THRESHOLD) {
        reports.push({ question1: parsed, question2: existing as ParsedQuestion, similarity })
      }
    }
  }

  return reports
}

/** Quick check if text is likely a duplicate of existing content */
export function isLikelyDuplicate(
  text: string,
  existingFingerprints: Map<string, string>
): boolean {
  const fp = fingerprint(text)
  return existingFingerprints.has(fp)
}

/** Build fingerprint index from existing questions */
export function buildFingerprintIndex(
  questions: (Question | ParsedQuestion)[]
): Map<string, string> {
  const index = new Map<string, string>()

  for (const q of questions) {
    const text = 'parsedQuestion' in q
      ? (q as ParsedQuestion).parsedQuestion?.text || q.rawText
      : (q as Question).text

    const fp = fingerprint(text)
    const id = 'tempId' in q ? q.tempId : q.id
    index.set(fp, id)
  }

  return index
}
