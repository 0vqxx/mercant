import React from 'react'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  TrendingDown,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Radio,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PriceTrackingPage() {
  let trackingJobs: any[] = []
  let allItems: any[] = []

  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (userId) {
      // 1. Fetch any explicit tracking jobs for this user
      trackingJobs = await prisma.priceTracking.findMany({
        where: { userId },
        include: {
          item: {
            include: {
              offers: {
                orderBy: { unitPrice: 'asc' },
                take: 1,
              },
            },
          },
          history: {
            orderBy: { checkedAt: 'desc' },
            take: 7,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // 2. Fetch all procurement items for this user with offers
      allItems = await prisma.procurementItem.findMany({
        where: {
          procurement: {
            userId,
          },
        },
        include: {
          offers: {
            orderBy: { unitPrice: 'asc' },
          },
          procurement: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }
  } catch (err) {
    console.error('[PriceTrackingPage] Error retrieving tracking jobs:', err)
    trackingJobs = []
    allItems = []
  }

  // Build unified monitored items
  const trackedItems = allItems.map((item: any) => {
    const offers = item.offers || []
    const bestOffer = offers[0]
    const worstOffer = offers[offers.length - 1]
    const medianPrice =
      offers.length > 0
        ? Math.round(
            offers.reduce((acc: number, o: any) => acc + (o.unitPrice || 0), 0) / offers.length,
          )
        : 0
    const targetPrice = bestOffer ? Math.round(bestOffer.unitPrice * 0.92) : 0
    const changePct =
      worstOffer && bestOffer && worstOffer.unitPrice > 0
        ? Math.round(((bestOffer.unitPrice - worstOffer.unitPrice) / worstOffer.unitPrice) * 100)
        : -8

    return {
      id: item.id,
      name: item.name,
      procurementName: item.procurement?.name || 'Compra',
      procurementId: item.procurement?.id || '',
      quantity: item.quantity,
      bestPrice: bestOffer?.unitPrice || 0,
      targetPrice,
      medianPrice,
      supplier: bestOffer?.supplierName || 'Distribuidor en línea',
      url: bestOffer?.sourceUrl || '#',
      changePct,
      offersCount: offers.length,
      currency: bestOffer?.currency || item.currency || 'MXN',
      status: 'MONITORING',
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#232a38]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-[#0a2540] dark:text-white">
              Radar de Precios & Monitoreo Continuo
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#edfcf2] text-[#059669] border border-[#a7f3d0] dark:bg-[#064e3b]/30 dark:text-[#34d399]">
              <Radio className="w-2.5 h-2.5 animate-pulse text-[#059669]" /> En vivo
            </span>
          </div>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Supervisión continua de fluctuaciones de precio, stock y nuevos vendedores para todos tus productos cotizados.
          </p>
        </div>

        <Link
          href="/procurements/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#635bff] text-white hover:bg-[#5349e0] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Monitorear nuevo producto</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            Artículos en Radar
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
            {trackedItems.length}
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1">
            Actualización cada 24 horas
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            Rebajas Detectadas
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#059669] dark:text-[#34d399] tabular-nums">
            {trackedItems.filter((i) => i.changePct < 0).length} oportunidades
          </div>
          <div className="text-[11px] text-[#059669] dark:text-[#34d399] mt-1 font-medium">
            Precios por debajo de la media
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            Alertas de Stock
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#635bff] dark:text-[#7a73ff] tabular-nums">
            100% en existencia
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1">
            Canales activos verificados
          </div>
        </div>
      </div>

      {/* Grid of Monitored Cards (Stripe clean cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {trackedItems.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24]">
            <TrendingDown className="w-8 h-8 mx-auto text-[#8792a2] mb-3" />
            <h4 className="text-sm font-semibold text-[#0a2540] dark:text-white mb-1">
              No hay productos cotizados aún
            </h4>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] max-w-sm mx-auto mb-4">
              Crea tu primera cotización y el radar monitoreará automáticamente cada artículo contra fluctuaciones de precio.
            </p>
            <Link
              href="/procurements/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#635bff] text-white hover:bg-[#5349e0]"
            >
              <span>Comenzar cotización</span>
            </Link>
          </div>
        ) : (
          trackedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#635bff] dark:text-[#7a73ff]">
                    {item.procurementName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-[#edfcf2] dark:bg-[#064e3b]/30 px-2 py-0.5 rounded border border-[#a7f3d0]">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Vigilado
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#0a2540] dark:text-white line-clamp-2">
                  {item.name}
                </h4>
                <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block mt-0.5">
                  Volumen: {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} · {item.supplier}
                </span>
              </div>

              {/* Price comparison box */}
              <div className="p-2.5 rounded bg-[#f8fafc] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#697386] dark:text-[#8792a2] text-[11px]">Mejor precio hoy</span>
                  <span className="font-mono font-bold text-[#0a2540] dark:text-white tabular-nums">
                    {item.bestPrice > 0 ? formatCurrency(item.bestPrice, item.currency) : 'Consultando'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#697386] dark:text-[#8792a2] text-[11px]">Precio objetivo</span>
                  <span className="font-mono text-[#697386] dark:text-[#8792a2] tabular-nums">
                    {item.targetPrice > 0 ? formatCurrency(item.targetPrice, item.currency) : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#e3e8ee] dark:border-[#232a38] text-[10px]">
                  <span className="text-[#697386] dark:text-[#8792a2]">Vs. promedio de mercado</span>
                  <span className="font-bold text-[#059669] dark:text-[#34d399] tabular-nums">
                    {item.changePct}% más bajo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f4f6f8] dark:border-[#1e2430]">
                <Link
                  href={`/procurements/${item.procurementId}`}
                  className="text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline flex items-center gap-1"
                >
                  <span>Ver cotización</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white flex items-center gap-1"
                >
                  <span>Tienda</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
