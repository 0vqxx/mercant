'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#0c1018] rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] p-6 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[#df1b41] dark:text-[#ff6b6b] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0a2540] dark:text-white">
            No se pudo cargar el módulo
          </h2>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] leading-relaxed">
            Ocurrió una inconsistencia temporal al consultar la información. Puedes reintentar la conexión o volver al inicio.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#635bff] hover:bg-[#5349e0] text-white shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#f4f6f8] dark:bg-[#121826] text-[#0a2540] dark:text-white border border-[#e3e8ee] dark:border-[#1e2430] hover:bg-[#e3e8ee]/60 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Ir al Resumen</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
