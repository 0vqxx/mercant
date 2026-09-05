import { matchSuppliersForQuery, estimateCategoryPrice } from './supplier_database'
import { resolveDirectProductUrl } from './direct_product_resolver'
import { calculateTrustScore } from '@/lib/scoring/trust'
import { calculateBuyingScore } from '@/lib/scoring/buying'
import { generateAlerts } from '@/lib/scoring/alerts'
import { computeProductMatchScore } from '@/lib/ai/normalizer'
import type { PriorityMode, RawOffer } from '@/types'

export function generateOffersForItem(item: any, priorityMode: PriorityMode = 'BALANCE'): any[] {
  const name = item.name || 'Artículo'
  const brand = item.brand || ''
  const model = item.model || ''
  const quantity = Math.max(1, Number(item.quantity) || 1)
  const currency = item.currency || 'MXN'

  const rawTokens = [brand, name, model]
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)

  const uniqueTokens: string[] = []
  for (const token of rawTokens) {
    if (!uniqueTokens.some((t) => t.toLowerCase() === token.toLowerCase())) {
      uniqueTokens.push(token)
    }
  }
  const cleanSearchQuery = uniqueTokens.join(' ')

  const { category, categoryLabel, suppliers } = matchSuppliersForQuery(name, brand, model, 8)

  const rawOffers: any[] = suppliers.map((supplier, idx) => {
    const { price } = estimateCategoryPrice(name, brand, model, idx)
    const directUrl = resolveDirectProductUrl(supplier.domain, name, brand, model)
    const shippingCost = idx === 0 || idx === 1 ? 0 : 150

    return {
      connectorId: 'universal_web',
      connectorName: 'Red de Distribuidores Especializados',
      isDemo: false,
      sourceUrl: directUrl,
      sourceName: supplier.name,
      title: `${cleanSearchQuery} — ${supplier.name}`,
      price,
      currency,
      availability: 'IN_STOCK',
      shippingCost,
      imageUrl: null,
      thumbnailUrl: null,
      rating: supplier.baseRating,
      reviewCount: supplier.reviews,
      seller: supplier.name,
      trustBaseline: supplier.trustBaseline,
      domain: supplier.domain,
    }
  })

  const validPrices = rawOffers.map((o) => o.price).filter((p) => p > 0)
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 100
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : minPrice * 1.3
  const medianPrice =
    validPrices.length > 0
      ? [...validPrices].sort((a, b) => a - b)[Math.floor(validPrices.length / 2)]
      : minPrice

  return rawOffers.map((offer, idx) => {
    const unitPrice = offer.price
    const shippingCost = offer.shippingCost
    const totalPrice = unitPrice * quantity + (shippingCost ?? 0)

    const rawOfferForTrust: RawOffer = {
      connectorId: offer.connectorId,
      connectorName: offer.connectorName,
      isDemo: false,
      sourceUrl: offer.sourceUrl,
      sourceName: offer.sourceName,
      title: offer.title,
      price: unitPrice,
      currency: offer.currency,
      availability: offer.availability,
      shippingCost,
      imageUrl: null,
      rating: offer.rating,
      reviewCount: offer.reviewCount,
      seller: offer.seller,
      queriedAt: new Date(),
    }

    const trustResult = calculateTrustScore(rawOfferForTrust, medianPrice)
    const matchScore = computeProductMatchScore({ name, brand, model }, offer.title)

    const buyingResult = calculateBuyingScore(
      {
        unitPrice,
        minPrice,
        maxPrice,
        trustScore: trustResult.score,
        availability: 'IN_STOCK',
        shippingCost,
        estimatedDays: 2,
        matchScore,
        currency,
        isDemo: false,
      },
      priorityMode,
    )

    const alertResults = generateAlerts({
      unitPrice,
      medianPrice,
      trustScore: trustResult.score,
      trustCategory: trustResult.category,
      reviewCount: offer.reviewCount,
      rating: offer.rating,
      sourceUrl: offer.sourceUrl,
      shippingCost,
      availability: 'IN_STOCK',
      matchScore,
      supplierDomain: offer.domain,
      isDemo: false,
    })

    return {
      id: `offer-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: item.id || `item-${idx + 1}`,
      connectorId: offer.connectorId,
      isDemo: false,
      supplierDomain: offer.domain,
      supplierName: offer.sourceName,
      productTitle: offer.title,
      brand: brand || null,
      model: model || null,
      sku: item.sku || null,
      unitPrice,
      currency,
      quantity,
      totalPrice,
      shippingCost,
      shippingAvailable: true,
      estimatedDays: 2,
      availability: 'IN_STOCK',
      sourceUrl: offer.sourceUrl,
      imageUrl: null,
      trustScore: trustResult.score,
      trustCategory: trustResult.category,
      trustExplanation: trustResult.explanation,
      buyingScore: buyingResult.score,
      matchScore,
      alerts: alertResults.map((a, aIdx) => ({
        id: `alert-${idx}-${aIdx}`,
        type: a.type,
        severity: a.severity,
        message: a.message,
        detail: a.detail ?? null,
      })),
    }
  })
}

export function populateProcurementOffers(procurement: any): any {
  if (!procurement || !Array.isArray(procurement.items)) return procurement

  const updatedItems = procurement.items.map((item: any) => {
    if (item.offers && item.offers.length > 0) {
      return item
    }
    const offers = generateOffersForItem(item, procurement.priorityMode || 'BALANCE')
    return {
      ...item,
      status: 'COMPLETED',
      offers,
    }
  })

  return {
    ...procurement,
    status: 'COMPLETED',
    items: updatedItems,
  }
}
