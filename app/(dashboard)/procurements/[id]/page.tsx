'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { BudgetTracker } from '@/components/procurement/BudgetTracker'
import { PriorityModeSelector } from '@/components/procurement/PriorityModeSelector'
import { DemoDataBanner } from '@/components/procurement/DemoDataBanner'
import { ComparisonTable } from '@/components/suppliers/ComparisonTable'
import { RecommendationCards } from '@/components/suppliers/RecommendationCards'
import { Button } from '@/components/ui/button'
import { calculateBuyingScore } from '@/lib/scoring/buying'
import { formatCurrency } from '@/lib/utils'
import type { PriorityMode, OptimizationResult } from '@/types'
import {
  RotateCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package,
  Trash2,
  AlertTriangle,
  Globe,
  CheckCircle2,
  PiggyBank,
  X,
  BarChart3,
} from 'lucide-react'
import { ProcurementCostChart } from '@/components/procurement/ProcurementCostChart'


export default function ProcurementDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = params?.id as string
  const startSearch = searchParams?.get('startSearch') === 'true'

  const [procurement, setProcurement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('BALANCE')
  const [optimizing, setOptimizing] = useState(false)
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLinksSummaryModal, setShowLinksSummaryModal] = useState(false)
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false)
  const [editBudgetValue, setEditBudgetValue] = useState('')
  const [isSavingBudget, setIsSavingBudget] = useState(false)

  const searchTriggeredRef = useRef(false)


  const fetchProcurement = async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/procurements/${id}`)
      if (!res.ok) throw new Error('No se pudo cargar la compra')
      const data = await res.json()
      setProcurement(data.procurement)
      if (data.procurement?.priorityMode) {
        setPriorityMode(data.procurement.priorityMode)
      }
      return data.procurement
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerSearch = async () => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/procurements/${id}/search`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        console.warn('Search warning:', data.error)
      }
      await fetchProcurement()
    } catch (e) {
      console.error('Error running search:', e)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchProcurement().then((proc) => {
      if (proc) {
        const hasOffers = proc.items?.some((i: any) => i.offers && i.offers.length > 0)
        if ((startSearch || !hasOffers) && !searchTriggeredRef.current) {
          searchTriggeredRef.current = true
          triggerSearch()
        }
      }
    })
  }, [id, startSearch])

  // Dynamic ranking based on selected priority mode
  const rankedItems = useMemo(() => {
    if (!procurement?.items) return []

    return procurement.items.map((item: any) => {
      const offers = item.offers || []
      const prices = offers.map((o: any) => o.unitPrice).filter((p: number) => p > 0)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

      const reScoredOffers = offers.map((offer: any) => {
        const dynamicScore = calculateBuyingScore(
          {
            unitPrice: offer.unitPrice,
            minPrice,
            maxPrice,
            trustScore: offer.trustScore ?? 50,
            availability: offer.availability || 'UNKNOWN',
            shippingCost: offer.shippingCost,
            estimatedDays: offer.estimatedDays,
            matchScore: offer.matchScore ?? 0.8,
            currency: offer.currency,
            isDemo: offer.isDemo,
          },
          priorityMode,
        )

        return {
          ...offer,
          buyingScore: dynamicScore.score,
        }
      })

      // Sort according to priority
      reScoredOffers.sort((a: any, b: any) => {
        if (priorityMode === 'PRICE') {
          return a.totalPrice - b.totalPrice
        }
        if (priorityMode === 'SAFETY') {
          return (b.trustScore ?? 0) - (a.trustScore ?? 0)
        }
        return (b.buyingScore ?? 0) - (a.buyingScore ?? 0)
      })

      return {
        ...item,
        offers: reScoredOffers,
      }
    })
  }, [procurement, priorityMode])

  // Overall calculations
  const { totalEstimatedSpend, totalSavings, hasDemoOffers, totalOffersCount } = useMemo(() => {
    let spend = 0
    let maxSpend = 0
    let demoPresent = false
    let count = 0

    for (const item of rankedItems) {
      if (item.offers && item.offers.length > 0) {
        count += item.offers.length
        const best = item.offers[0]
        spend += best.totalPrice
        if (best.isDemo) demoPresent = true

        const highest = [...item.offers].sort((a, b) => b.totalPrice - a.totalPrice)[0]
        maxSpend += highest ? highest.totalPrice : best.totalPrice
      }
    }

    return {
      totalEstimatedSpend: spend,
      totalSavings: Math.max(0, maxSpend - spend),
      hasDemoOffers: demoPresent,
      totalOffersCount: count,
    }
  }, [rankedItems])

  const handleOptimize = async (fitToBudget = false) => {
    setOptimizing(true)
    try {
      const res = await fetch(`/api/procurements/${id}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minTrustScore: 45, fitToBudget }),
      })
      const data = await res.json()
      if (data.optimization) {
        setOptimization(data.optimization)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setOptimizing(false)
    }
  }

  // Generate All Best Links Summary across all products
  const bestLinksSummary = useMemo(() => {
    return rankedItems.map((item: any) => {
      const bestOffer = item.offers && item.offers.length > 0 ? item.offers[0] : null
      return {
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        bestOffer,
      }
    })
  }, [rankedItems])

  // Comparative Cost Chart Data
  const itemCostsData = useMemo(() => {
    return rankedItems
      .filter((item: any) => item.offers && item.offers.length > 0)
      .map((item: any) => {
        const sorted = [...item.offers].sort((a: any, b: any) => a.totalPrice - b.totalPrice)
        const best = sorted[0]
        const worst = sorted[sorted.length - 1]
        return {
          name: item.name,
          bestPrice: best?.totalPrice || 0,
          worstPrice: worst?.totalPrice || best?.totalPrice || 0,
          savings: Math.max(0, (worst?.totalPrice || 0) - (best?.totalPrice || 0)),
          quantity: item.quantity,
        }
      })
  }, [rankedItems])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/procurements/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar compra')
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message)
      setIsDeleting(false)
    }
  }

  const openEditBudgetModal = () => {
    setEditBudgetValue(procurement?.budget != null ? String(procurement.budget) : '')
    setShowEditBudgetModal(true)
  }

  const handleSaveBudget = async () => {
    setIsSavingBudget(true)
    try {
      const newBudget = editBudgetValue.trim() !== '' ? parseFloat(editBudgetValue) : null
      const res = await fetch(`/api/procurements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: newBudget }),
      })
      if (!res.ok) throw new Error('Error al actualizar el presupuesto')
      setProcurement((prev: any) => ({ ...prev, budget: newBudget }))
      setShowEditBudgetModal(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSavingBudget(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Cargando cotización...
        </p>
      </div>
    )
  }

  if (error || !procurement) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          No se pudo encontrar la compra
        </h2>
        <p className="text-xs text-slate-500">{error || 'ID inválido o inexistente'}</p>
        <Button onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
      </div>
    )
  }

  const isStillSearching = isSearching || procurement.status === 'SEARCHING'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#232a38]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-tight ${
                isStillSearching
                  ? 'bg-[#f0f5ff] text-[#0066cc] dark:bg-[#1e3a8a]/30 dark:text-[#60a5fa] border border-[#bfdbfe]'
                  : totalOffersCount > 0
                  ? 'bg-[#edfcf2] text-[#059669] dark:bg-[#064e3b]/30 dark:text-[#34d399] border border-[#a7f3d0]'
                  : 'bg-[#f4f6f8] text-[#697386] dark:bg-[#1e2430] dark:text-[#8792a2] border border-[#e3e8ee]'
              }`}
            >
              {isStillSearching ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] animate-pulse" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              )}
              {isStillSearching ? 'Buscando distribuidores' : totalOffersCount > 0 ? 'Cotización lista' : 'Sin ofertas'}
            </span>
            <span className="text-xs text-[#697386] dark:text-[#8792a2]">· Moneda: {procurement.currency}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white">
            {procurement.name}
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2]">
            {rankedItems.length} artículos · {totalOffersCount} cotizaciones calculadas
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {totalOffersCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLinksSummaryModal(true)}
              className="gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#635bff]" />
              <span>Mejores enlaces</span>
            </Button>
          )}

          {totalOffersCount > 0 && procurement.budget != null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOptimize(true)}
              isLoading={optimizing}
              className="gap-1.5 font-semibold text-[#059669] border-[#a7f3d0] dark:border-[#059669]/40 hover:bg-[#edfcf2] dark:hover:bg-[#064e3b]/20"
              title="Ajustar la combinación de proveedores para no sobrepasar el presupuesto"
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Ajustar a presupuesto</span>
            </Button>
          )}

          {totalOffersCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOptimize(false)}
              isLoading={optimizing}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimizar cesta</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={triggerSearch}
            isLoading={isStillSearching}
            className="gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Actualizar precios</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="gap-1.5 text-[#df1b41] hover:text-[#c9173a] hover:bg-[#fff1f2] dark:hover:bg-[#881337]/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Demo data notice */}
      {hasDemoOffers && <DemoDataBanner />}

      {/* Searching live progress banner */}
      {isStillSearching && (
        <div className="p-3.5 rounded-lg border border-[#bfdbfe] dark:border-[#1d4ed8]/40 bg-[#f0f5ff] dark:bg-[#1e3a8a]/20 flex items-center gap-3 text-xs text-[#0066cc] dark:text-[#60a5fa]">
          <div className="w-4 h-4 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin shrink-0" />
          <div>
            <span className="font-semibold block mb-0.5">Consultando distribuidores en vivo...</span>
            <span className="opacity-90 text-[11px]">
              Buscando precios y disponibilidad en Amazon, MercadoLibre, CyberPuerta, Lenovo, Dell, Walmart y OfficeDepot.
            </span>
          </div>
        </div>
      )}

      {/* KPI & Budget summary */}
      {totalOffersCount > 0 && (
        <BudgetTracker
          budget={procurement.budget}
          estimatedCost={totalEstimatedSpend}
          totalSavings={totalSavings}
          currency={procurement.currency}
          onEditBudget={openEditBudgetModal}
        />
      )}

      {/* Cost dispersion chart per product (Stripe comparative bar chart) */}
      {totalOffersCount > 0 && itemCostsData.length > 0 && (
        <ProcurementCostChart items={itemCostsData} currency={procurement.currency} />
      )}

      {/* Priority mode selector */}
      {totalOffersCount > 0 && (
        <div className="p-3.5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[#0a2540] dark:text-white block">
              Criterio de clasificación
            </span>
            <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
              Ponderación para clasificar los proveedores según tu prioridad.
            </p>
          </div>
          <PriorityModeSelector value={priorityMode} onChange={setPriorityMode} />
        </div>
      )}


      {/* Optimization Panel */}
      {optimization && (
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                  {optimization.strategy === 'strict_budget'
                    ? 'Cesta Ajustada al Presupuesto'
                    : 'Cesta Optimizada Multi-Proveedor'}
                </h3>
                {optimization.fitsBudget ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#edfcf2] text-[#059669] border border-[#a7f3d0] dark:bg-[#064e3b]/30 dark:text-[#34d399] dark:border-[#059669]/40">
                    <CheckCircle2 className="w-3 h-3" /> Dentro del Presupuesto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#fff1f2] text-[#df1b41] border border-[#fecdd3] dark:bg-[#881337]/30 dark:text-[#fb7185] dark:border-[#be123c]/40">
                    <AlertTriangle className="w-3 h-3" /> Excede Presupuesto
                  </span>
                )}
              </div>
              <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                {optimization.strategy === 'strict_budget'
                  ? 'Opciones filtradas y combinadas para no sobrepasar el límite presupuestal.'
                  : 'Combinación balanceada para reducir el costo total con proveedores verificados.'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block">Total optimizado</span>
              <span className="text-xl font-bold text-[#0a2540] dark:text-white tabular-nums">
                {formatCurrency(optimization.totalCost, optimization.currency)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-md bg-[#f8fafc] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38]">
              <span className="text-[#697386] dark:text-[#8792a2] text-[11px] block mb-0.5">Ahorro total</span>
              <span className="text-sm font-bold text-[#059669] dark:text-[#34d399] tabular-nums">
                {formatCurrency(optimization.totalSavings, optimization.currency)}
              </span>
            </div>
            <div className="p-3 rounded-md bg-[#f8fafc] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38]">
              <span className="text-[#697386] dark:text-[#8792a2] text-[11px] block mb-0.5">Nivel de confianza</span>
              <span className="text-sm font-bold text-[#0a2540] dark:text-white">
                {optimization.trustLevel === 'HIGH' ? 'Verificación alta' : 'Riesgo medio'}
              </span>
            </div>
            <div className="p-3 rounded-md bg-[#f8fafc] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38]">
              <span className="text-[#697386] dark:text-[#8792a2] text-[11px] block mb-0.5">Tiendas involucradas</span>
              <span className="text-sm font-bold text-[#0a2540] dark:text-white">
                {new Set(optimization.assignments.map((a) => a.supplierName)).size} tiendas
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-[#e3e8ee] dark:border-[#232a38] text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] dark:bg-[#1a2130] text-[#697386] dark:text-[#8792a2] text-[11px] font-semibold border-b border-[#e3e8ee] dark:border-[#232a38]">
                <tr>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Tienda</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio unitario</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-center">Trust</th>
                  <th className="py-2.5 px-3 text-right">Enlace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#232a38]">
                {optimization.assignments.map((assign, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/60">
                    <td className="py-2.5 px-3 font-medium text-[#0a2540] dark:text-white">
                      {assign.itemName}
                    </td>
                    <td className="py-2.5 px-3 text-[#635bff] dark:text-[#7a73ff] font-medium">
                      {assign.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#697386] tabular-nums">{assign.quantity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#3c4257] dark:text-[#c1c9d2]">
                      {formatCurrency(assign.unitPrice, optimization.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums text-[#0a2540] dark:text-white">
                      {formatCurrency(assign.totalPrice, optimization.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-[#059669] dark:text-[#34d399] tabular-nums">{assign.trustScore}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <a
                        href={assign.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
                      >
                        Abrir <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-Product Sections */}
      <div className="space-y-6">
        {rankedItems.map((item: any, idx: number) => {
          const offers = item.offers || []

          return (
            <div
              key={item.id || idx}
              className="p-5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] space-y-4"
            >
              {/* Product title header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#f4f6f8] dark:bg-[#1e2430] flex items-center justify-center text-xs font-semibold text-[#3c4257] dark:text-[#c1c9d2] tabular-nums">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#0a2540] dark:text-white tracking-tight">
                      {item.name}
                    </h2>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      Cantidad: <strong className="font-medium text-[#0a2540] dark:text-white">{item.quantity} unidades</strong>
                      {item.brand && ` · ${item.brand}`}
                      {item.model && ` ${item.model}`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#697386] dark:text-[#8792a2] font-medium">
                  {offers.length} ofertas disponibles
                </div>
              </div>

              {/* Recommendation summary card */}
              {offers.length > 0 && (
                <RecommendationCards
                  productName={item.name}
                  quantity={item.quantity}
                  offers={offers}
                  currency={procurement.currency}
                />
              )}

              {/* Full comparison table */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#697386] dark:text-[#8792a2]">
                  Comparativa de distribuidores
                </h3>
                <ComparisonTable
                  offers={offers}
                  quantity={item.quantity}
                  currency={procurement.currency}
                />
              </div>
            </div>
          )
        })}
      </div>


      {/* All Best Links Summary Modal */}
      {showLinksSummaryModal && (
        <div className="fixed inset-0 z-50 bg-[#0a2540]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151a24] rounded-lg border border-[#e3e8ee] dark:border-[#232a38] p-5 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-[0px_20px_40px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
              <div>
                <h3 className="font-semibold text-sm text-[#0a2540] dark:text-white">
                  Resumen de mejores enlaces
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                  Acceso directo a las ofertas más convenientes calculadas para cada artículo.
                </p>
              </div>
              <button
                onClick={() => setShowLinksSummaryModal(false)}
                className="p-1 rounded text-[#697386] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#1e2430] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-[#f4f6f8] dark:divide-[#1e2430] pr-1 text-xs">
              {bestLinksSummary.map((item: any, idx: number) => {
                const offer = item.bestOffer
                return (
                  <div key={item.itemId || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-[#f4f6f8] dark:bg-[#1e2430] flex items-center justify-center text-[10px] font-semibold text-[#697386] dark:text-[#8792a2] tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#0a2540] dark:text-white text-xs">
                          {item.itemName}
                        </span>
                        <span className="text-[#697386] text-[11px]">({item.quantity} u)</span>
                      </div>

                      {offer ? (
                        <div className="text-[#697386] dark:text-[#8792a2] pl-6 text-[11px] flex items-center gap-2 tabular-nums">
                          <span>
                            Tienda: <strong className="text-[#0a2540] dark:text-white font-medium">{offer.supplierName}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Total: <strong className="text-[#0a2540] dark:text-white font-semibold">{formatCurrency(offer.totalPrice, offer.currency || procurement.currency)}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="text-[#a3acb9] pl-6 text-[11px]">
                          Sin enlaces disponibles
                        </div>
                      )}
                    </div>

                    {offer?.sourceUrl && (
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#635bff] hover:bg-[#5349e0] text-white shadow-xs transition-all shrink-0 self-start sm:self-center"
                      >
                        <span>Abrir {offer.supplierName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f4f6f8] dark:border-[#1e2430] text-xs text-[#697386]">
              <span>Total cotizado: <strong className="text-[#0a2540] dark:text-white font-bold tabular-nums">{formatCurrency(totalEstimatedSpend, procurement.currency)}</strong></span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLinksSummaryModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#0a2540]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151a24] rounded-lg border border-[#e3e8ee] dark:border-[#232a38] p-5 max-w-sm w-full space-y-3 shadow-[0px_20px_40px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-2.5 text-[#df1b41]">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-semibold text-sm text-[#0a2540] dark:text-white">
                ¿Eliminar esta cotización?
              </h3>
            </div>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] leading-relaxed">
              Esta acción eliminará de forma permanente &quot;{procurement.name}&quot; y todas las cotizaciones guardadas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget modal */}
      {showEditBudgetModal && (
        <div className="fixed inset-0 z-50 bg-[#0a2540]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151a24] rounded-lg border border-[#e3e8ee] dark:border-[#232a38] p-5 max-w-sm w-full space-y-4 shadow-[0px_20px_40px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#f4f6f8] dark:border-[#1e2430]">
              <h3 className="font-semibold text-sm text-[#0a2540] dark:text-white">
                Definir / Editar Presupuesto
              </h3>
              <button
                onClick={() => setShowEditBudgetModal(false)}
                className="p-1 rounded text-[#697386] hover:text-[#0a2540] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1">
                  Monto límite ({procurement.currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editBudgetValue}
                  onChange={(e) => setEditBudgetValue(e.target.value)}
                  placeholder="Ej. 100000 o vacío para sin límite"
                  className="w-full h-8 px-3 text-xs tabular-nums bg-[#f8fafc] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38] rounded-md text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff]"
                />
              </div>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-[#8792a2] text-[10px]">Atajos:</span>
                {[
                  { label: '$25k', val: '25000' },
                  { label: '$50k', val: '50000' },
                  { label: '$100k', val: '100000' },
                  { label: '$250k', val: '250000' },
                  { label: 'Sin límite', val: '' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setEditBudgetValue(preset.val)}
                    className="px-2 py-0.5 rounded border border-[#e3e8ee] dark:border-[#232a38] bg-[#f8fafc] dark:bg-[#1a2130] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f4f6f8] dark:border-[#1e2430]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditBudgetModal(false)}
                disabled={isSavingBudget}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveBudget}
                isLoading={isSavingBudget}
              >
                Guardar presupuesto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
