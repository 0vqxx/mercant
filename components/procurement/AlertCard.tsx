import React from 'react'
import type { AlertType, AlertSeverity } from '@/types'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  type: AlertType
  severity: AlertSeverity
  message: string
  detail?: string | null
  className?: string
}

export function AlertCard({
  severity,
  message,
  detail,
  className,
}: AlertCardProps) {
  const getMeta = () => {
    switch (severity) {
      case 'DANGER':
        return {
          icon: AlertCircle,
          container:
            'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400',
          iconColor: 'text-red-500',
        }
      case 'WARNING':
        return {
          icon: AlertTriangle,
          container:
            'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400',
          iconColor: 'text-amber-500',
        }
      case 'INFO':
      default:
        return {
          icon: Info,
          container:
            'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400',
          iconColor: 'text-blue-500',
        }
    }
  }

  const meta = getMeta()
  const Icon = meta.icon

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 p-3 rounded-lg border text-xs',
        meta.container,
        className,
      )}
    >
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', meta.iconColor)} />
      <div className="space-y-0.5">
        <p className="font-semibold leading-snug">{message}</p>
        {detail && (
          <p className="opacity-90 font-normal leading-relaxed">{detail}</p>
        )}
      </div>
    </div>
  )
}
