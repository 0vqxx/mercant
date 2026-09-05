'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PlusCircle, ShoppingCart, ArrowUpRight } from 'lucide-react'

export default function ProcurementsListPage() {
  const [procurements, setProcurements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let localList: any[] = []
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mercant_procurements_list')
        if (saved) localList = JSON.parse(saved)
      } catch {}
    }

    fetch('/api/procurements')
      .then((res) => (res.ok ? res.json() : { procurements: [] }))
      .then((data) => {
        const serverList = data.procurements || []
        // Merge without duplicates
        const map = new Map<string, any>()
        for (const p of localList) map.set(p.id, p)
        for (const p of serverList) map.set(p.id, p)
        setProcurements(Array.from(map.values()))
      })
      .catch((err) => {
        console.warn('[ProcurementsListPage] Notice:', err)
        setProcurements(localList)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#1e2430]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-[#0a2540] dark:text-white">
            Mis Compras y Solicitudes
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Historial de sesiones de sourcing, presupuestos asignados y estado de búsqueda.
          </p>
        </div>

        <Link
          href="/procurements/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#635bff] hover:bg-[#5349e0] text-white shadow-sm dark:shadow-[0_0_15px_rgba(99,91,255,0.35)] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva compra</span>
        </Link>
      </div>

      <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] shadow-xs dark:shadow-md overflow-hidden">
        {procurements.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto text-[#8792a2] mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-[#0a2540] dark:text-white mb-1">
              No tienes compras registradas todavía
            </h4>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] max-w-sm mx-auto mb-4">
              Comienza una nueva búsqueda para cotizar listas completas de productos automáticamente.
            </p>
            <Link
              href="/procurements/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#635bff] text-white hover:bg-[#5349e0] dark:shadow-[0_0_15px_rgba(99,91,255,0.35)]"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Iniciar primera compra
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] dark:bg-[#101522] text-[#697386] dark:text-[#8792a2] font-semibold text-[11px] border-b border-[#e3e8ee] dark:border-[#1e2430]">
                <tr>
                  <th className="py-3 px-5">Nombre</th>
                  <th className="py-3 px-5">Productos</th>
                  <th className="py-3 px-5">Presupuesto</th>
                  <th className="py-3 px-5">Prioridad</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5">Fecha creación</th>
                  <th className="py-3 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#1e2430] text-[#3c4257] dark:text-[#c1c9d2]">
                {procurements.map((proc: any) => (
                  <tr
                    key={proc.id}
                    className="hover:bg-[#f8fafc] dark:hover:bg-[#121826]/70 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-[#0a2540] dark:text-[#0a2540] dark:text-white">
                      <Link
                        href={`/procurements/${proc.id}`}
                        className="hover:text-[#635bff] dark:hover:text-[#7a73ff]"
                      >
                        {proc.name}
                      </Link>
                    </td>

                    <td className="py-3.5 px-5 text-[#697386] dark:text-[#8792a2] tabular-nums">
                      {proc.items.length} productos
                    </td>

                    <td className="py-3.5 px-5 font-medium text-[#0a2540] dark:text-white tabular-nums">
                      {proc.budget ? formatCurrency(proc.budget, proc.currency) : 'Sin límite'}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#f4f6f8] dark:bg-[#121826] text-[#4f566b] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#1e2430]">
                        {proc.priorityMode}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          proc.status === 'COMPLETED'
                            ? 'bg-[#edfcf2] text-[#059669] dark:bg-emerald-950/50 dark:text-emerald-300 border border-[#a7f3d0] dark:border-emerald-900/40'
                            : proc.status === 'SEARCHING'
                            ? 'bg-[#f0f5ff] text-[#0066cc] dark:bg-blue-950/50 dark:text-blue-300 border border-[#bfdbfe] dark:border-blue-900/40 animate-pulse'
                            : 'bg-[#f4f6f8] text-[#697386] dark:bg-[#121826] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#1e2430]'
                        }`}
                      >
                        {proc.status === 'COMPLETED' ? 'Completada' : proc.status === 'SEARCHING' ? 'Buscando' : 'Borrador'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-[#697386] dark:text-[#8792a2] whitespace-nowrap text-[11px] tabular-nums">
                      {formatDate(proc.createdAt)}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/procurements/${proc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline"
                      >
                        <span>Ver resultados</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
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
