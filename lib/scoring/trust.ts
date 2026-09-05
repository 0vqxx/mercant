/**
 * ProcureAI — Trust Score Calculator
 *
 * Computes a trust score (0-100) for a supplier offer.
 * Categories:
 *   - VERY_LOW_RISK (80-100)
 *   - LOW_RISK (65-79)
 *   - MEDIUM_RISK (45-64)
 *   - HIGH_RISK (25-44)
 *   - INSUFFICIENT_INFO (0-24)
 */

import type { RawOffer, TrustScoreResult, TrustCategory } from '@/types'

function scoreToCategory(score: number): TrustCategory {
  if (score >= 80) return 'VERY_LOW_RISK'
  if (score >= 65) return 'LOW_RISK'
  if (score >= 45) return 'MEDIUM_RISK'
  if (score >= 25) return 'HIGH_RISK'
  return 'INSUFFICIENT_INFO'
}

export function calculateTrustScore(
  offer: RawOffer,
  medianPrice: number | null,
): TrustScoreResult {
  // 1. Rating score (0-25)
  let ratingScore = 12
  if (offer.rating != null) {
    ratingScore = Math.round((Math.min(offer.rating, 5) / 5) * 25)
  }

  // 2. Review count score (0-20)
  let reviewScore = 10
  if (offer.reviewCount != null) {
    const logCount = Math.log10(Math.max(offer.reviewCount, 1))
    reviewScore = Math.min(Math.round((logCount / 3) * 20), 20)
  }

  // 3. Price deviation score (0-30)
  let priceScore = 15
  const price = offer.price ?? 0
  if (medianPrice != null && medianPrice > 0 && price > 0) {
    const deviation = Math.abs(price - medianPrice) / medianPrice
    if (deviation <= 0.10) {
      priceScore = 30
    } else if (deviation <= 0.25) {
      priceScore = 22
    } else if (deviation <= 0.50) {
      priceScore = 14
    } else if (deviation <= 0.75) {
      priceScore = 7
    } else {
      priceScore = 2
    }
    if (price < medianPrice * 0.5) {
      priceScore = Math.min(priceScore, 6)
    }
  }

  // 4. Source reputation score (0-15)
  let connectorScore = 10
  if (offer.isDemo) {
    connectorScore = offer.trustScore != null ? Math.round(offer.trustScore * 15) : 10
  } else if (offer.sourceName.toLowerCase().includes('mercadolibre')) {
    connectorScore = 13
  } else if (offer.sourceName.toLowerCase().includes('google')) {
    connectorScore = 11
  }

  // 5. Data completeness (0-10)
  let completenessScore = 0
  if (offer.rating != null) completenessScore += 2
  if (offer.reviewCount != null) completenessScore += 2
  if (offer.shippingCost != null) completenessScore += 2
  if (offer.seller != null) completenessScore += 2
  if (offer.imageUrl != null || offer.thumbnailUrl != null) completenessScore += 2

  const raw = ratingScore + reviewScore + priceScore + connectorScore + completenessScore
  const score = Math.min(Math.max(Math.round(raw), 0), 100)
  const category = scoreToCategory(score)

  const parts: string[] = []
  if (offer.rating != null) {
    parts.push(`${offer.rating.toFixed(1)}★ calificación`)
  }
  if (offer.reviewCount != null) {
    parts.push(`${offer.reviewCount.toLocaleString()} opiniones`)
  }
  if (medianPrice != null && price > 0 && price < medianPrice * 0.55) {
    parts.push('precio inusualmente bajo respecto al mercado')
  }
  if (offer.shippingCost === 0) {
    parts.push('envío gratuito')
  } else if (offer.shippingCost == null) {
    parts.push('costo de envío no especificado')
  }
  if (offer.isDemo) {
    parts.push('datos simulados')
  }

  const prefix = offer.isDemo ? '[DEMO DATA] ' : ''
  const explanation =
    parts.length > 0
      ? `${prefix}Evaluación de confianza ${score}/100: ${parts.join('; ')}.`
      : `${prefix}Evaluación de confianza ${score}/100 con base en información pública.`

  return {
    score,
    category,
    breakdown: {
      ratingScore,
      reviewScore,
      priceScore,
      connectorScore,
      completenessScore,
    },
    explanation,
  }
}
