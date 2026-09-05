import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingDown, PiggyBank, Edit3, PlusCircle } from 'lucide-react'

interface BudgetTrackerProps {
  budget: number | null
  estimatedCost: number
  totalSavings: number
  currency?: string
  onEditBudget?: () => void
}

export function BudgetTracker({
  budget,
  estimatedCost,
  totalSavings,
  currency = 'MXN',
  onEditBudget,
}: BudgetTrackerProps) {
  const remaining = budget != null ? budget - estimatedCost : null
  const percentUsed =
    budget != null && budget > 0 ? Math.min(100, Math.round((estimatedCost / budget) * 100)) : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {budget != null ? (
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#635bff]" />
                <span>Presupuesto</span>
              </span>
              {onEditBudget && (
                <button
                  type="button"
                  onClick={onEditBudget}
                  className="p-1 text-[#697386] hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors cursor-pointer"
                  title="Modificar presupuesto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
              {formatCurrency(budget, currency)}
            </div>
          </div>
          {percentUsed != null && (
            <div className="mt-3">
              <div className="w-full bg-[#f4f6f8] dark:bg-[#1e2430] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentUsed > 90 ? 'bg-[#df1b41]' : percentUsed > 70 ? 'bg-[#f59e0b]' : 'bg-[#00d924]'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5 font-medium tabular-nums">
                <span>{percentUsed}% utilizado</span>
                <span>
                  {remaining != null && remaining >= 0
                    ? `Restante: ${formatCurrency(remaining, currency)}`
                    : `Excedido: ${formatCurrency(Math.abs(remaining || 0), currency)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
              <span>Presupuesto</span>
              <DollarSign className="w-3.5 h-3.5 text-[#697386]" />
            </div>
            <div className="text-xl font-bold tracking-tight text-[#697386] dark:text-[#8792a2]">
              Sin límite asignado
            </div>
          </div>
          {onEditBudget && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onEditBudget}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Asignar presupuesto</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
          <span>Gasto estimado</span>
          <TrendingDown className="w-3.5 h-3.5 text-[#0070f3]" />
        </div>
        <div className="text-xl font-bold tracking-tight text-[#0a2540] dark:text-white tabular-nums">
          {formatCurrency(estimatedCost, currency)}
        </div>
        <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-2 font-medium">
          Mejores ofertas calculadas
        </div>
      </div>

      <div className="p-4 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider mb-1">
          <span>Ahorro proyectado</span>
          <PiggyBank className="w-3.5 h-3.5 text-[#059669]" />
        </div>
        <div className="text-xl font-bold tracking-tight text-[#059669] dark:text-[#34d399] tabular-nums">
          {formatCurrency(totalSavings, currency)}
        </div>
        <div className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-2 font-medium">
          Vs. opción más alta en catálogo
        </div>
      </div>
    </div>
  )
}
