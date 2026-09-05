import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const jobs = await prisma.priceTracking.findMany({
      include: {
        item: true,
        history: {
          orderBy: { checkedAt: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ jobs })
  } catch (err: any) {
    console.error('[api/tracking] GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, targetPrice, frequency = 'DAILY' } = await req.json()

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    const item = await prisma.procurementItem.findUnique({
      where: { id: itemId },
      include: {
        procurement: true,
        offers: {
          orderBy: { unitPrice: 'asc' },
          take: 1,
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const tracking = await prisma.priceTracking.create({
      data: {
        userId: item.procurement.userId,
        itemId: item.id,
        targetPrice: targetPrice ? parseFloat(String(targetPrice)) : null,
        currency: item.currency,
        frequency,
        isActive: true,
        lastCheckedAt: new Date(),
        history: item.offers[0]
          ? {
              create: {
                offerId: item.offers[0].id,
                price: item.offers[0].unitPrice,
                currency: item.offers[0].currency,
                availability: item.offers[0].availability,
              },
            }
          : undefined,
      },
    })

    return NextResponse.json({ success: true, tracking })
  } catch (err: any) {
    console.error('[api/tracking] POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
