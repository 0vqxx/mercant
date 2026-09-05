'use client'

import React from 'react'
import type { PriorityMode } from '@/types'
import { DollarSign, ShieldCheck, Zap, Star, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriorityModeSelectorProps {
  value: PriorityMode
  onChange: (mode: PriorityMode) => void
  className?: string
}

const MODES: Array<{
  key: PriorityMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  desc: string
}> = [
  { key: 'BALANCE', label: 'Mejor balance', icon: Scale, desc: 'Equilibrio precio/riesgo' },
  { key: 'PRICE', label: 'Precio', icon: DollarSign, desc: 'Maximiza el ahorro' },
  { key: 'SAFETY', label: 'Seguridad', icon: ShieldCheck, desc: 'Proveedores con mayor confianza' },
  { key: 'SPEED', label: 'Velocidad', icon: Zap, desc: 'Entrega más rápida' },
  { key: 'QUALITY', label: 'Calidad', icon: Star, desc: 'Mejores especificaciones y reputación' },
]

export function PriorityModeSelector({
  value,
  onChange,
  className,
}: PriorityModeSelectorProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1 rounded-lg bg-[#f4f6f8] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] w-full',
        className
      )}
    >
      {MODES.map((m) => {
        const Icon = m.icon
        const isActive = value === m.key
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            title={m.desc}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer select-none font-medium text-center',
              isActive
                ? 'bg-white dark:bg-[#1a2236] text-[#635bff] dark:text-[#7a73ff] shadow-xs border border-[#e3e8ee] dark:border-[#2e3748] font-semibold'
                : 'text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#182030] border border-transparent',
            )}
          >
            <Icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-[#635bff] dark:text-[#7a73ff]' : 'text-[#8792a2]')} />
            <span className="truncate">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

