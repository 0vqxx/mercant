'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Store, Shield } from 'lucide-react'

export interface SpendTrendPoint {
  date: string
  presupuesto: number
  estimado: number
  ahorro: number
}

export interface SupplierSharePoint {
  supplier: string
  spend: number
  itemsCount: number
  trustAvg: number
  percentage: number
}

interface DashboardChartsProps {
  trendData: SpendTrendPoint[]
  supplierShares: SupplierSharePoint[]
  totalSpend: number
  totalSavings: number
}

export function DashboardCharts({
  trendData,
  supplierShares,
  totalSpend,
  totalSavings,
}: DashboardChartsProps) {
  const [selectedRange, setSelectedRange] = React.useState<'7d' | '30d' | '90d'>('30d')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#121826] p-3.5 shadow-xl text-xs backdrop-blur-md">
          <p className="font-semibold text-[#0a2540] dark:text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-[#697386] dark:text-[#8792a2]">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-[#0a2540] dark:text-white tabular-nums">
                {formatCurrency(entry.value, 'MXN')}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Trend Line / Area Chart */}
      <div className="lg:col-span-2 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] dark:shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#0a2540] dark:text-white uppercase tracking-wider">
                  Evolución de Gasto & Ahorros Proyectados
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#edfcf2] text-[#059669] border border-[#a3e9c4]/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
                  <TrendingUp className="w-2.5 h-2.5" /> +18.4% eficiencia
                </span>
              </div>
              <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                Comparativa de presupuesto asignado vs volumen cotizado óptimo
              </p>
            </div>

            {/* Segmented range filter */}
            <div className="flex items-center p-0.5 bg-[#f4f6f8] dark:bg-[#121826] rounded-md border border-[#e3e8ee] dark:border-[#1e2430] text-[11px] font-medium text-[#697386] dark:text-[#8792a2] self-start sm:self-auto">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    selectedRange === range
                      ? 'bg-white dark:bg-[#635bff] text-[#0a2540] dark:text-white font-semibold shadow-xs'
                      : 'hover:text-[#0a2540] dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar directly above chart */}
          <div className="grid grid-cols-3 gap-4 pt-4 pb-2">
            <div>
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block">
                Total Cotizado
              </span>
              <span className="text-lg font-bold text-[#0a2540] dark:text-white tabular-nums">
                {formatCurrency(totalSpend, 'MXN')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block">
                Ahorro Consolidado
              </span>
              <span className="text-lg font-bold text-[#059669] dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalSavings, 'MXN')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block">
                Tasa de Optimización
              </span>
              <span className="text-lg font-bold text-[#635bff] dark:text-[#7a73ff] tabular-nums">
                {totalSpend > 0 ? `${Math.round((totalSavings / (totalSpend + totalSavings)) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#635bff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#635bff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#8792a2" opacity={0.15} />
              <XAxis
                dataKey="date"
                stroke="#8792a2"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#8792a2', opacity: 0.2 }}
              />
              <YAxis
                stroke="#8792a2"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="estimado"
                name="Gasto Proyectado"
                stroke="#635bff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
              <Area
                type="monotone"
                dataKey="ahorro"
                name="Ahorro Calculado"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown by Supplier / Market Channel */}
      <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] dark:shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
            <div>
              <h3 className="text-xs font-bold text-[#0a2540] dark:text-white uppercase tracking-wider">
                Distribución por Tienda
              </h3>
              <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                Volumen cotizado por proveedor
              </p>
            </div>
            <Store className="w-4 h-4 text-[#697386] dark:text-[#8792a2]" />
          </div>

          <div className="mt-4 space-y-3.5">
            {supplierShares.slice(0, 5).map((share, idx) => (
              <div key={share.supplier} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0a2540] dark:text-white flex items-center gap-1.5 truncate max-w-[140px]">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-[#635bff]" />
                    {share.supplier}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#697386] dark:text-[#8792a2] text-[11px] tabular-nums">
                      {share.itemsCount} {share.itemsCount === 1 ? 'ítem' : 'ítems'}
                    </span>
                    <span className="font-mono font-medium text-[#0a2540] dark:text-white tabular-nums text-[11px]">
                      {formatCurrency(share.spend, 'MXN')}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#f4f6f8] dark:bg-[#121826] rounded-full overflow-hidden flex border border-transparent dark:border-[#1e2430]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(share.percentage, 4)}%`,
                      backgroundColor:
                        idx === 0
                          ? '#635bff'
                          : idx === 1
                          ? '#0070f3'
                          : idx === 2
                          ? '#10b981'
                          : idx === 3
                          ? '#f59e0b'
                          : '#8792a2',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#697386] dark:text-[#8792a2]">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#10b981]" />
                    <span>Confiabilidad: {share.trustAvg}/100</span>
                  </span>
                  <span className="font-semibold tabular-nums">{share.percentage}%</span>
                </div>
              </div>
            ))}

            {supplierShares.length === 0 && (
              <div className="py-8 text-center text-xs text-[#8792a2]">
                Aún no hay cotizaciones adjudicadas.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-3 border-t border-[#f4f6f8] dark:border-[#1e2430] flex items-center justify-between text-xs">
          <span className="text-[#697386] dark:text-[#8792a2]">Top canal</span>
          <span className="font-semibold text-[#0a2540] dark:text-white truncate max-w-[120px]">
            {supplierShares[0]?.supplier || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
