import { NextRequest, NextResponse } from 'next/server'
import { parseProductList } from '@/lib/ai/parser'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 },
      )
    }

    const result = await parseProductList(text)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[api/parse] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to parse text' },
      { status: 500 },
    )
  }
}
