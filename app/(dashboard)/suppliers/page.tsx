'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Globe,
  Search,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react'

export default function SuppliersPage() {
  const [procurements, setProcurements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/procurements')
      .then((res) => (res.ok ? res.json() : { procurements: [] }))
      .then((data) => {
        setProcurements(data.procurements || [])
      })
      .catch((err) => {
        console.warn('[SuppliersPage] Notice:', err)
        setProcurements([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Flatten offers from procurements
  const offers = procurements.flatMap((p: any) =>
    (p.items || []).flatMap((item: any) => item.offers || [])
  )

  // Group by supplier name
  const suppliersMap: Record<
    string,
    {
      name: string
      domain: string
      offersCount: number
      trustSum: number
      minPrice: number
      maxPrice: number
      totalSpendTracked: number
      latestUrl: string
      isDemo: boolean
    }
  > = {}

  for (const offer of offers) {
    const sName = offer.supplierName || 'Distribuidor'
    if (!suppliersMap[sName]) {
      suppliersMap[sName] = {
        name: sName,
        domain: offer.supplierDomain || (sName.toLowerCase().replace(/\s+/g, '') + '.com.mx'),
        offersCount: 0,
        trustSum: 0,
        minPrice: offer.unitPrice || 0,
        maxPrice: offer.unitPrice || 0,
        totalSpendTracked: 0,
        latestUrl: offer.sourceUrl || '#',
        isDemo: offer.isDemo || false,
      }
    }

    const s = suppliersMap[sName]
    s.offersCount += 1
    s.trustSum += offer.trustScore ?? 80
    s.minPrice = Math.min(s.minPrice, offer.unitPrice || 0)
    s.maxPrice = Math.max(s.maxPrice, offer.unitPrice || 0)
    s.totalSpendTracked += offer.totalPrice || 0
  }

  const suppliers = Object.values(suppliersMap).map((s) => ({
    ...s,
    trustAvg: Math.round(s.trustSum / Math.max(s.offersCount, 1)),
  })).sort((a, b) => b.trustAvg - a.trustAvg)

  const verifiedCount = suppliers.filter((s) => s.trustAvg >= 80).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#232a38]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-[#0a2540] dark:text-white">
            Proveedores & Confiabilidad (Trust Score)
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Directorio consolidado de distribuidores y tiendas analizados por el algoritmo de riesgo.
          </p>
        </div>

        <Link
          href="/procurements/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#635bff] text-white hover:bg-[#5349e0] shadow-xs"
        >
          <span>Nueva búsqueda</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Proveedores en Red</span>
            <Building2 className="w-3.5 h-3.5 text-[#635bff]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
            {suppliers.length}
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5">
            Mercados abiertos e institucionales
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Proveedores Verificados (≥80)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#059669] dark:text-[#34d399] tabular-nums">
            {verifiedCount}
          </div>
          <div className="text-[11px] text-[#059669] dark:text-[#34d399] mt-1.5 font-medium">
            Bajo riesgo consolidado
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Volumen Rastreado</span>
            <Layers className="w-3.5 h-3.5 text-[#0070f3]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
            {formatCurrency(
              suppliers.reduce((acc, s) => acc + s.totalSpendTracked, 0),
              'MXN',
            )}
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5">
            Sumatoria de ofertas cotizadas
          </div>
        </div>
      </div>

      {/* Directory Table (Stripe style) */}
      <div className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-[#f4f6f8] dark:border-[#1e2430] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0a2540] dark:text-white uppercase tracking-wider">
              Índice de Confiabilidad por Proveedor
            </h3>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
              Evaluación basada en SSL, políticas de devolución, antigüedad y coherencia de precios.
            </p>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#8792a2]">
            Aún no hay proveedores registrados. Inicia una cotización para indexar distribuidores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] dark:bg-[#1a2130] text-[#697386] dark:text-[#8792a2] font-semibold text-[11px] border-b border-[#e3e8ee] dark:border-[#232a38]">
                <tr>
                  <th className="py-2.5 px-4">Proveedor</th>
                  <th className="py-2.5 px-4">Dominio / Portal</th>
                  <th className="py-2.5 px-4">Ofertas Encontradas</th>
                  <th className="py-2.5 px-4">Rango de Precios</th>
                  <th className="py-2.5 px-4">Confiabilidad (Trust Score)</th>
                  <th className="py-2.5 px-4">Nivel de Riesgo</th>
                  <th className="py-2.5 px-4 text-right">Enlace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#232a38] text-[#3c4257] dark:text-[#c1c9d2]">
                {suppliers.map((s) => (
                  <tr
                    key={s.name}
                    className="hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#0a2540] dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#635bff]" />
                      <span>{s.name}</span>
                      {s.isDemo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fff8e5] text-[#b45309] border border-[#fde68a]">
                          DEMO
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#697386] dark:text-[#8792a2] font-mono text-[11px]">
                      {s.domain}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-[#0a2540] dark:text-white font-medium">
                      {s.offersCount} {s.offersCount === 1 ? 'cotización' : 'cotizaciones'}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-[11px]">
                      {formatCurrency(s.minPrice, 'MXN')} – {formatCurrency(s.maxPrice, 'MXN')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0a2540] dark:text-white tabular-nums">
                          {s.trustAvg}/100
                        </span>
                        <div className="w-16 bg-[#f4f6f8] dark:bg-[#1e2430] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.trustAvg >= 80
                                ? 'bg-[#059669]'
                                : s.trustAvg >= 60
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#df1b41]'
                            }`}
                            style={{ width: `${s.trustAvg}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          s.trustAvg >= 80
                            ? 'bg-[#edfcf2] text-[#059669] border border-[#a7f3d0] dark:bg-[#064e3b]/30 dark:text-[#34d399]'
                            : s.trustAvg >= 60
                            ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a] dark:bg-[#78350f]/30 dark:text-[#fbbf24]'
                            : 'bg-[#fff1f2] text-[#df1b41] border border-[#fecdd3] dark:bg-[#881337]/30 dark:text-[#fb7185]'
                        }`}
                      >
                        {s.trustAvg >= 80 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                          </>
                        ) : s.trustAvg >= 60 ? (
                          'Riesgo Moderado'
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" /> Revisar
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={s.latestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
                      >
                        <span>Visitar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
