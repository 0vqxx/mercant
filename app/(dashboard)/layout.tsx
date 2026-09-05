import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Search, Bell, HelpCircle } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fa] dark:bg-[#07090e] text-[#0a2540] dark:text-[#f4f6f8] transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Subtle Ambient Dark Mode Lighting */}
        <div className="hidden dark:block absolute -top-40 left-1/4 w-[500px] h-[500px] bg-[#635bff]/08 rounded-full blur-[140px] pointer-events-none" />
        <div className="hidden dark:block absolute top-1/2 -right-40 w-[450px] h-[450px] bg-[#00d4b8]/06 rounded-full blur-[150px] pointer-events-none" />

        {/* Top executive Stripe-style app bar */}
        <header className="h-12 border-b border-[#e3e8ee] dark:border-[#1e2430] bg-white/90 dark:bg-[#0c1018]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-10 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#697386] dark:text-[#8792a2]">
            <a
              href="/"
              className="font-bold text-[#0a2540] dark:text-white hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors flex items-center gap-2"
              title="Ir a la página principal (Landing Page)"
            >
              <img
                src="/mercant-logo.png"
                alt="Mercant Logo"
                className="w-4 h-4 object-contain dark:hidden"
              />
              <img
                src="/mercant-logo-white.png"
                alt="Mercant Logo"
                className="w-4 h-4 object-contain hidden dark:block"
              />
              <span>Mercant AI</span>
            </a>
            <span>/</span>
            <span>Plataforma de Sourcing</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8792a2]" />
              <input
                type="text"
                placeholder="Buscar cotizaciones, SKU, tiendas..."
                className="w-full h-7 pl-8 pr-3 text-xs bg-[#f4f6f8] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-md text-[#0a2540] dark:text-white placeholder-[#8792a2] focus:outline-none focus:border-[#635bff] dark:focus:border-[#635bff] transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 text-[#697386] dark:text-[#8792a2]">
              <button className="p-1.5 rounded hover:bg-[#f4f6f8] dark:hover:bg-[#121826] text-[#697386] dark:text-slate-400 hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-[#f4f6f8] dark:hover:bg-[#121826] text-[#697386] dark:text-slate-400 hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main scrollable body */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

