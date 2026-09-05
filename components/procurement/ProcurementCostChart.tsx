'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Layers, Sparkles } from 'lucide-react'

interface ItemCostData {
  name: string
  bestPrice: number
  worstPrice: number
  savings: number
  quantity: number
}

interface ProcurementCostChartProps {
  items: ItemCostData[]
  currency?: string
}

export function ProcurementCostChart({
  items,
  currency = 'MXN',
}: ProcurementCostChartProps) {
  if (!items || items.length === 0) return null

  const chartData = items.map((item) => ({
    name: item.name.length > 16 ? item.name.slice(0, 16) + '...' : item.name,
    fullName: item.name,
    Mejor_Oferta: item.bestPrice,
    Precio_Maximo: item.worstPrice,
    Ahorro: item.savings,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] p-3 shadow-md text-xs">
          <p className="font-semibold text-[#0a2540] dark:text-white mb-1.5">{data.fullName}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#059669] dark:text-[#34d399] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#059669]" /> Mejor opción:
              </span>
              <span className="font-mono font-bold tabular-nums">
                {formatCurrency(data.Mejor_Oferta, currency)}
              </span>
            </div>
            {data.Precio_Maximo > data.Mejor_Oferta && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#697386] dark:text-[#8792a2] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8792a2]" /> Opción más alta:
                </span>
                <span className="font-mono tabular-nums text-[#697386]">
                  {formatCurrency(data.Precio_Maximo, currency)}
                </span>
              </div>
            )}
            {data.Ahorro > 0 && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#f4f6f8] dark:border-[#1e2430]">
                <span className="text-[#635bff] dark:text-[#7a73ff] font-semibold">Ahorro conseguido:</span>
                <span className="font-mono font-bold text-[#635bff] dark:text-[#7a73ff] tabular-nums">
                  {formatCurrency(data.Ahorro, currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4f6f8] dark:border-[#1e2430]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#0a2540] dark:text-white uppercase tracking-wider">
              Comparativa de Costos por Producto
            </h3>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f4f6f8] text-[#635bff] border border-[#e3e8ee] dark:bg-[#1e2430] dark:text-[#7a73ff] dark:border-[#2e3748]">
              Análisis de dispersión
            </span>
          </div>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Compara la mejor oferta frente a la alternativa más costosa encontrada en distribuidores
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#697386] dark:text-[#8792a2]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#635bff]" /> Mejor oferta
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#d8dee4] dark:bg-[#2e3748]" /> Precio mercado alto
          </span>
        </div>
      </div>

      <div className="h-52 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }} barGap={4}>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e3e8ee" opacity={0.6} />
            <XAxis dataKey="name" stroke="#8792a2" fontSize={10} tickLine={false} axisLine={{ stroke: '#e3e8ee' }} />
            <YAxis stroke="#8792a2" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Mejor_Oferta" name="Mejor Oferta" fill="#635bff" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Precio_Maximo" name="Precio Máximo" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
