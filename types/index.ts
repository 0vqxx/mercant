// ---------------------------------------------------------------------------
// Domain Enums & Constants
// ---------------------------------------------------------------------------

export const ProcurementStatus = {
  DRAFT: 'DRAFT',
  SEARCHING: 'SEARCHING',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const
export type ProcurementStatus = (typeof ProcurementStatus)[keyof typeof ProcurementStatus]

export const ItemStatus = {
  PENDING: 'PENDING',
  SEARCHING: 'SEARCHING',
  COMPLETED: 'COMPLETED',
  NO_RESULTS: 'NO_RESULTS',
} as const
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus]

export const PriorityMode = {
  PRICE: 'PRICE',
  SAFETY: 'SAFETY',
  SPEED: 'SPEED',
  QUALITY: 'QUALITY',
  BALANCE: 'BALANCE',
} as const
export type PriorityMode = (typeof PriorityMode)[keyof typeof PriorityMode]

export const TrustCategory = {
  VERY_LOW_RISK: 'VERY_LOW_RISK',
  LOW_RISK: 'LOW_RISK',
  MEDIUM_RISK: 'MEDIUM_RISK',
  HIGH_RISK: 'HIGH_RISK',
  INSUFFICIENT_INFO: 'INSUFFICIENT_INFO',
} as const
export type TrustCategory = (typeof TrustCategory)[keyof typeof TrustCategory]

export const AvailabilityStatus = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  PREORDER: 'PREORDER',
  UNKNOWN: 'UNKNOWN',
} as const
export type AvailabilityStatus = (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus]

export const AlertType = {
  SUSPICIOUS_PRICE: 'SUSPICIOUS_PRICE',
  LOW_TRUST: 'LOW_TRUST',
  SUSPICIOUS_REVIEWS: 'SUSPICIOUS_REVIEWS',
  PRICE_MISMATCH: 'PRICE_MISMATCH',
  HIDDEN_SHIPPING: 'HIDDEN_SHIPPING',
  MOQ_REQUIRED: 'MOQ_REQUIRED',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  PRODUCT_MISMATCH: 'PRODUCT_MISMATCH',
  INTERMEDIARY_SELLER: 'INTERMEDIARY_SELLER',
  RISKY_PAYMENT: 'RISKY_PAYMENT',
  INSUFFICIENT_INFO: 'INSUFFICIENT_INFO',
} as const
export type AlertType = (typeof AlertType)[keyof typeof AlertType]

export const AlertSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
} as const
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity]

export const TrackingFrequency = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const
export type TrackingFrequency = (typeof TrackingFrequency)[keyof typeof TrackingFrequency]

// ---------------------------------------------------------------------------
// ProductQuery — what the user is searching for (client-side search flow)
// ---------------------------------------------------------------------------

export interface ProductQuery {
  /** Temporary client-side ID or DB ID */
  id: string
  /** Human-readable product name, e.g. "Laptop Dell XPS 13" */
  name: string
  /** Optional brand filter, e.g. "Dell" */
  brand?: string
  /** Optional model identifier, e.g. "XPS 13 9310" */
  model?: string
  /** Optional part / SKU number */
  sku?: string
  /** How many units are needed (default: 1) */
  quantity: number
  /** Freeform extra technical specifications */
  specifications?: string
  /** Maximum acceptable unit price in the specified currency */
  maxBudget?: number
  /** ISO 4217 currency code, e.g. "MXN" */
  currency: string
  /** Maximum number of results to fetch per connector */
  limit?: number
  /** Optional notes */
  notes?: string
}

// ---------------------------------------------------------------------------
// RawOffer — a single product offer returned by a connector
// ---------------------------------------------------------------------------

export interface RawOffer {
  /** ID generated for this offer */
  id?: string
  /** ID of the connector that produced this offer */
  connectorId: string
  /** Display name of the connector, e.g. "MercadoLibre" */
  connectorName: string
  /** True if this offer is DEMO DATA — must NEVER be used for real purchasing */
  isDemo: boolean
  /** Direct URL to the product page on the supplier site */
  sourceUrl: string
  /** Human-readable supplier / marketplace name */
  sourceName: string
  /** Product / listing title as returned by the source */
  title: string
  /** Numerical unit price; null if unparseable */
  price: number | null
  /** ISO 4217 currency code, e.g. "MXN" */
  currency: string
  /** Availability label as returned by source, e.g. "En Stock" */
  availability: string | null
  /** Flat shipping cost in the same currency; 0 = free; null = unknown */
  shippingCost: number | null
  /** Thumbnail image URL */
  imageUrl: string | null
  /** Thumbnail image URL alias */
  thumbnailUrl?: string | null
  /** Aggregate seller/product rating 0–5 */
  rating: number | null
  /** Total number of ratings / reviews */
  reviewCount: number | null
  /** Seller or vendor name on the marketplace */
  seller: string | null
  /** Condition of the product */
  condition?: string | null
  /** Available units count */
  availableQuantity?: number | null
  /** Trust score 0-1 */
  trustScore?: number | null
  /** Full raw response payload for debugging and future re-parsing */
  rawData?: Record<string, unknown>
  /** UTC timestamp of when the connector executed the query */
  queriedAt: Date
}

// ---------------------------------------------------------------------------
// TrustScoreResult — AI / heuristic trust analysis of a supplier / offer
// ---------------------------------------------------------------------------

export interface TrustScoreResult {
  /** Composite trust score 0–100 */
  score: number
  /** Qualitative risk bucket from Prisma TrustCategory enum */
  category: TrustCategory
  /** Per-dimension scores that feed into the composite */
  breakdown: Record<string, number>
  /** Human-readable explanation of the trust assessment */
  explanation: string
}

// ---------------------------------------------------------------------------
// BuyingScoreResult — composite purchasing recommendation score
// ---------------------------------------------------------------------------

export interface BuyingScoreResult {
  /** Composite buying score 0–100 */
  score: number
  /** Short human label, e.g. "Best Value", "Highly Recommended" */
  label: string
  /** Priority mode used for weighting */
  priorityMode?: PriorityMode
  /** Currency */
  currency?: string
  /** Is demo data */
  isDemo?: boolean
  /** Detailed component scores */
  components?: {
    price: number
    trust: number
    availability: number
    shipping: number
    match: number
  }
  /** Weights used */
  weights?: {
    price: number
    trust: number
    availability: number
    shipping: number
    match: number
  }
  estimatedDays?: number | null
  breakdown?: {
    price: number
    trust: number
    availability: number
    shipping: number
    match: number
  }
}

// ---------------------------------------------------------------------------
// AlertResult — a risk or quality flag attached to an offer
// ---------------------------------------------------------------------------

export interface AlertResult {
  /** Structural alert type from Prisma AlertType enum */
  type: AlertType
  /** Severity level from Prisma AlertSeverity enum */
  severity: AlertSeverity
  /** Short message shown in the UI */
  message: string
  /** Extended description / recommendation */
  detail?: string
  /** Is demo data */
  isDemo?: boolean
}

// ---------------------------------------------------------------------------
// ParsedProductList — output of the AI product-list parser
// ---------------------------------------------------------------------------

export interface ParsedProductList {
  /** Successfully parsed product queries */
  items: ProductQuery[]
  /** Optional tender title or procurement name inferred from document */
  suggestedName?: string
  /** Optional estimated budget found in document */
  suggestedBudget?: number | null
  /** Optional tender metadata */
  tenderDetails?: {
    title?: string
    entity?: string
    deadline?: string
    totalItemsCount?: number
  }
  /** Descriptions of lines/items that could not be parsed */
  parseErrors?: string[]
  /** Original raw text that was submitted for parsing */
  rawInput?: string
  rawResponse?: string
}

// ---------------------------------------------------------------------------
// SearchProgress — real-time status of an in-flight multi-connector search
// ---------------------------------------------------------------------------

export interface SearchProgress {
  itemId: string
  itemName: string
  status: 'pending' | 'searching' | 'done' | 'error'
  resultsFound: number
  connectors: {
    id: string
    name: string
    status: 'pending' | 'running' | 'done' | 'error' | 'skipped'
    resultsFound: number
  }[]
}

// ---------------------------------------------------------------------------
// OptimizationResult — output of the procurement optimisation engine
// ---------------------------------------------------------------------------

export interface OptimizationResult {
  totalCost: number
  totalSavings: number
  currency: string
  trustLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  targetBudget?: number | null
  fitsBudget?: boolean
  strategy?: 'best_value' | 'strict_budget'
  assignments: {
    itemId: string
    itemName: string
    offerId: string
    supplierName: string
    unitPrice: number
    quantity: number
    totalPrice: number
    trustScore: number
    buyingScore: number
    sourceUrl: string
  }[]
}


// ---------------------------------------------------------------------------
// BudgetSummary — budget overview shown in the procurement dashboard
// ---------------------------------------------------------------------------

export interface BudgetSummary {
  total: number
  currency: string
  estimated: number
  remaining: number
  savings: number
  bestAlternativeCost: number
  safestAlternativeCost: number
  cheapestAlternativeCost: number
}
