'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Sparkles,
  Tag,
  Star,
} from 'lucide-react'
import {
  ALL_SUPPLIERS,
  CATEGORY_METADATA,
  type SupplierCategory,
  type SupplierEntry,
} from '@/lib/connectors/supplier_database'

export default function SuppliersPage() {
  const [procurements, setProcurements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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

  // Filter 500+ master supplier catalog
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return ALL_SUPPLIERS.filter((sup) => {
      const matchCat = selectedCategory === 'all' || sup.category === selectedCategory
      if (!matchCat) return false
      if (!q) return true
      return (
        sup.name.toLowerCase().includes(q) ||
        sup.domain.toLowerCase().includes(q) ||
        sup.categoryLabel.toLowerCase().includes(q) ||
        sup.description.toLowerCase().includes(q) ||
        sup.keywords.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [searchQuery, selectedCategory])

  const categories = Object.entries(CATEGORY_METADATA) as [
    SupplierCategory,
    { label: string; icon: string; description: string },
  ][]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#232a38]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#635bff]/10 text-[#635bff] dark:bg-[#635bff]/20 dark:text-[#a5a0ff] border border-[#635bff]/20">
              Directorio B2B Multi-Industria
            </span>
            <span className="text-xs text-[#697386] dark:text-[#8792a2]">
              {ALL_SUPPLIERS.length} Proveedores Verificados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white">
            Red de Proveedores & Distribuidores Oficiales
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Catálogo exhaustivo indexado para licitaciones públicas y compras corporativas en México y LATAM.
          </p>
        </div>

        <Link
          href="/procurements/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#635bff] text-white hover:bg-[#5349e0] shadow-xs cursor-pointer"
        >
          <span>Nueva cotización</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Proveedores en Catálogo</span>
            <Building2 className="w-3.5 h-3.5 text-[#635bff]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
            {ALL_SUPPLIERS.length}
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5">
            16 sectores industriales cubiertos
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Confiabilidad Promedio (Trust Score)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#059669] dark:text-[#34d399] tabular-nums">
            96 / 100
          </div>
          <div className="text-[11px] text-[#059669] dark:text-[#34d399] mt-1.5 font-medium">
            Distribuidores verificados con CFDI 4.0
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
            <span>Enrutamiento Inteligente</span>
            <Sparkles className="w-3.5 h-3.5 text-[#0070f3]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
            100% Automático
          </div>
          <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5">
            Detección semántica por producto
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#8792a2] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, categoría, insumo o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] text-xs text-[#0a2540] dark:text-white placeholder-[#8792a2] focus:outline-none focus:ring-2 focus:ring-[#635bff]"
            />
          </div>

          <div className="text-xs text-[#697386] dark:text-[#8792a2] self-end sm:self-center">
            Mostrando <span className="font-semibold text-[#0a2540] dark:text-white">{filteredCatalog.length}</span> de {ALL_SUPPLIERS.length} proveedores
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0a2540] text-white dark:bg-[#635bff]'
                : 'bg-white dark:bg-[#151a24] text-[#4f566b] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#232a38] hover:bg-[#f4f6f8]'
            }`}
          >
            Todos ({ALL_SUPPLIERS.length})
          </button>
          {categories.map(([key, meta]) => {
            const count = ALL_SUPPLIERS.filter((s) => s.category === key).length
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-[#0a2540] text-white dark:bg-[#635bff]'
                    : 'bg-white dark:bg-[#151a24] text-[#4f566b] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#232a38] hover:bg-[#f4f6f8]'
                }`}
              >
                <span>{meta.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] dark:bg-[#1a2130] text-[#697386] dark:text-[#8792a2] font-semibold text-[11px] border-b border-[#e3e8ee] dark:border-[#232a38]">
              <tr>
                <th className="py-2.5 px-4">Distribuidor / Tienda Oficial</th>
                <th className="py-2.5 px-4">Categoría Principal</th>
                <th className="py-2.5 px-4">Dominio Web</th>
                <th className="py-2.5 px-4">Confiabilidad (Trust Score)</th>
                <th className="py-2.5 px-4">Calificación</th>
                <th className="py-2.5 px-4">Cobertura / Especialidad</th>
                <th className="py-2.5 px-4 text-right">Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#232a38] text-[#3c4257] dark:text-[#c1c9d2]">
              {filteredCatalog.slice(0, 100).map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/60 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-[#0a2540] dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#635bff]" />
                    <span>{s.name}</span>
                    {s.verified && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#edfcf2] text-[#059669] border border-[#a7f3d0]">
                        VERIFICADO
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#f4f6f8] dark:bg-[#1e2430] text-[#4f566b] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#232a38]">
                      {s.categoryLabel}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#697386] dark:text-[#8792a2] font-mono text-[11px]">
                    {s.domain}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0a2540] dark:text-white tabular-nums">
                        {s.trustBaseline}/100
                      </span>
                      <div className="w-16 bg-[#f4f6f8] dark:bg-[#1e2430] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#059669]"
                          style={{ width: `${s.trustBaseline}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-[#b45309] dark:text-[#fbbf24] font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{s.baseRating}</span>
                      <span className="text-[10px] text-[#8792a2] font-normal">({s.reviews})</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[#697386] dark:text-[#8792a2] max-w-xs truncate text-[11px]">
                    {s.description}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <a
                      href={s.buildUrl('insumos')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
