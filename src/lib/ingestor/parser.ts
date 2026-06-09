/**
 * Ingestor Parser — Multi-format text parser for Nepali Loksewa MCQ questions
 *
 * Supports all common formats:
 * - Numbered: "1." "1)" "Q.1"
 * - Latin options: a), b), c), d)
 * - Bracket options: (a) (b) (c) (d)
 * - Devanagari options: क. ख. ग. घ.
 * - Devanagari bracket options: (क) (ख) (ग) (घ)
 * - Answer markers: ans:, उत्तर:, correct:, सही जवाफ:
 * - Explanation markers: explanation:, व्याख्या:, reason:, explain:
 */

import { nanoid } from 'nanoid'
import type { InputFormat, RawQuestion } from '@/types/ingestor'
import type { Option } from '@/types/question'

// ─── RawQuestion Interface ─────────────────────────────────────────

export interface ParsedRawQuestion {
  tempId: string
  rawBlock: string
  questionText: string
  options: Option[]
  answerLabel: string | undefined
  explanationText: string | undefined
  lineStart: number
}

// ─── PATTERNS ───────────────────────────────────────────────────────

export const PATTERNS = {
  /** Matches numbered question starts: "1." "1)" "Q.1" "प्र." */
  questionStart: /^\s*(?:(?:प्र|Q|q)\s*\.?\s*)?(\d+)\s*[\.\)\-\:]\s*/,
  /** Matches Latin letter options: "a)" "b." "c)" "d." (with optional parentheses) */
  optionLatin: /^\s*([a-dA-D])\s*[\.\)]\s*(.*)/,
  /** Matches bracket Latin options: "(a)" "(b)" "(c)" "(d)" */
  optionBracket: /^\s*\(([a-dA-D])\)\s*(.*)/,
  /** Matches Devanagari letter options: "क." "ख." "ग." "घ." */
  optionDevanagari: /^\s*([क-घ])\s*[\.\)]\s*(.*)/,
  /** Matches bracket Devanagari options: "(क)" "(ख)" "(ग)" "(घ)" */
  optionDevBracket: /^\s*\(([क-घ])\)\s*(.*)/,
  /** Matches answer markers: "ans:" "उत्तर:" "correct:" "सही जवाफ:" */
  answer: /^(?:ans|answer|उत्तर|सही\s*जवाफ|सही\s*उत्तर|correct)\s*[\:\-\=]\s*([a-dA-Dक-घअ-ह]|\d+)/im,
  /** Matches explanation markers: "explanation:" "व्याख्या:" "reason:" "explain:" */
  explanation: /^(?:explanation|व्याख्या|विवरण|explain|reason|कारण|hint)\s*[\:\-\=]\s*([\s\S]*)/im,
  /** Matches standalone numbered question line */
  numberedLine: /^\s*(\d+)\s*[\.\)\-\:]\s*/,
  /** Pipe-delimited format marker */
  pipeDelimited: /[|｜]/,
} as const

// ─── Devanagari Letter Mapping ─────────────────────────────────────

const NEPALI_LETTER_MAP: Record<string, string> = {
  'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D', 'ङ': 'E',
  'अ': 'A', 'आ': 'B', 'इ': 'C', 'ई': 'D',
}

// ─── Format Detection ───────────────────────────────────────────────

export function detectFormat(text: string): InputFormat {
  const lines = text.split('\n').filter((l) => l.trim())
  if (!lines.length) return 'plain-paragraph'

  // Check for pipe-delimited first (explicit format marker)
  if (lines.some((l) => PATTERNS.pipeDelimited.test(l) && l.split(/[|｜]/).length >= 3)) {
    return 'pipe-delimited'
  }

  // Check for bracket-mcq: (a), (b), (c), (d)
  const bracketCount = lines.filter((l) => PATTERNS.optionBracket.test(l)).length
  if (bracketCount >= 2) return 'bracket-mcq'

  // Check for numbered-mcq: 1. 2. 3. etc.
  const numberedCount = lines.filter((l) => PATTERNS.numberedLine.test(l)).length
  if (numberedCount >= 2) return 'numbered-mcq'

  // Check for Nepali script with Nepali option letters: क. ख. ग. घ.
  const nepaliOptions = lines.filter((l) => PATTERNS.optionDevanagari.test(l)).length
  if (nepaliOptions >= 2) return 'nepali-script'

  // Check for bracket Devanagari: (क) (ख)
  const devBracketOptions = lines.filter((l) => PATTERNS.optionDevBracket.test(l)).length
  if (devBracketOptions >= 2) return 'nepali-script'

  // Check for Devanagari text content
  const devanagariLines = lines.filter((l) => /[क-्हँ-ः]/.test(l)).length
  if (devanagariLines > lines.length * 0.5) return 'nepali-script'

  // Check for letter-based options: a), b), c), d) or a. b. c. d.
  const letterOptions = lines.filter((l) => PATTERNS.optionLatin.test(l)).length
  if (letterOptions >= 2) {
    return 'mixed'
  }

  return 'plain-paragraph'
}

// ─── Block Parsing ─────────────────────────────────────────────────

/**
 * Parse an individual text block into a ParsedRawQuestion.
 * Handles all option formats, answer markers, and explanations.
 */
function parseBlock(block: string, lineStart: number): ParsedRawQuestion | null {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return null

  const options: Option[] = []
  let questionText = ''
  let answerLabel: string | undefined
  let explanationText: string | undefined
  const nonOptionLines: string[] = []

  for (const line of lines) {
    // Try each option pattern in order of specificity
    let matchedOption = false

    // Bracket Devanagari: (क) (ख)
    const devBracketMatch = line.match(PATTERNS.optionDevBracket)
    if (devBracketMatch) {
      const letter = NEPALI_LETTER_MAP[devBracketMatch[1]] || devBracketMatch[1].toUpperCase()
      const text = devBracketMatch[2].trim()
      if (text.length >= 1) {
        options.push({ id: letter, text, isCorrect: false })
        matchedOption = true
      }
    }

    // Bracket Latin: (a) (b) (c) (d)
    if (!matchedOption) {
      const bracketMatch = line.match(PATTERNS.optionBracket)
      if (bracketMatch) {
        const letter = bracketMatch[1].toUpperCase()
        const text = bracketMatch[2].trim()
        if (text.length >= 1) {
          options.push({ id: letter, text, isCorrect: false })
          matchedOption = true
        }
      }
    }

    // Devanagari: क. ख. ग. घ.
    if (!matchedOption) {
      const devMatch = line.match(PATTERNS.optionDevanagari)
      if (devMatch) {
        const letter = NEPALI_LETTER_MAP[devMatch[1]] || devMatch[1].toUpperCase()
        const text = devMatch[2].trim()
        if (text.length >= 1) {
          options.push({ id: letter, text, isCorrect: false })
          matchedOption = true
        }
      }
    }

    // Latin: a) b) c) d) or a. b. c. d.
    if (!matchedOption) {
      const latinMatch = line.match(PATTERNS.optionLatin)
      if (latinMatch) {
        const letter = latinMatch[1].toUpperCase()
        const text = latinMatch[2].trim()
        // Avoid matching "A. text" if it's a question number or very short
        if (text.length >= 1 && options.length > 0 || text.length >= 3) {
          options.push({ id: letter, text, isCorrect: false })
          matchedOption = true
        }
      }
    }

    if (!matchedOption) {
      // Check for answer marker
      const ansMatch = line.match(PATTERNS.answer)
      if (ansMatch) {
        let answer = ansMatch[1].toUpperCase()
        if (NEPALI_LETTER_MAP[answer]) {
          answer = NEPALI_LETTER_MAP[answer]
        }
        // If it was a number (1-based), convert to letter
        if (/^\d+$/.test(answer)) {
          const num = parseInt(answer)
          if (num >= 1 && num <= 5) {
            answer = String.fromCharCode(64 + num)
          }
        }
        answerLabel = answer
        continue
      }

      // Check for explanation marker
      const expMatch = line.match(PATTERNS.explanation)
      if (expMatch && expMatch[1].trim()) {
        explanationText = expMatch[1].trim()
        continue
      }

      nonOptionLines.push(line)
    }
  }

  // Build question text from non-option lines
  questionText = nonOptionLines
    .join(' ')
    // Remove question number prefix
    .replace(PATTERNS.questionStart, '')
    .trim()

  // Skip if question text is too short or no options found
  if (questionText.length < 3 && options.length === 0) return null

  // Re-index options with sequential IDs if they have gaps
  const reindexedOptions = options.map((opt, idx) => {
    const sequentialId = idx < 5 ? String.fromCharCode(65 + idx) : opt.id
    return { ...opt, id: sequentialId }
  })

  // Re-map answer label if needed
  if (answerLabel) {
    // Check if the answer corresponds to a reindexed option
    const answerIndex = options.findIndex((o) => o.id.toUpperCase() === answerLabel)
    if (answerIndex >= 0 && answerIndex < reindexedOptions.length) {
      answerLabel = reindexedOptions[answerIndex].id
    }
  }

  return {
    tempId: nanoid(10),
    rawBlock: block,
    questionText,
    options: reindexedOptions,
    answerLabel,
    explanationText,
    lineStart,
  }
}

// ─── Text Splitting by Question Numbers ────────────────────────────

function splitByQuestionNumbers(text: string): { blocks: string[]; lineMap: number[] } {
  const lines = text.split('\n')
  const blocks: string[] = []
  const lineMap: number[] = []
  let current = ''
  let currentLineStart = -1

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (PATTERNS.questionStart.test(trimmed) && current.trim()) {
      blocks.push(current.trim())
      lineMap.push(currentLineStart)
      current = lines[i]
      currentLineStart = i
    } else {
      if (!current.trim()) {
        currentLineStart = i
      }
      current += '\n' + lines[i]
    }
  }

  if (current.trim()) {
    blocks.push(current.trim())
    lineMap.push(currentLineStart >= 0 ? currentLineStart : 0)
  }

  return { blocks, lineMap }
}

// ─── Fallback: Split by Blank Lines ─────────────────────────────────

function splitByBlankLines(text: string): { blocks: string[]; lineMap: number[] } {
  const lines = text.split('\n')
  const blocks: string[] = []
  const lineMap: number[] = []
  let current = ''
  let currentLineStart = -1

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (trimmed === '' && current.trim()) {
      // End of block
      blocks.push(current.trim())
      lineMap.push(currentLineStart >= 0 ? currentLineStart : 0)
      current = ''
      currentLineStart = -1
    } else if (trimmed !== '') {
      if (currentLineStart < 0) {
        currentLineStart = i
      }
      current += '\n' + lines[i]
    }
  }

  if (current.trim()) {
    blocks.push(current.trim())
    lineMap.push(currentLineStart >= 0 ? currentLineStart : 0)
  }

  return { blocks, lineMap }
}

// ─── Pipe-Delimited Parser ──────────────────────────────────────────

function parsePipeDelimited(text: string): ParsedRawQuestion[] {
  const results: ParsedRawQuestion[] = []
  const lines = text.split('\n').filter((l) => l.trim())

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    const parts = line.split(/[|｜]/).map((p) => p.trim())
    if (parts.length < 3) continue

    const questionText = parts[0]
    const options: Option[] = []
    let answerLabel: string | undefined
    let explanationText: string | undefined

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]

      // Check if this part contains a Latin answer marker: "a: text" or "A* text"
      const latinAnsMatch = part.match(/^([a-dA-D])\s*[\:\*]\s*(.*)/)
      if (latinAnsMatch) {
        const letter = latinAnsMatch[1].toUpperCase()
        answerLabel = letter
        options.push({ id: letter, text: latinAnsMatch[2].trim(), isCorrect: false })
        continue
      }

      // Check if this part contains a Devanagari answer marker
      const devAnsMatch = part.match(/^([क-घ])\s*[\:\*]\s*(.*)/)
      if (devAnsMatch) {
        const letter = NEPALI_LETTER_MAP[devAnsMatch[1]] || devAnsMatch[1].toUpperCase()
        answerLabel = letter
        options.push({ id: letter, text: devAnsMatch[2].trim(), isCorrect: false })
        continue
      }

      // Regular option or explanation
      if (i <= 5) {
        const letter = String.fromCharCode(64 + i)
        options.push({ id: letter, text: part, isCorrect: false })
      } else {
        explanationText = part
      }
    }

    if (questionText.length < 3) continue

    results.push({
      tempId: nanoid(10),
      rawBlock: line,
      questionText,
      options,
      answerLabel,
      explanationText,
      lineStart: lineIdx,
    })
  }

  return results
}

// ─── Main Parser ────────────────────────────────────────────────────

/**
 * Parse raw text into an array of ParsedRawQuestion.
 *
 * Automatically detects format and applies the best parsing strategy.
 * Falls back to blank-line splitting if no clear question boundaries are found.
 */
export function parseText(rawText: string): ParsedRawQuestion[] {
  if (!rawText || !rawText.trim()) return []

  const format = detectFormat(rawText)

  // Pipe-delimited: each line is a complete question
  if (format === 'pipe-delimited') {
    return parsePipeDelimited(rawText)
  }

  // Try splitting by question numbers first
  const { blocks, lineMap } = splitByQuestionNumbers(rawText)

  // If splitting by numbers produced very few blocks, try blank-line splitting
  if (blocks.length <= 1) {
    const { blocks: blankBlocks, lineMap: blankLineMap } = splitByBlankLines(rawText)
    if (blankBlocks.length > blocks.length) {
      return blankBlocks
        .map((block, idx) => parseBlock(block, blankLineMap[idx] ?? 0))
        .filter((r): r is ParsedRawQuestion => r !== null)
    }
  }

  return blocks
    .map((block, idx) => parseBlock(block, lineMap[idx] ?? 0))
    .filter((r): r is ParsedRawQuestion => r !== null)
}

// ─── Convert ParsedRawQuestion to RawQuestion (legacy compat) ──────

export function toRawQuestion(parsed: ParsedRawQuestion, format: InputFormat): RawQuestion {
  return {
    rawText: parsed.rawBlock,
    questionText: parsed.questionText,
    options: parsed.options,
    correctAnswer: parsed.answerLabel,
    explanation: parsed.explanationText,
    format,
  }
}

// ─── Utility: Mark correct option ──────────────────────────────────

export function markCorrectOption(raw: RawQuestion): RawQuestion {
  if (!raw.correctAnswer || raw.options.length === 0) return raw

  const answerKey = raw.correctAnswer.toUpperCase()
  return {
    ...raw,
    options: raw.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id.toUpperCase() === answerKey,
    })),
  }
}
