'use client'

import React, { useState } from 'react'
import type { TrustCategory } from '@/types'
import { ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgeProps {
  score: number | null
  category?: TrustCategory | null
  explanation?: string | null
  showDetails?: boolean
  className?: string
}

export function TrustBadge({
  score,
  category,
  explanation,
  showDetails = true,
  className,
}: TrustBadgeProps) {
  const [open, setOpen] = useState(false)

  if (score == null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
        <Info className="w-3.5 h-3.5" /> No disponible
      </span>
    )
  }

  const getCategoryMeta = () => {
    if (score >= 80) {
      return {
        label: 'Verificado',
        color: 'bg-[#edfcf2] text-[#059669] border-[#a7f3d0] dark:bg-[#064e3b]/30 dark:text-[#34d399] dark:border-[#059669]/40',
        icon: ShieldCheck,
      }
    }
    if (score >= 65) {
      return {
        label: 'Confiable',
        color: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0] dark:bg-[#14532d]/30 dark:text-[#4ade80] dark:border-[#16a34a]/40',
        icon: ShieldCheck,
      }
    }
    if (score >= 45) {
      return {
        label: 'Revisar',
        color: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a] dark:bg-[#78350f]/30 dark:text-[#fbbf24] dark:border-[#d97706]/40',
        icon: ShieldAlert,
      }
    }
    if (score >= 25) {
      return {
        label: 'Alto riesgo',
        color: 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] dark:bg-[#881337]/30 dark:text-[#fb7185] dark:border-[#be123c]/40',
        icon: ShieldX,
      }
    }
    return {
      label: 'Sin verificar',
      color: 'bg-[#f4f6f8] text-[#697386] border-[#e3e8ee] dark:bg-[#1e2430] dark:text-[#8792a2] dark:border-[#2e3748]',
      icon: Info,
    }
  }


  const meta = getCategoryMeta()
  const Icon = meta.icon

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer select-none',
          meta.color,
          className,
        )}
        title="Haz clic para ver desglose de confianza"
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="font-bold">{score}/100</span>
        <span className="hidden sm:inline text-[11px] opacity-85">· {meta.label}</span>
      </button>

      {open && showDetails && (
        <div className="absolute z-50 mt-2 w-72 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl text-left text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
              <Icon className="w-3.5 h-3.5 text-indigo-500" /> Trust Score: {score}/100
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {meta.label}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
            {explanation || 'Evaluación de seguridad basada en señales de reputación, historial y consistencia de precios.'}
          </p>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 text-[10px] text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Ninguna métrica garantiza seguridad absoluta. Verifica siempre antes de ordenar.</span>
          </div>
        </div>
      )}
    </div>
  )
}
