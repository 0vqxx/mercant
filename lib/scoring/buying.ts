import { type BuyingScoreResult, PriorityMode } from '@/types'

interface BuyingInput {
  unitPrice: number
  minPrice: number
  maxPrice: number
  trustScore: number
  availability: string
  shippingCost: number | null
  estimatedDays: number | null
  matchScore: number
  currency: string
  isDemo?: boolean
}

interface Weights {
  price: number
  trust: number
  availability: number
  shipping: number
  match: number
}

const WEIGHT_MAP: Record<PriorityMode, Weights> = {
  [PriorityMode.BALANCE]:  { price: 25, trust: 30, availability: 20, shipping: 15, match: 10 },
  [PriorityMode.PRICE]:    { price: 50, trust: 15, availability: 15, shipping: 15, match:  5 },
  [PriorityMode.SAFETY]:   { price: 10, trust: 50, availability: 15, shipping: 10, match: 15 },
  [PriorityMode.SPEED]:    { price: 15, trust: 25, availability: 20, shipping: 30, match: 10 },
  [PriorityMode.QUALITY]:  { price: 10, trust: 40, availability: 15, shipping: 10, match: 25 },
}

function scorePriceComponent(
  unitPrice: number,
  minPrice: number,
  maxPrice: number,
): number {
  const range = maxPrice - minPrice
  if (range <= 0) return 100
  const raw = 100 - ((unitPrice - minPrice) / range) * 100
  return Math.max(0, Math.min(100, raw))
}

function scoreAvailabilityComponent(availability: string): number {
  switch (availability.toUpperCase()) {
    case 'IN_STOCK':     return 100
    case 'LOW_STOCK':    return  60
    case 'PREORDER':     return  30
    case 'OUT_OF_STOCK': return   0
    default:             return  20
  }
}

function scoreShippingComponent(shippingCost: number | null): number {
  if (shippingCost === null)  return  50
  if (shippingCost === 0)     return 100
  if (shippingCost <=  200)   return  80
  if (shippingCost <=  500)   return  60
  if (shippingCost <= 1000)   return  40
  return 20
}

function labelFromScore(score: number): string {
  if (score >= 90) return 'Best Value'
  if (score >= 80) return 'Highly Recommended'
  if (score >= 70) return 'Good Choice'
  if (score >= 60) return 'Consider'
  if (score >= 50) return 'Acceptable'
  return 'Not Recommended'
}

export function calculateBuyingScore(
  input: BuyingInput,
  priorityMode: PriorityMode = PriorityMode.BALANCE,
): BuyingScoreResult {
  const {
    unitPrice,
    minPrice,
    maxPrice,
    trustScore,
    availability,
    shippingCost,
    estimatedDays,
    matchScore,
    currency,
    isDemo = false,
  } = input

  const weights = WEIGHT_MAP[priorityMode] ?? WEIGHT_MAP[PriorityMode.BALANCE]

  const priceComponent        = scorePriceComponent(unitPrice, minPrice, maxPrice)
  const trustComponent        = Math.max(0, Math.min(100, trustScore))
  const availabilityComponent = scoreAvailabilityComponent(availability)
  const shippingComponent     = scoreShippingComponent(shippingCost)
  const matchComponent        = Math.max(0, Math.min(100, matchScore * 100))

  const rawScore =
    (priceComponent        * weights.price        +
     trustComponent        * weights.trust        +
     availabilityComponent * weights.availability +
     shippingComponent     * weights.shipping     +
     matchComponent        * weights.match        ) / 100

  const score = Math.max(0, Math.min(100, Math.round(rawScore)))
  const label = labelFromScore(score)

  return {
    score,
    label,
    priorityMode,
    currency,
    isDemo,
    components: {
      price:        Math.round(priceComponent),
      trust:        Math.round(trustComponent),
      availability: Math.round(availabilityComponent),
      shipping:     Math.round(shippingComponent),
      match:        Math.round(matchComponent),
    },
    weights,
    estimatedDays: estimatedDays ?? null,
  }
}
