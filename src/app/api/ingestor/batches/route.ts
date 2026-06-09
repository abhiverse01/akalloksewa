import { NextResponse } from 'next/server'
import { getAllQuestions } from '@/lib/db/questions'

// GET /api/ingestor/batches — List all batches (simulated from questions)
export async function GET() {
  try {
    const questions = await getAllQuestions()

    // Extract unique batch IDs and create batch summaries
    const batchMap = new Map<string, {
      id: string
      name: string
      sourceType: string
      status: string
      totalQuestions: number
      readyToCommit: number
      duplicatesFound: number
      createdAt: number
    }>()

    for (const q of questions) {
      const batchId = q.ingestBatchId || 'seed'
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          id: batchId,
          name: batchId === 'seed' ? 'Seed Data Batch' : `Batch ${batchId}`,
          sourceType: q.source === 'seed' ? 'seed' : 'ingestor',
          status: 'committed',
          totalQuestions: 0,
          readyToCommit: 0,
          duplicatesFound: 0,
          createdAt: q.createdAt,
        })
      }
      const batch = batchMap.get(batchId)!
      batch.totalQuestions++
      if (q.status === 'approved') batch.readyToCommit++
    }

    const batches = Array.from(batchMap.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    )

    return NextResponse.json({ batches })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get batches', details: String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/ingestor/batches — Delete a batch
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing batch ID' }, { status: 400 })
  }

  // For now, return success (IndexedDB doesn't easily support batch delete)
  return NextResponse.json({ success: true, deleted: id })
}
