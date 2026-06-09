import { NextResponse } from 'next/server'

// GET /api/ingestor/stats — Get dashboard stats
// Note: IndexedDB is browser-only, this returns safe defaults for SSR
export async function GET() {
  try {
    // Try dynamic import of client-side DB
    const { getAllQuestions } = await import('@/lib/db/questions')
    const all = await getAllQuestions()
    const total = all.length
    const approved = all.filter((q) => q.status === 'approved').length
    const pending = all.filter((q) => q.status === 'pending').length

    const subjectBreakdown: Record<string, number> = {}
    for (const q of all) {
      subjectBreakdown[q.subject] = (subjectBreakdown[q.subject] || 0) + 1
    }

    return NextResponse.json({
      totalQuestions: total,
      approvedQuestions: approved,
      pendingQuestions: pending,
      subjectBreakdown,
      recentBatches: [],
    })
  } catch {
    // IndexedDB not available server-side — return defaults
    return NextResponse.json({
      totalQuestions: 0,
      approvedQuestions: 0,
      pendingQuestions: 0,
      subjectBreakdown: {},
      recentBatches: [],
    })
  }
}
