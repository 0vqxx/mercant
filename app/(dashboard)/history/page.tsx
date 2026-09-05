import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { History, ArrowUpRight, RotateCw, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const completedProcurements = userId
    ? await prisma.procurement.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              offers: {
                orderBy: { buyingScore: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Historial y Auditoría de Sourcing
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registro completo de compras previas, proveedores seleccionados y trazabilidad de precios históricos.
        </p>
      </div>

      <div className="space-y-4">
        {completedProcurements.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800">
            <History className="w-8 h-8 mx-auto text-gray-400 mb-3" />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Sin historial disponible
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Las búsquedas que completes se archivarán aquí automáticamente con su cotización final.
            </p>
          </div>
        ) : (
          completedProcurements.map((proc) => {
            let totalEstimated = 0
            for (const item of proc.items) {
              if (item.offers[0]) totalEstimated += item.offers[0].totalPrice
            }

            return (
              <div
                key={proc.id}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Consulta realizada el {formatDate(proc.createdAt)}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {proc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 block">Total evaluado</span>
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalEstimated, proc.currency)}
                      </span>
                    </div>

                    <Link
                      href={`/procurements/${proc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    >
                      <span>Ver análisis</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items and final recommendation summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {proc.items.map((item) => {
                    const topOffer = item.offers[0]
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            {item.quantity} u
                          </span>
                        </div>

                        {topOffer ? (
                          <div className="text-gray-500 dark:text-gray-400 text-[11px] flex items-center justify-between pt-1">
                            <span>Recomendación: <strong className="text-indigo-600 dark:text-indigo-400">{topOffer.supplierName}</strong></span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(topOffer.unitPrice, proc.currency)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Sin ofertas registradas</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
