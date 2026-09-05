'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  TrendingDown,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/utils'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProPlan, setIsProPlan] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = localStorage.getItem('mercant-plan')
      if (plan === 'PRO' || plan === 'ENTERPRISE') {
        setIsProPlan(true)
      }
    }

    const onPlanUpdate = (e: any) => {
      const p = e?.detail?.plan
      if (p === 'PRO' || p === 'ENTERPRISE') {
        setIsProPlan(true)
      }
    }

    window.addEventListener('mercant-plan-updated', onPlanUpdate)
    return () => {
      window.removeEventListener('mercant-plan-updated', onPlanUpdate)
    }
  }, [])

  const mobileNavItems = [
    { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { href: '/procurements', label: 'Compras', icon: ShoppingCart },
    { href: '/procurements/new', label: 'Cotizar', icon: PlusCircle, highlight: true },
    { href: '/tracking', label: 'Radar', icon: TrendingDown },
    { href: '/settings', label: 'Ajustes', icon: Sliders },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fa] dark:bg-[#07090e] text-[#0a2540] dark:text-[#f4f6f8] transition-colors duration-200">
      {/* Desktop static sidebar */}
      <Sidebar />

      {/* Mobile Slide-over Drawer */}
      <Sidebar
        isMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {/* Subtle Ambient Dark Mode Lighting */}
        <div className="hidden dark:block absolute -top-40 left-1/4 w-[500px] h-[500px] bg-[#635bff]/08 rounded-full blur-[140px] pointer-events-none" />
        <div className="hidden dark:block absolute top-1/2 -right-40 w-[450px] h-[450px] bg-[#00d4b8]/06 rounded-full blur-[150px] pointer-events-none" />

        {/* Top App Bar */}
        <header className="h-12 border-b border-[#e3e8ee] dark:border-[#1e2430] bg-white/95 dark:bg-[#0c1018]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#697386] dark:text-[#8792a2] min-w-0">
            {/* Hamburger button on Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-[#697386] dark:text-[#8792a2] hover:bg-[#f4f6f8] dark:hover:bg-[#121826] hover:text-[#0a2540] dark:hover:text-white transition-colors md:hidden cursor-pointer"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="font-bold text-[#0a2540] dark:text-white hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors flex items-center gap-2 truncate"
              title="Ir a la página principal"
            >
              <img
                src="/mercant-logo.png"
                alt="Mercant Logo"
                className="w-4 h-4 object-contain dark:hidden shrink-0"
              />
              <img
                src="/mercant-logo-white.png"
                alt="Mercant Logo"
                className="w-4 h-4 object-contain hidden dark:block shrink-0"
              />
              <span className="truncate">Mercant AI</span>
            </Link>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline truncate">Sourcing Platform</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-48 sm:w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8792a2]" />
              <input
                type="text"
                placeholder="Buscar cotizaciones..."
                className="w-full h-7 pl-8 pr-3 text-xs bg-[#f4f6f8] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-md text-[#0a2540] dark:text-white placeholder-[#8792a2] focus:outline-none focus:border-[#635bff] transition-colors"
              />
            </div>

            <Link
              href="/procurements/new"
              className="md:hidden inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold bg-[#635bff] text-white hover:bg-[#5349e0] shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </Link>

            <div className="flex items-center gap-1 text-[#697386] dark:text-[#8792a2]">
              {isProPlan ? (
                <Link
                  href="/settings?tab=billing"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#052e16] text-[#4ade80] border border-[#14532d] shadow-xs"
                  title="Plan PRO Unlimited Activo"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  <span>PRO ACTIVO</span>
                </Link>
              ) : (
                <Link
                  href="/settings?tab=billing"
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-[#635bff]/10 text-[#635bff] dark:text-[#7a73ff] hover:bg-[#635bff]/20 transition-colors"
                  title="Mejorar a Plan PRO"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>PRO</span>
                </Link>
              )}
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[#f4f6f8] dark:hover:bg-[#121826] text-[#697386] dark:text-slate-400 hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main scrollable body with bottom spacing for mobile navigation */}
        <main className="flex-1 overflow-y-auto relative z-10 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto p-3.5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0c1018]/95 backdrop-blur-md border-t border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-around px-2 z-40">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="w-11 h-11 rounded-full bg-[#635bff] text-white flex items-center justify-center shadow-lg shadow-[#635bff]/30 hover:scale-105 active:scale-95 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#635bff] dark:text-[#7a73ff] mt-0.5">
                    {item.label}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'text-[#635bff] dark:text-[#7a73ff]'
                    : 'text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
