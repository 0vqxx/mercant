import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuyingScoreBadgeProps {
  score: number | null
  className?: string
}

export function BuyingScoreBadge({ score, className }: BuyingScoreBadgeProps) {
  if (score == null) return null

  let label = 'Recomendado'
  let color = 'bg-[#f4f6f8] text-[#3c4257] border-[#e3e8ee] dark:bg-[#1e2430] dark:text-[#c1c9d2] dark:border-[#2e3748]'

  if (score >= 88) {
    label = 'Mejor Opción'
    color = 'bg-[#edfcf2] text-[#059669] border-[#a7f3d0] dark:bg-[#064e3b]/30 dark:text-[#34d399] dark:border-[#059669]/40 font-semibold'
  } else if (score >= 75) {
    label = 'Recomendado'
    color = 'bg-[#f0f5ff] text-[#0066cc] border-[#bfdbfe] dark:bg-[#1e3a8a]/30 dark:text-[#60a5fa] dark:border-[#1d4ed8]/40 font-medium'
  } else if (score >= 60) {
    label = 'Aceptable'
    color = 'bg-[#f4f6f8] text-[#4f566b] border-[#e3e8ee] dark:bg-[#1e2430] dark:text-[#8792a2] dark:border-[#2e3748]'
  } else {
    label = 'Bajo'
    color = 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] dark:bg-[#881337]/30 dark:text-[#fb7185] dark:border-[#be123c]/40'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border tracking-tight tabular-nums',
        color,
        className,
      )}
    >
      <span>{label}</span>
      <span className="opacity-60">·</span>
      <span className="font-semibold">{score}</span>
    </span>
  )
}

