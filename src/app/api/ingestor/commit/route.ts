import { NextResponse } from 'next/server'
import { addQuestions } from '@/lib/db/questions'
import type { Question } from '@/types/question'

// POST /api/ingestor/commit — Commit reviewed questions to database
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questions } = body as { questions: Partial<Question>[] }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided' },
        { status: 400 }
      )
    }

    const now = Date.now()
    const fullQuestions: Question[] = questions.map((q, index) => ({
      id: q.id || `q-${now}-${index.toString().padStart(4, '0')}`,
      text: q.text || '',
      options: q.options || [],
      explanation: q.explanation,
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      subject: q.subject || 'general-knowledge',
      chapter: q.chapter,
      topic: q.topic,
      year: q.year,
      source: q.source || 'ingestor',
      tags: q.tags || [],
      status: 'approved' as const,
      reportCount: 0,
      createdAt: q.createdAt || now,
      updatedAt: now,
      ingestBatchId: q.ingestBatchId,
    }))

    await addQuestions(fullQuestions)

    return NextResponse.json({
      success: true,
      committed: fullQuestions.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to commit questions', details: String(error) },
      { status: 500 }
    )
  }
}
