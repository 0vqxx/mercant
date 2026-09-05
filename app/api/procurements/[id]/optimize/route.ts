import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { OptimizationResult } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const minTrustScore = body.minTrustScore ?? 45
    const fitToBudget = Boolean(body.fitToBudget)

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            offers: {
              orderBy: {
                unitPrice: 'asc',
              },
            },
          },
        },
      },
    })

    if (!procurement) {
      return NextResponse.json({ error: 'Procurement not found' }, { status: 404 })
    }

    const assignments: OptimizationResult['assignments'] = []
    let totalOptimizedCost = 0
    let totalMaxCost = 0

    for (const item of procurement.items) {
      if (item.offers.length === 0) continue

      // Filter offers with availability
      let availableOffers = item.offers.filter((o) => o.availability !== 'OUT_OF_STOCK')
      if (availableOffers.length === 0) availableOffers = item.offers

      let chosen = availableOffers[0]

      if (fitToBudget) {
        // Under strict budget accommodation: pick the absolute cheapest viable offer
        const sortedByPrice = [...availableOffers].sort((a, b) => a.totalPrice - b.totalPrice)
        chosen = sortedByPrice[0]
      } else {
        // Balanced best-value optimization
        let eligibleOffers = availableOffers.filter((o) => (o.trustScore ?? 0) >= minTrustScore)
        if (eligibleOffers.length === 0) {
          eligibleOffers = [...availableOffers].sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
        }
        eligibleOffers.sort((a, b) => a.totalPrice - b.totalPrice)
        chosen = eligibleOffers[0]
      }

      // Find highest price for calculating baseline savings
      const highestPriceOffer = [...item.offers].sort((a, b) => b.totalPrice - a.totalPrice)[0]
      totalMaxCost += highestPriceOffer ? highestPriceOffer.totalPrice : chosen.totalPrice

      totalOptimizedCost += chosen.totalPrice

      assignments.push({
        itemId: item.id,
        itemName: item.name,
        offerId: chosen.id,
        supplierName: chosen.supplierName,
        unitPrice: chosen.unitPrice,
        quantity: item.quantity,
        totalPrice: chosen.totalPrice,
        trustScore: chosen.trustScore ?? 50,
        buyingScore: chosen.buyingScore ?? 50,
        sourceUrl: chosen.sourceUrl,
      })
    }

    const avgTrust =
      assignments.length > 0
        ? assignments.reduce((acc, a) => acc + a.trustScore, 0) / assignments.length
        : 50

    const trustLevel = avgTrust >= 75 ? 'HIGH' : avgTrust >= 50 ? 'MEDIUM' : 'LOW'
    const totalSavings = Math.max(0, totalMaxCost - totalOptimizedCost)
    const fitsBudget = procurement.budget != null ? totalOptimizedCost <= procurement.budget : true

    const result: OptimizationResult = {
      totalCost: totalOptimizedCost,
      totalSavings,
      currency: procurement.currency,
      trustLevel,
      targetBudget: procurement.budget,
      fitsBudget,
      strategy: fitToBudget ? 'strict_budget' : 'best_value',
      assignments,
    }

    return NextResponse.json({ success: true, optimization: result })
  } catch (err: any) {
    console.error('[api/procurements/[id]/optimize] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

