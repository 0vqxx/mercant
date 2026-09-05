import React from 'react'
import { AlertCircle } from 'lucide-react'

export function DemoDataBanner() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-medium">
      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
      <div className="flex-1">
        <span className="font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded text-[10px] mr-2">
          DEMO DATA
        </span>
        Algunos resultados marcados como simulados se generaron para propósitos de demostración. Los proveedores reales incluyen enlaces directos y fecha de consulta.
      </div>
    </div>
  )
}
