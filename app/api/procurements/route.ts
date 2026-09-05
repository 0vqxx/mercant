import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import {
  saveProcurementMemory,
  getAllProcurementsMemory,
  MemoryProcurement,
} from '@/lib/procurementsMemory'
import { generateOffersForItem, populateProcurementOffers } from '@/lib/connectors/generateOffers'
import type { ProductQuery } from '@/types'

// Helper to ensure a fallback user exists for instant guest/demo usage
async function getOrCreateUserId(sessionUserId?: string): Promise<string> {
  if (sessionUserId) return sessionUserId

  const defaultEmail = 'demo@procureai.app'
  try {
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
  } catch {
    return 'demo-user-id'
  }
}

export async function GET(req: NextRequest) {
  try {
    let procurements: any[] = []
    try {
      const session = await getServerSession(authOptions)
      const userId = await getOrCreateUserId(session?.user?.id)

      procurements = await prisma.procurement.findMany({
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
    } catch (dbErr) {
      console.warn('[api/procurements] DB offline, using memory store')
      procurements = getAllProcurementsMemory()
    }

    return NextResponse.json({ procurements })
  } catch (err: any) {
    console.error('[api/procurements] GET error:', err)
    return NextResponse.json({ procurements: getAllProcurementsMemory() })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, budget, currency = 'MXN', priorityMode = 'BALANCE', items, rawInput, notes } = body

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El nombre y al menos un producto son requeridos' },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const parsedBudget = budget ? parseFloat(String(budget)) : null

    // Attempt Prisma DB creation
    try {
      const session = await getServerSession(authOptions)
      const userId = await getOrCreateUserId(session?.user?.id)

      const procurement = await prisma.procurement.create({
        data: {
          userId,
          name: String(name).trim(),
          budget: parsedBudget,
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
          items: {
            include: {
              offers: true,
            },
          },
        },
      })

      // Attach offers for instant readiness
      const populated = populateProcurementOffers(procurement as any)
      saveProcurementMemory(populated)

      return NextResponse.json({ success: true, procurement: populated })
    } catch (dbErr) {
      console.warn('[api/procurements] DB creation failed, saving to resilient memory store:', dbErr)

      const fallbackId = `proc-${Date.now()}`
      const memoryProc: MemoryProcurement = {
        id: fallbackId,
        userId: 'demo-user-id',
        name: String(name).trim(),
        budget: parsedBudget,
        currency,
        priorityMode,
        status: 'COMPLETED',
        rawInput: rawInput ?? null,
        notes: notes ?? null,
        createdAt: now,
        updatedAt: now,
        items: items.map((it: ProductQuery, idx: number) => {
          const itemObj = {
            id: `item-${Date.now()}-${idx}`,
            procurementId: fallbackId,
            name: it.name,
            brand: it.brand ?? null,
            model: it.model ?? null,
            sku: it.sku ?? null,
            quantity: it.quantity ?? 1,
            currency: it.currency ?? currency,
            specifications: it.specifications ?? null,
            maxBudget: it.maxBudget ?? null,
            status: 'COMPLETED',
          }
          const offers = generateOffersForItem(itemObj, priorityMode)
          return {
            ...itemObj,
            offers,
          }
        }),
      }

      saveProcurementMemory(memoryProc)

      return NextResponse.json({ success: true, procurement: memoryProc })
    }
  } catch (err: any) {
    console.error('[api/procurements] POST fatal error:', err)
    return NextResponse.json({ error: err.message || 'Error al guardar la cotización' }, { status: 500 })
  }
}
