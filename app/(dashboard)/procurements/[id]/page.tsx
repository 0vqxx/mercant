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
import { generateOffersForItem, populateProcurementOffers } from '@/lib/connectors/generateOffers'
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
  ShoppingCart,
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
    if (!id) {
      setLoading(false)
      return null
    }

    let localData: any = null
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mercant_procurement_' + id)
        if (saved) {
          const parsed = JSON.parse(saved)
          localData = populateProcurementOffers(parsed)
          setProcurement(localData)
          if (localData?.priorityMode) {
            setPriorityMode(localData.priorityMode)
          }
          setLoading(false)
        }
      } catch {}
    }

    try {
      const res = await fetch(`/api/procurements/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.procurement) {
          const populated = populateProcurementOffers(data.procurement)
          setProcurement(populated)
          if (data.procurement?.priorityMode) {
            setPriorityMode(data.procurement.priorityMode)
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('mercant_procurement_' + id, JSON.stringify(populated))
            } catch {}
          }
          setError(null)
          setLoading(false)
          return populated
        }
      }
    } catch (err: any) {
      console.warn('[fetchProcurement] API fetch warning:', err)
    }

    if (localData) {
      setProcurement(localData)
      if (localData.priorityMode) {
        setPriorityMode(localData.priorityMode)
      }
      setError(null)
      setLoading(false)
      return localData
    }

    // Check all procurements cache if individual item not found
    if (typeof window !== 'undefined') {
      try {
        const allCache = localStorage.getItem('mercant_procurements_cache')
        if (allCache) {
          const list = JSON.parse(allCache)
          const found = Array.isArray(list) ? list.find((p: any) => p.id === id) : null
          if (found) {
            const populated = populateProcurementOffers(found)
            setProcurement(populated)
            if (found.priorityMode) setPriorityMode(found.priorityMode)
            setError(null)
            setLoading(false)
            return populated
          }
        }
      } catch {}
    }

    setError('No se pudo encontrar la cotización')
    setLoading(false)
    return null
  }

  const triggerSearch = async (procToSearch?: any) => {
    setIsSearching(true)
    const currentProc = procToSearch || procurement
    try {
      const res = await fetch(`/api/procurements/${id}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procurement: currentProc,
          items: currentProc?.items,
          currency: currentProc?.currency,
          priorityMode: currentProc?.priorityMode || priorityMode,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.procurement) {
          const completedProc = populateProcurementOffers(data.procurement)
          setProcurement(completedProc)
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('mercant_procurement_' + id, JSON.stringify(completedProc))
            } catch {}
          }
          setIsSearching(false)
          return
        }
      }

      const refreshed = await fetchProcurement()
      if (refreshed) {
        const completedProc = populateProcurementOffers(refreshed)
        setProcurement(completedProc)
      }
    } catch (e) {
      console.error('Error running search:', e)
      setProcurement((prev: any) => (prev ? populateProcurementOffers(prev) : prev))
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
          triggerSearch(proc)
        }
      }
    })
  }, [id, startSearch])

  // Dynamic ranking based on selected priority mode
  const rankedItems = useMemo(() => {
    if (!procurement?.items) return []

    return procurement.items.map((item: any) => {
      let offers = item.offers && item.offers.length > 0 ? item.offers : generateOffersForItem(item, priorityMode)
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
    if (!confirm('¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) {
      return
    }
    setIsDeleting(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mercant_procurement_' + id)
        try {
          const cached = localStorage.getItem('mercant_procurements_cache')
          if (cached) {
            const list = JSON.parse(cached)
            localStorage.setItem('mercant_procurements_cache', JSON.stringify(list.filter((p: any) => p.id !== id)))
          }
        } catch {}
        try {
          const listSaved = localStorage.getItem('mercant_procurements_list')
          if (listSaved) {
            const list = JSON.parse(listSaved)
            localStorage.setItem('mercant_procurements_list', JSON.stringify(list.filter((p: any) => p.id !== id)))
          }
        } catch {}
      }

      await fetch(`/api/procurements/${id}`, { method: 'DELETE' }).catch(() => {})
      router.push('/procurements')
    } catch (err: any) {
      console.error('[handleDelete] Error:', err)
      router.push('/procurements')
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

  const isStillSearching = isSearching || (procurement.status === 'SEARCHING' && totalOffersCount === 0)

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
              variant="primary"
              size="sm"
              onClick={() => setShowLinksSummaryModal(true)}
              className="gap-1.5 bg-[#059669] hover:bg-[#047857] text-white border-none shadow-sm"
              title="Comprar todos los artículos o añadirlos directamente al carrito del proveedor"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Comprar Cesta (1 Clic)</span>
            </Button>
          )}

          {totalOffersCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLinksSummaryModal(true)}
              className="gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#635bff]" />
              <span>Ver enlaces</span>
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
              variant="secondary"
              size="sm"
              onClick={() => handleOptimize(false)}
              isLoading={optimizing}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
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
            <span className="font-semibold block mb-0.5">Consultando distribuidores especializados en vivo...</span>
            <span className="opacity-90 text-[11px]">
              Buscando precios y disponibilidad en tiempo real en la red de más de 500 distribuidores verificados por categoría (Tecnología, Mobiliario, Ferretería, EPP, Médico, Limpieza, Eléctrico, etc.).
            </span>
          </div>
        </div>
      )}

      {/* Hero CTA if no offers calculated yet */}
      {!isStillSearching && totalOffersCount === 0 && (
        <div className="p-8 rounded-xl border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#635bff]/10 text-[#635bff] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0a2540] dark:text-white">
              Cotización lista para consultar distribuidores en vivo
            </h3>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] max-w-md mx-auto mt-1">
              Obtén precios de mercado, stock verificado y comparativa directa en más de 500 distribuidores para los {rankedItems.length} artículos de tu solicitud.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => triggerSearch()}
            isLoading={isSearching}
            className="gap-2 bg-[#635bff] hover:bg-[#5349e0] text-white px-6 py-2.5 rounded-lg shadow-md font-semibold text-xs cursor-pointer inline-flex items-center mx-auto"
          >
            <RotateCw className="w-4 h-4" />
            <span>Cotizar 12 Artículos en Vivo con 500+ Proveedores</span>
          </Button>
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


      {/* All Best Links & 1-Click Purchase Center Modal */}
      {showLinksSummaryModal && (
        <div className="fixed inset-0 z-50 bg-[#0a2540]/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151a24] rounded-2xl border border-[#e3e8ee] dark:border-[#232a38] p-6 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-5 shadow-[0px_20px_50px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#232a38]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0a2540] dark:text-white flex items-center gap-2">
                    <span>Centro de Compra Directa & Carrito</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Multi-Tienda
                    </span>
                  </h3>
                  <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                    Abre los enlaces de los proveedores calculados para comprar o añadir a tu carrito en 1 clic.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinksSummaryModal(false)}
                className="p-1.5 rounded-lg text-[#697386] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#1e2430] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#635bff]/10 via-emerald-500/10 to-transparent border border-[#635bff]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#0a2540] dark:text-white block">
                  Compra de Cesta Consolidada ({bestLinksSummary.length} productos)
                </span>
                <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                  Costo total optimizado: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalEstimatedSpend, procurement.currency)}</strong>
                  {totalSavings > 0 && ` · Ahorro estimado: ${formatCurrency(totalSavings, procurement.currency)}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const urls = bestLinksSummary
                    .map((item: any) => item.bestOffer?.sourceUrl)
                    .filter((url: string | undefined): url is string => Boolean(url))
                  
                  if (urls.length === 0) {
                    alert('No hay enlaces disponibles para abrir')
                    return
                  }

                  urls.forEach((url: string) => {
                    window.open(url, '_blank', 'noopener,noreferrer')
                  })
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Abrir todos los carritos en pestañas</span>
              </button>
            </div>

            {/* Products List */}
            <div className="overflow-y-auto divide-y divide-[#e3e8ee] dark:divide-[#232a38] pr-1 text-xs max-h-[50vh]">
              {bestLinksSummary.map((item: any, idx: number) => {
                const offer = item.bestOffer
                return (
                  <div key={item.itemId || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/40 px-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#635bff]/10 dark:bg-[#7a73ff]/20 flex items-center justify-center text-[10px] font-bold text-[#635bff] dark:text-[#7a73ff] tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#0a2540] dark:text-white text-xs">
                          {item.itemName}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1e2430] text-[#697386] dark:text-[#8792a2]">
                          Cant: {item.quantity}
                        </span>
                      </div>

                      {offer ? (
                        <div className="text-[#697386] dark:text-[#8792a2] pl-7 text-[11px] flex items-center gap-3 tabular-nums flex-wrap">
                          <span>
                            Tienda: <strong className="text-[#0a2540] dark:text-white font-semibold">{offer.supplierName}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Unitario: <strong className="text-[#0a2540] dark:text-white font-mono">{formatCurrency(offer.unitPrice, offer.currency || procurement.currency)}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Total: <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{formatCurrency(offer.totalPrice, offer.currency || procurement.currency)}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="text-[#a3acb9] pl-7 text-[11px]">
                          Sin enlaces de compra disponibles
                        </div>
                      )}
                    </div>

                    {offer?.sourceUrl && (
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#635bff] dark:bg-[#7a73ff] hover:opacity-90 text-white shadow-xs transition-all shrink-0 self-start sm:self-center"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Comprar en {offer.supplierName}</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e3e8ee] dark:border-[#232a38] text-xs text-[#697386] dark:text-[#8792a2]">
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
