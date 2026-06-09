/**
 * Normalizer — Text normalization
 * Handles whitespace, OCR artifacts, Devanagari NFC normalization,
 * zero-width characters, and standardizes answer format
 */

import type { Question, Option } from '@/types/question'

// ─── Devanagari Handling ────────────────────────────────────────────

/** NFC-normalize Devanagari text to canonical form */
function nfcNormalize(text: string): string {
  return text.normalize('NFC')
}

/** Remove zero-width characters and invisible Unicode */
function removeZeroWidth(text: string): string {
  return text
    .replace(/[\u200B\u200C\u200D\u200E\u200F\u2060\u2061\u2062\u2063\u2064\uFEFF]/g, '')
    .replace(/[\u00AD]/g, '')  // Soft hyphen
}

// ─── OCR Artifact Cleanup ───────────────────────────────────────────

const OCR_FIXES: [RegExp, string][] = [
  [/\bl\b/g, 'I'],                // Lowercase l → I in certain contexts
  [/\b0\b(?=\s*[a-z])/g, 'o'],   // 0 → o before lowercase
  [/\s{2,}/g, ' '],               // Multiple spaces
  [/[\r\n]+/g, '\n'],             // Multiple newlines
  [/\t+/g, ' '],                  // Tabs
  [/\u00A0/g, ' '],               // Non-breaking space
  [/[''']/g, "'"],                // Smart quotes
  [/[""\u201C\u201D„]/g, '"'],    // Smart double quotes
  [/[\u2013\u2014]/g, '-'],       // Em/en dashes
  [/\u2026/g, '...'],             // Ellipsis
]

function fixOcrArtifacts(text: string): string {
  let result = text
  for (const [pattern, replacement] of OCR_FIXES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// ─── Text Normalization ─────────────────────────────────────────────

/** Capitalize first letter of text */
function capitalizeFirst(text: string): string {
  if (!text) return text
  // For Devanagari, no uppercase concept — return as-is
  if (/[क-्ह]/.test(text[0])) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Normalize whitespace throughout */
function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

/** Remove trailing periods and punctuation from options */
function cleanOptionText(text: string): string {
  return text
    .trim()
    .replace(/[.,;:]+$/, '')
    .replace(/^\s*[a-dA-D][\.\)]\s*/, '')  // Remove leading option letter
    .trim()
}

/** Standardize option IDs to A, B, C, D, E */
function standardizeOptionId(id: string): string {
  const nepaliMap: Record<string, string> = {
    'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D', 'ङ': 'E',
    'अ': 'A', 'आ': 'B', 'इ': 'C', 'ई': 'D',
  }
  return nepaliMap[id] || id.toUpperCase().charAt(0)
}

// ─── Main Normalize Function ────────────────────────────────────────

export function normalizeQuestion(question: Partial<Question>): Partial<Question> {
  if (!question.text && !question.options) return question

  const normalized: Partial<Question> = { ...question }

  // Normalize question text
  if (question.text) {
    let text = question.text
    text = nfcNormalize(text)
    text = removeZeroWidth(text)
    text = fixOcrArtifacts(text)
    text = normalizeWhitespace(text)
    text = capitalizeFirst(text)
    // Remove trailing punctuation from question stem
    text = text.replace(/[.!?]+$/, '')
    // Ensure question mark at end if missing and it looks like a question
    if (!text.endsWith('?') && !text.endsWith('।') && !/[क-्ह]$/g.test(text)) {
      text += '?'
    }
    normalized.text = text
  }

  // Normalize options
  if (question.options) {
    normalized.options = question.options.map((opt, index) => {
      let text = opt.text
      text = nfcNormalize(text)
      text = removeZeroWidth(text)
      text = fixOcrArtifacts(text)
      text = cleanOptionText(text)

      const standardizedId = index < 5
        ? String.fromCharCode(65 + index)
        : opt.id

      return {
        id: standardizedId,
        text,
        isCorrect: opt.isCorrect,
      }
    })
  }

  // Normalize explanation
  if (question.explanation) {
    let exp = question.explanation
    exp = nfcNormalize(exp)
    exp = removeZeroWidth(exp)
    exp = fixOcrArtifacts(exp)
    exp = normalizeWhitespace(exp)
    normalized.explanation = exp
  }

  // Normalize tags
  if (question.tags) {
    normalized.tags = question.tags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
  }

  return normalized
}

/** Normalize a standalone option */
export function normalizeOption(option: Option, index: number): Option {
  let text = option.text
  text = nfcNormalize(text)
  text = removeZeroWidth(text)
  text = fixOcrArtifacts(text)
  text = cleanOptionText(text)

  return {
    id: String.fromCharCode(65 + index),
    text,
    isCorrect: option.isCorrect,
  }
}

/** Full text normalization for fingerprinting/comparison */
export function normalizeForComparison(text: string): string {
  let result = text.toLowerCase()
  result = nfcNormalize(result)
  result = removeZeroWidth(result)
  result = fixOcrArtifacts(result)
  // Remove all punctuation
  result = result.replace(/[.,;:!?'"()\-\[\]{}\/\\@#$%^&*+=<>~`]/g, ' ')
  // Remove digits
  result = result.replace(/\d+/g, '')
  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim()
  return result
}
