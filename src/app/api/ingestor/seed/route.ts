import { NextResponse } from 'next/server'

// POST /api/ingestor/seed — Load seed data into IndexedDB
export async function POST() {
  try {
    const { getAllQuestions, addQuestions, getQuestionCount } = await import('@/lib/db/questions')
    const { SEED_QUESTIONS } = await import('@/lib/db/seed')
    const existing = await getAllQuestions()
    const existingIds = new Set(existing.map((q) => q.id))
    const newQuestions = SEED_QUESTIONS.filter((q) => !existingIds.has(q.id))

    if (newQuestions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Seed data already loaded',
        added: 0,
        total: existing.length,
      })
    }

    await addQuestions(newQuestions)
    const total = await getQuestionCount()
    return NextResponse.json({
      success: true,
      message: `Loaded ${newQuestions.length} seed questions`,
      added: newQuestions.length,
      total,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Seed data must be loaded from the browser client' },
      { status: 400 }
    )
  }
}
