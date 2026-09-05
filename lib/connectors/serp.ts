/**
 * ProcureAI — SerpAPI Google Shopping Connector
 *
 * Real-time Google Shopping results via SerpAPI.
 * Enabled only when SERPAPI_KEY is configured.
 */

import type { ProductQuery, RawOffer } from '@/types'
import { BaseConnector, type ConnectorConfig } from './base'

interface SerpShoppingResult {
  title: string
  price?: string
  extracted_price?: number
  link?: string
  product_link?: string
  thumbnail?: string
  source?: string
  store?: string
  rating?: number
  reviews?: number
}

interface SerpApiResponse {
  shopping_results?: SerpShoppingResult[]
  error?: string
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d.,]/g, '')
  if (!cleaned) return null
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    cleaned = cleaned.replace(/,/g, '')
  }
  const value = parseFloat(cleaned)
  return isNaN(value) ? null : value
}

const SERP_API_BASE = 'https://serpapi.com/search.json'
const DEFAULT_LIMIT = 8

export class SerpApiConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'serp',
    name: 'Google Shopping',
    description:
      'Real-time Google Shopping results via SerpAPI. Requires SERPAPI_KEY.',
    isDemo: false,
    requiresApiKey: true,
    apiKeyEnvVar: 'SERPAPI_KEY',
    supportedCurrencies: ['MXN', 'USD'],
  }

  async search(query: ProductQuery): Promise<RawOffer[]> {
    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey) return []

    const searchTerms = [query.brand, query.name, query.model]
      .filter(Boolean)
      .join(' ')
      .trim()

    const limit = query.limit ?? DEFAULT_LIMIT

    const url = new URL(SERP_API_BASE)
    url.searchParams.set('engine', 'google_shopping')
    url.searchParams.set('q', searchTerms)
    url.searchParams.set('gl', 'mx')
    url.searchParams.set('hl', 'es')
    url.searchParams.set('num', String(limit))
    url.searchParams.set('api_key', apiKey)

    let data: SerpApiResponse

    try {
      const response = await fetch(url.toString())
      if (!response.ok) return []
      data = (await response.json()) as SerpApiResponse
    } catch {
      return []
    }

    const results = data.shopping_results ?? []

    return results
      .slice(0, limit)
      .map((result, index) => this.mapResult(result, index))
      .filter((offer): offer is RawOffer => offer !== null)
  }

  private mapResult(result: SerpShoppingResult, index: number): RawOffer | null {
    const price =
      typeof result.extracted_price === 'number'
        ? result.extracted_price
        : parsePrice(result.price)

    if (price === null || price <= 0) return null
    const sourceUrl = result.product_link ?? result.link
    if (!sourceUrl) return null

    const sourceName = result.source ?? result.store ?? 'Google Shopping'

    return this.buildRawOffer({
      id: `serp-${index}-${Date.now()}`,
      title: result.title,
      price,
      currency: 'MXN',
      sourceUrl,
      sourceName,
      imageUrl: result.thumbnail ?? null,
      thumbnailUrl: result.thumbnail ?? null,
      seller: sourceName,
      shippingCost: null,
      availability: 'IN_STOCK',
      rating: result.rating ?? null,
      reviewCount: result.reviews ?? null,
      rawData: { rawTitle: result.title },
    })
  }
}
