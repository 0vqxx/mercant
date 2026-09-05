import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { TrustBadge } from '@/components/procurement/TrustBadge'
import { BuyingScoreBadge } from '@/components/procurement/BuyingScoreBadge'
import { Sparkles, DollarSign, ShieldCheck, Zap, ExternalLink } from 'lucide-react'

interface RecommendationCardsProps {
  productName: string
  quantity: number
  offers: any[]
  currency?: string
}

export function RecommendationCards({
  productName,
  quantity,
  offers,
  currency = 'MXN',
}: RecommendationCardsProps) {
  if (!offers || offers.length === 0) return null

  // 1. Best overall (highest buying score)
  const bestOverall = [...offers].sort((a, b) => (b.buyingScore ?? 0) - (a.buyingScore ?? 0))[0]

  // 2. Cheapest option (lowest unit price)
  const cheapest = [...offers]
    .filter((o) => o.unitPrice > 0 && o.availability !== 'OUT_OF_STOCK')
    .sort((a, b) => a.unitPrice - b.unitPrice)[0]

  // 3. Most reliable (highest trust score)
  const mostReliable = [...offers]
    .filter((o) => o.trustScore != null)
    .sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Best overall badge card */}
      {bestOverall && (
        <div className="p-3.5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#635bff] dark:text-[#7a73ff] tracking-tight">
              Opción recomendada
            </span>
            <BuyingScoreBadge score={bestOverall.buyingScore} />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#0a2540] dark:text-white truncate">
              {bestOverall.supplierName}
            </div>
            <div className="text-base font-bold text-[#0a2540] dark:text-white mt-0.5 tabular-nums">
              {formatCurrency(bestOverall.unitPrice, bestOverall.currency || currency)}
              <span className="text-[11px] font-normal text-[#697386]"> / unidad</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#f4f6f8] dark:border-[#1e2430] text-xs">
            <span className="text-[#697386] dark:text-[#8792a2] text-[11px] tabular-nums">Total: {formatCurrency(bestOverall.totalPrice, bestOverall.currency || currency)}</span>
            <a
              href={bestOverall.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
            >
              Abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Cheapest alternative */}
      {cheapest && (
        <div className="p-3.5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#059669] dark:text-[#34d399] tracking-tight">
              Precio más bajo
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#edfcf2] dark:bg-[#064e3b]/30 text-[#059669] dark:text-[#34d399] border border-[#a7f3d0]">
              Ahorro
            </span>
          </div>
          <div>
            <div className="font-semibold text-xs text-[#0a2540] dark:text-white truncate">
              {cheapest.supplierName}
            </div>
            <div className="text-base font-bold text-[#059669] dark:text-[#34d399] mt-0.5 tabular-nums">
              {formatCurrency(cheapest.unitPrice, cheapest.currency || currency)}
              <span className="text-[11px] font-normal text-[#697386]"> / unidad</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#f4f6f8] dark:border-[#1e2430] text-xs">
            <span className="text-[#697386] dark:text-[#8792a2] text-[11px] tabular-nums">Total: {formatCurrency(cheapest.totalPrice, cheapest.currency || currency)}</span>
            <a
              href={cheapest.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
            >
              Abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Most reliable alternative */}
      {mostReliable && (
        <div className="p-3.5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#3c4257] dark:text-[#c1c9d2] tracking-tight">
              Mayor reputación
            </span>
            <span className="text-[11px] font-semibold text-[#059669] dark:text-[#34d399] tabular-nums">
              {mostReliable.trustScore}/100 Trust
            </span>
          </div>
          <div>
            <div className="font-semibold text-xs text-[#0a2540] dark:text-white truncate">
              {mostReliable.supplierName}
            </div>
            <div className="text-base font-bold text-[#0a2540] dark:text-white mt-0.5 tabular-nums">
              {formatCurrency(mostReliable.unitPrice, mostReliable.currency || currency)}
              <span className="text-[11px] font-normal text-[#697386]"> / unidad</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#f4f6f8] dark:border-[#1e2430] text-xs">
            <span className="text-[#697386] dark:text-[#8792a2] text-[11px] tabular-nums">Total: {formatCurrency(mostReliable.totalPrice, mostReliable.currency || currency)}</span>
            <a
              href={mostReliable.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
            >
              Abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>

  )
}

