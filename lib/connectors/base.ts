/**
 * ProcureAI — Base Connector Interface
 */

import type { RawOffer, ProductQuery } from '@/types'

export interface ConnectorConfig {
  id: string
  name: string
  description: string
  isDemo: boolean
  requiresApiKey: boolean
  apiKeyEnvVar?: string
  supportedCurrencies: string[]
  rateLimit?: number
}

export interface SupplierConnector {
  config: ConnectorConfig
  isAvailable(): boolean
  search(query: ProductQuery): Promise<RawOffer[]>
}

export abstract class BaseConnector implements SupplierConnector {
  abstract config: ConnectorConfig
  abstract search(query: ProductQuery): Promise<RawOffer[]>

  isAvailable(): boolean {
    if (!this.config.requiresApiKey) return true
    if (!this.config.apiKeyEnvVar) return false
    return !!process.env[this.config.apiKeyEnvVar]
  }

  protected buildRawOffer(
    partial: Omit<RawOffer, 'connectorId' | 'connectorName' | 'isDemo' | 'queriedAt'> & {
      connectorId?: string
      connectorName?: string
      isDemo?: boolean
    },
  ): RawOffer {
    const {
      imageUrl = null,
      availability = 'IN_STOCK',
      rawData = {},
      ...rest
    } = partial

    return {
      imageUrl,
      availability,
      rawData,
      ...rest,
      connectorId: partial.connectorId ?? this.config.id,
      connectorName: partial.connectorName ?? this.config.name,
      isDemo: partial.isDemo ?? this.config.isDemo,
      queriedAt: new Date(),
    }
  }
}
