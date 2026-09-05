/**
 * ProcureAI — Mock / Demo Connector
 *
 * Returns clearly-labelled DEMO DATA (isDemo: true).
 * All offers are simulated; none reflect real supplier inventory or pricing.
 */

import type { ProductQuery, RawOffer } from '@/types'
import { BaseConnector, type ConnectorConfig } from './base'

interface PriceRange {
  min: number
  max: number
}

const CATEGORY_PRICES: Record<string, PriceRange> = {
  laptop:   { min: 8_000,  max: 45_000 },
  monitor:  { min: 2_500,  max: 15_000 },
  keyboard: { min: 300,    max: 4_000  },
  mouse:    { min: 150,    max: 2_500  },
  chair:    { min: 800,    max: 15_000 },
  headset:  { min: 200,    max: 5_000  },
  printer:  { min: 1_500,  max: 12_000 },
  tablet:   { min: 3_000,  max: 25_000 },
  default:  { min: 200,    max: 10_000 },
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  laptop:    'laptop',
  notebook:  'laptop',
  macbook:   'laptop',
  thinkpad:  'laptop',
  monitor:   'monitor',
  pantalla:  'monitor',
  display:   'monitor',
  keyboard:  'keyboard',
  teclado:   'keyboard',
  mouse:     'mouse',
  ratón:     'mouse',
  raton:     'mouse',
  chair:     'chair',
  silla:     'chair',
  headset:   'headset',
  audífonos: 'headset',
  audifonos: 'headset',
  printer:   'printer',
  impresora: 'printer',
  tablet:    'tablet',
  playera:   'default',
  camisa:    'default',
}

interface DemoSupplier {
  name: string
  domain: string
  trustScore: number
}

const DEMO_SUPPLIERS: DemoSupplier[] = [
  { name: 'TechWorld MX',      domain: 'techworldmx.com',   trustScore: 0.78 },
  { name: 'OfficeDepot MX',    domain: 'officedepot.com.mx', trustScore: 0.88 },
  { name: 'Staples MX',        domain: 'staples.com.mx',    trustScore: 0.82 },
  { name: 'CompuMéxico',       domain: 'compumexico.com',   trustScore: 0.70 },
  { name: 'B2B Suministros MX',domain: 'b2bsuministros.mx',  trustScore: 0.85 },
]

function detectCategory(productName: string): string {
  const lower = productName.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) return category
  }
  return 'default'
}

function deterministicRandom(seed: string, index: number): number {
  let hash = 0
  const str = `${seed}-${index}`
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) / 2_147_483_647
}

function lerp(min: number, max: number, t: number): number {
  return Math.round(min + (max - min) * t)
}

function buildProductUrl(domain: string, productName: string): string {
  const slug = encodeURIComponent(productName.trim().toLowerCase().replace(/\s+/g, '-'))
  return `https://www.${domain}/producto/${slug}?ref=mercant`
}

function simulateLatency(): Promise<void> {
  const ms = 200 + Math.random() * 300
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'mock',
    name: 'Demo Data',
    description:
      'Simulated supplier data for development and demos. All offers are clearly tagged DEMO DATA.',
    isDemo: true,
    requiresApiKey: false,
    supportedCurrencies: ['MXN'],
  }

  async search(query: ProductQuery): Promise<RawOffer[]> {
    await simulateLatency()

    const category = detectCategory(query.name)
    const range = CATEGORY_PRICES[category] ?? CATEGORY_PRICES.default

    const count = 4
    const supplierPool = [...DEMO_SUPPLIERS].slice(0, count)
    const tValues = supplierPool.map((_, i) => deterministicRandom(query.name, i))
    const sortedIndices = [...tValues.keys()].sort((a, b) => tValues[a] - tValues[b])

    const productTitle = [query.brand, query.name, query.model]
      .filter(Boolean)
      .join(' ')
      .trim()

    const offers: RawOffer[] = sortedIndices.map((supplierIdx, rankIdx) => {
      const supplier = supplierPool[supplierIdx]
      const t = rankIdx / Math.max(sortedIndices.length - 1, 1)
      const basePrice = lerp(range.min, range.max, 0.2 + t * 0.6)
      const noise = deterministicRandom(query.name, supplierIdx + 1000)
      const finalPrice = basePrice + Math.round((noise - 0.5) * basePrice * 0.08)
      const trustAdjusted = supplier.trustScore - 0.05 + t * 0.1

      const id = `mock-${query.name.replace(/\s+/g, '_').toLowerCase()}-${supplierIdx}`

      return this.buildRawOffer({
        id,
        title: `[DEMO] ${productTitle || query.name}`,
        price: Math.max(finalPrice, range.min),
        currency: 'MXN',
        sourceUrl: buildProductUrl(supplier.domain, productTitle || query.name),
        sourceName: supplier.name,
        imageUrl: null,
        thumbnailUrl: null,
        seller: supplier.name,
        shippingCost: deterministicRandom(query.name, supplierIdx + 2000) > 0.5 ? 0 : 180,
        availability: 'IN_STOCK',
        condition: 'new',
        rating: parseFloat((3.8 + trustAdjusted * 1.2).toFixed(1)),
        reviewCount: lerp(20, 950, deterministicRandom(query.name, supplierIdx + 3000)),
        availableQuantity: lerp(5, 300, deterministicRandom(query.name, supplierIdx + 4000)),
        trustScore: parseFloat(Math.min(trustAdjusted, 1).toFixed(2)),
        rawData: { mock: true, supplierIndex: supplierIdx },
      })
    })

    return offers
  }
}
