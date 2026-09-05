/**
 * ProcureAI — Connector Registry
 *
 * Central registry holding all active supplier connectors.
 * Fans out to all available connectors and merges results.
 */

import type { ProductQuery, RawOffer } from '@/types'
import type { SupplierConnector } from './base'
import { MercadoLibreConnector } from './mercadolibre'
import { UniversalWebConnector } from './universal_web'
import { DirectWebScraperConnector } from './direct_scraper'
import { SerpApiConnector } from './serp'
import { MockConnector } from './mock'

const CONNECTORS: SupplierConnector[] = [
  new UniversalWebConnector(),
  new MercadoLibreConnector(),
  new DirectWebScraperConnector(),
  new SerpApiConnector(),
]

const fallbackMock = new MockConnector()

export class ConnectorRegistry {
  private connectors: SupplierConnector[]

  constructor(connectors: SupplierConnector[]) {
    this.connectors = connectors
  }

  getAll(): SupplierConnector[] {
    return this.connectors
  }

  getAvailable(): SupplierConnector[] {
    return this.connectors.filter((c) => c.isAvailable())
  }

  async searchAll(query: ProductQuery): Promise<RawOffer[]> {
    const available = this.getAvailable()

    const results = await Promise.allSettled(
      available.map((connector) =>
        Promise.race([
          connector.search(query),
          new Promise<RawOffer[]>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout connector ${connector.config.id}`)), 3500),
          ),
        ]),
      ),
    )

    const offers: RawOffer[] = []
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        offers.push(...result.value)
      } else {
        const connectorId = available[index]?.config.id ?? 'unknown'
        console.warn(`[ConnectorRegistry] Connector "${connectorId}" error or timeout:`, result.reason)
      }
    }

    // If live connectors returned no results (e.g. rate limits or offline), provide realistic fallback offers
    if (offers.length === 0) {
      try {
        const mockOffers = await fallbackMock.search(query)
        offers.push(...mockOffers)
      } catch (e) {
        console.warn('[ConnectorRegistry] Fallback mock error:', e)
      }
    }

    return offers
  }
}

export const connectorRegistry = new ConnectorRegistry(CONNECTORS)
