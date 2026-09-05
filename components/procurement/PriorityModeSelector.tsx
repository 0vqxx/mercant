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
    <div className={cn('inline-flex items-center p-0.5 rounded-md bg-[#f4f6f8] dark:bg-[#1e2430] border border-[#e3e8ee] dark:border-[#232a38]', className)}>
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
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all cursor-pointer select-none font-medium',
              isActive
                ? 'bg-white dark:bg-[#151a24] text-[#0a2540] dark:text-white shadow-[0px_1px_1px_rgba(0,0,0,0.06)] border border-[#d8dee4] dark:border-[#2e3748] font-semibold'
                : 'text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white border border-transparent',
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#635bff]' : 'text-[#8792a2]')} />
            <span>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

