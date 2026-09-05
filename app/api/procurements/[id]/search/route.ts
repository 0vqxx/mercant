import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { connectorRegistry } from '@/lib/connectors/registry'
import { calculateTrustScore } from '@/lib/scoring/trust'
import { calculateBuyingScore } from '@/lib/scoring/buying'
import { generateAlerts } from '@/lib/scoring/alerts'
import { computeProductMatchScore } from '@/lib/ai/normalizer'
import { getMedian, getDomainFromUrl } from '@/lib/utils'
import type { RawOffer, ProductQuery, PriorityMode } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!procurement) {
      return NextResponse.json({ error: 'Procurement not found' }, { status: 404 })
    }

    await prisma.procurement.update({
      where: { id },
      data: { status: 'SEARCHING' },
    })

    for (const item of procurement.items) {
      await prisma.procurementItem.update({
        where: { id: item.id },
        data: { status: 'SEARCHING' },
      })

      // Clean existing offers and search results for this item if re-running search
      await prisma.normalizedOffer.deleteMany({
        where: { itemId: item.id },
      })
      await prisma.searchResult.deleteMany({
        where: { itemId: item.id },
      })

      const query: ProductQuery = {
        id: item.id,
        name: item.name,
        brand: item.brand ?? undefined,
        model: item.model ?? undefined,
        sku: item.sku ?? undefined,
        quantity: item.quantity,
        currency: item.currency,
        specifications: item.specifications ?? undefined,
      }

      const rawOffers = await connectorRegistry.searchAll(query)

      if (rawOffers.length === 0) {
        await prisma.procurementItem.update({
          where: { id: item.id },
          data: { status: 'NO_RESULTS' },
        })
        continue
      }

      // Calculate price distribution
      const validPrices = rawOffers
        .map((o) => o.price)
        .filter((p): p is number => p != null && p > 0)
      const medianPrice = validPrices.length > 0 ? getMedian(validPrices) : null
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0
      const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0

      for (const offer of rawOffers) {
        const domain = getDomainFromUrl(offer.sourceUrl)
        const unitPrice = offer.price ?? 0
        const quantity = item.quantity
        const shippingCost = offer.shippingCost ?? null
        const totalPrice = unitPrice * quantity + (shippingCost ?? 0)

        // 1. Compute trust score
        const trustResult = calculateTrustScore(offer, medianPrice)

        // 2. Compute match score
        const matchScore = computeProductMatchScore(
          { name: item.name, brand: item.brand ?? undefined, model: item.model ?? undefined },
          offer.title,
        )

        // 3. Compute AI buying score
        const buyingResult = calculateBuyingScore(
          {
            unitPrice,
            minPrice,
            maxPrice,
            trustScore: trustResult.score,
            availability: offer.availability ?? 'UNKNOWN',
            shippingCost,
            estimatedDays: offer.isDemo ? 3 : null,
            matchScore,
            currency: offer.currency,
            },
          (procurement.priorityMode as PriorityMode) || 'BALANCE',
        )

        // 4. Generate alerts
        const alertResults = generateAlerts({
          unitPrice,
          medianPrice: medianPrice ?? unitPrice,
          trustScore: trustResult.score,
          trustCategory: trustResult.category,
          reviewCount: offer.reviewCount,
          rating: offer.rating,
          sourceUrl: offer.sourceUrl,
          shippingCost,
          availability: offer.availability ?? 'UNKNOWN',
          matchScore,
          supplierDomain: domain,
          isDemo: offer.isDemo,
        })

        // 5. Persist to database
        const searchResult = await prisma.searchResult.create({
          data: {
            itemId: item.id,
            connectorId: offer.connectorId,
            isDemo: offer.isDemo,
            sourceUrl: offer.sourceUrl,
            sourceName: offer.sourceName,
            rawTitle: offer.title,
            rawPrice: offer.price,
            rawCurrency: offer.currency,
            rawAvailability: offer.availability,
            rawShipping: offer.shippingCost,
            rawImageUrl: offer.imageUrl ?? offer.thumbnailUrl ?? null,
            rawRating: offer.rating,
            rawReviewCount: offer.reviewCount,
            rawSeller: offer.seller,
            rawData: offer.rawData ? JSON.stringify(offer.rawData) : null,
          },
        })

        const normalizedOffer = await prisma.normalizedOffer.create({
          data: {
            itemId: item.id,
            searchResultId: searchResult.id,
            connectorId: offer.connectorId,
            isDemo: offer.isDemo,
            supplierDomain: domain,
            supplierName: offer.sourceName || domain,
            productTitle: offer.title,
            brand: item.brand ?? null,
            model: item.model ?? null,
            sku: item.sku ?? null,
            unitPrice,
            currency: offer.currency,
            quantity,
            totalPrice,
            shippingCost,
            shippingAvailable: shippingCost !== null || offer.sourceName.includes('MercadoLibre'),
            estimatedDays: offer.isDemo ? 3 : null,
            availability: (offer.availability as any) || 'IN_STOCK',
            sourceUrl: offer.sourceUrl,
            imageUrl: offer.imageUrl ?? offer.thumbnailUrl ?? null,
            trustScore: trustResult.score,
            trustCategory: trustResult.category,
            trustBreakdown: trustResult.breakdown ? JSON.stringify(trustResult.breakdown) : null,
            trustExplanation: trustResult.explanation,
            buyingScore: buyingResult.score,
            buyingBreakdown: buyingResult.components ? JSON.stringify(buyingResult.components) : null,
            matchScore,
            alerts: {
              create: alertResults.map((a) => ({
                type: a.type,
                severity: a.severity,
                message: a.message,
                detail: a.detail ?? null,
              })),
            },
          },
        })
      }

      await prisma.procurementItem.update({
        where: { id: item.id },
        data: { status: 'COMPLETED' },
      })
    }

    await prisma.procurement.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, procurementId: id })
  } catch (err: any) {
    console.error('[api/procurements/[id]/search] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
