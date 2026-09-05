/**
 * ProcureAI — MercadoLibre Connector
 *
 * Uses the public MercadoLibre Search API (no API key required).
 * Results are real-time marketplace data.
 */

import type { ProductQuery, RawOffer } from '@/types'
import { BaseConnector, type ConnectorConfig } from './base'

interface MlSeller {
  id: number
  nickname: string
}

interface MlShipping {
  free_shipping: boolean
  mode?: string
}

interface MlResult {
  id: string
  title: string
  price: number
  currency_id: string
  available_quantity: number
  permalink: string
  thumbnail: string
  condition: string
  shipping: MlShipping
  seller: MlSeller
}

interface MlSearchResponse {
  results: MlResult[]
}

const ML_API_BASE = 'https://api.mercadolibre.com'
const ML_SITE = 'MLM' // Mexico
const DEFAULT_LIMIT = 8

export class MercadoLibreConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'mercadolibre',
    name: 'MercadoLibre',
    description:
      'Real-time listings from MercadoLibre México. Public API, no key required.',
    isDemo: false,
    requiresApiKey: false,
    supportedCurrencies: ['MXN', 'USD'],
    rateLimit: 60,
  }

  async search(query: ProductQuery): Promise<RawOffer[]> {
    const searchTerms = [query.brand, query.name, query.model]
      .filter(Boolean)
      .join(' ')
      .trim()

    const limit = query.limit ?? DEFAULT_LIMIT

    const url = new URL(`${ML_API_BASE}/sites/${ML_SITE}/search`)
    url.searchParams.set('q', searchTerms)
    url.searchParams.set('limit', String(limit))

    let data: MlSearchResponse

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'ProcureAI/1.0 (+https://procureai.app)',
        },
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(
          `MercadoLibre API error ${response.status}: ${body.slice(0, 150)}`,
        )
      }

      data = (await response.json()) as MlSearchResponse
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[mercadolibre] Search failed: ${message}`)
      return []
    }

    return (data.results ?? []).map((result) => this.mapResult(result))
  }

  private mapResult(result: MlResult): RawOffer {
    return this.buildRawOffer({
      id: result.id,
      title: result.title,
      price: result.price,
      currency: result.currency_id || 'MXN',
      sourceUrl: result.permalink,
      sourceName: 'MercadoLibre',
      imageUrl: result.thumbnail ?? null,
      thumbnailUrl: result.thumbnail ?? null,
      seller: result.seller?.nickname ?? 'MercadoLibre Seller',
      shippingCost: result.shipping?.free_shipping === true ? 0 : null,
      availability: result.available_quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      condition: result.condition ?? 'new',
      rating: null,
      reviewCount: null,
      availableQuantity: result.available_quantity ?? null,
      rawData: { mlId: result.id, permalink: result.permalink },
    })
  }
}
