'use client'

import React from 'react'
import { TrustBadge } from '@/components/procurement/TrustBadge'
import { BuyingScoreBadge } from '@/components/procurement/BuyingScoreBadge'
import { AlertCard } from '@/components/procurement/AlertCard'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface OfferWithAlerts {
  id: string
  isDemo: boolean
  supplierName: string
  supplierDomain: string
  productTitle: string
  unitPrice: number
  currency: string
  quantity: number
  totalPrice: number
  shippingCost: number | null
  availability: string
  estimatedDays: number | null
  trustScore: number | null
  trustCategory: any
  trustExplanation: string | null
  buyingScore: number | null
  sourceUrl: string
  alerts: Array<{
    id: string
    type: any
    severity: any
    message: string
    detail: string | null
  }>
}

interface ComparisonTableProps {
  offers: OfferWithAlerts[]
  quantity: number
  currency?: string
}

export function ComparisonTable({
  offers,
  quantity,
  currency = 'MXN',
}: ComparisonTableProps) {
  if (offers.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        No se encontraron ofertas para este producto todavía.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#f8fafc] dark:bg-[#1a2130] border-b border-[#e3e8ee] dark:border-[#232a38] text-[#697386] dark:text-[#8792a2] font-semibold text-[11px]">
          <tr>
            <th className="py-2.5 px-3.5">Tienda</th>
            <th className="py-2.5 px-3.5">Producto</th>
            <th className="py-2.5 px-3.5 text-right">Precio unitario</th>
            <th className="py-2.5 px-3.5 text-center">Cant.</th>
            <th className="py-2.5 px-3.5 text-right">Envío</th>
            <th className="py-2.5 px-3.5 text-right">Total</th>
            <th className="py-2.5 px-3.5 text-center">Disponibilidad</th>
            <th className="py-2.5 px-3.5 text-center">Trust</th>
            <th className="py-2.5 px-3.5 text-center">Recomendación</th>
            <th className="py-2.5 px-3.5 text-right">Enlace</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#232a38]/80 text-[#3c4257] dark:text-[#c1c9d2]">
          {offers.map((offer, idx) => {
            const hasAlerts = offer.alerts && offer.alerts.length > 0
            const hasCriticalAlert = offer.alerts?.some((a) => a.severity === 'DANGER')

            return (
              <React.Fragment key={offer.id || idx}>
                <tr
                  className={`hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/60 transition-colors ${
                    hasCriticalAlert ? 'bg-[#fff1f2]/30' : ''
                  }`}
                >
                  <td className="py-3 px-3.5 font-semibold text-[#0a2540] dark:text-white">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{offer.supplierName}</span>
                      {offer.isDemo && (
                        <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-[#4f566b] dark:text-[#8792a2] max-w-xs truncate" title={offer.productTitle}>
                    {offer.productTitle}
                  </td>

                  <td className="py-3 px-3.5 text-right font-medium text-[#0a2540] dark:text-white whitespace-nowrap tabular-nums">
                    {offer.unitPrice > 0 ? formatCurrency(offer.unitPrice, offer.currency || currency) : '—'}
                  </td>

                  <td className="py-3 px-3.5 text-center text-[#697386] dark:text-[#8792a2] font-medium tabular-nums">
                    {quantity}
                  </td>

                  <td className="py-3 px-3.5 text-right text-[#4f566b] dark:text-[#8792a2] whitespace-nowrap tabular-nums">
                    {offer.shippingCost === 0 ? (
                      <span className="text-[#059669] dark:text-[#34d399] font-medium">Gratis</span>
                    ) : offer.shippingCost != null ? (
                      formatCurrency(offer.shippingCost, offer.currency || currency)
                    ) : (
                      <span className="text-[#a3acb9]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right font-bold text-[#0a2540] dark:text-white whitespace-nowrap tabular-nums">
                    {offer.totalPrice > 0 ? formatCurrency(offer.totalPrice, offer.currency || currency) : '—'}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {offer.availability === 'IN_STOCK' ? (
                      <span className="inline-flex items-center gap-1 text-[#059669] dark:text-[#34d399] text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> En stock
                      </span>
                    ) : offer.availability === 'OUT_OF_STOCK' ? (
                      <span className="inline-flex items-center gap-1 text-[#df1b41] text-[11px] font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Agotado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#d97706] text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5" /> Por confirmar
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <TrustBadge
                      score={offer.trustScore}
                      category={offer.trustCategory}
                      explanation={offer.trustExplanation}
                    />
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <BuyingScoreBadge score={offer.buyingScore} />
                  </td>

                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <a
                      href={offer.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:bg-[#635bff]/10 transition-colors"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>


                {hasAlerts && (
                  <tr className="bg-slate-50/50 dark:bg-slate-950/30">
                    <td colSpan={10} className="py-2.5 px-4">
                      <div className="space-y-1.5 my-1">
                        {offer.alerts.map((alert) => (
                          <AlertCard
                            key={alert.id}
                            type={alert.type}
                            severity={alert.severity}
                            message={alert.message}
                            detail={alert.detail}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
