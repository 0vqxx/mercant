import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import type { ProductQuery } from '@/types'

// Helper to ensure a fallback user exists for instant guest/demo usage
async function getOrCreateUserId(sessionUserId?: string): Promise<string> {
  if (sessionUserId) return sessionUserId

  const defaultEmail = 'demo@procureai.app'
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Demo Procurement User',
        email: defaultEmail,
      },
    })
  }

  return user.id
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = await getOrCreateUserId(session?.user?.id)

    const procurements = await prisma.procurement.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            offers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ procurements })
  } catch (err: any) {
    console.error('[api/procurements] GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = await getOrCreateUserId(session?.user?.id)

    const body = await req.json()
    const { name, budget, currency = 'MXN', priorityMode = 'BALANCE', items, rawInput, notes } = body

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one product item are required' },
        { status: 400 },
      )
    }

    const procurement = await prisma.procurement.create({
      data: {
        userId,
        name: String(name).trim(),
        budget: budget ? parseFloat(String(budget)) : null,
        currency,
        priorityMode,
        rawInput: rawInput ?? null,
        notes: notes ?? null,
        items: {
          create: items.map((it: ProductQuery) => ({
            name: it.name,
            brand: it.brand ?? null,
            model: it.model ?? null,
            sku: it.sku ?? null,
            quantity: it.quantity ?? 1,
            currency: it.currency ?? currency,
            specifications: it.specifications ?? null,
            maxBudget: it.maxBudget ?? null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ success: true, procurement })
  } catch (err: any) {
    console.error('[api/procurements] POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
