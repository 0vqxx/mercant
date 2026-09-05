'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Building2,
  Layers,
  Search,
  ShoppingCart,
  Check,
  Radio,
  Plus,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useSession } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const supabase = createClient()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'compare' | 'trust' | 'budget'>('compare')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setSupabaseUser(data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const isAuthenticated = !!session?.user || !!supabaseUser

  const userAvatar =
    supabaseUser?.user_metadata?.avatar_url ||
    supabaseUser?.user_metadata?.picture ||
    (session?.user as any)?.image ||
    null

  const userDisplayName =
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.user_metadata?.name ||
    session?.user?.name ||
    supabaseUser?.email?.split('@')[0] ||
    session?.user?.email?.split('@')[0] ||
    'Usuario'

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-[#0a2540] dark:text-[#f4f6f8] font-sans antialiased overflow-x-hidden selection:bg-[#635bff] selection:text-white transition-colors duration-200">
      {/* ─── Hero Section with Vibrant Gradient in Light Mode / Sophisticated Dark Glow Mesh in Dark Mode ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7928CA] via-[#9333ea] via-50% via-[#f43f5e] via-70% via-[#fbbf24] to-[#38bdf8] dark:bg-none dark:bg-[#07090e] text-white pb-20 lg:pb-32 transition-colors duration-200">
        {/* Light mode blur mesh overlay */}
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300/40 via-purple-600/30 to-transparent pointer-events-none" />
        <div className="dark:hidden absolute -bottom-24 -left-20 w-96 h-96 bg-cyan-400/40 rounded-full blur-3xl pointer-events-none" />

        {/* Dark mode sophisticated ambient glowing lights (no excessive blinding saturation, pure elegant dark glow) */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,91,255,0.22),transparent_70%)] pointer-events-none" />
        <div className="hidden dark:block absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#635bff]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="hidden dark:block absolute top-1/3 -right-40 w-[450px] h-[450px] bg-[#00d4b8]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="hidden dark:block absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-[#9333ea]/15 rounded-full blur-[150px] pointer-events-none" />

        {/* ─── Navbar ─── */}
        <header className="relative z-50 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/mercant-logo-white.png"
              alt="Mercant AI Logo"
              className="h-8 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-2xl tracking-tight text-white">
              mercant<span className="text-white/80 font-normal">.ai</span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-white/90">
            <Link href="/" className="text-white hover:text-white transition-colors">
              {t('home')}
            </Link>
            <Link
              href={isAuthenticated ? "/procurements" : "/login"}
              className="hover:text-white/80 transition-colors"
            >
              {t('quotes')}
            </Link>
            <Link
              href={isAuthenticated ? "/tracking" : "/login"}
              className="hover:text-white/80 transition-colors"
            >
              {t('priceRadar')}
            </Link>
            <Link
              href={isAuthenticated ? "/suppliers" : "/login"}
              className="hover:text-white/80 transition-colors"
            >
              {t('suppliers')}
            </Link>
            <Link
              href={isAuthenticated ? "/analytics" : "/login"}
              className="hover:text-white/80 transition-colors"
            >
              {t('analytics')}
            </Link>
            <Link
              href={isAuthenticated ? "/settings?tab=billing" : "/login"}
              className="hover:text-white/80 transition-colors"
            >
              {t('upgradeToProMenu')}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector in Navbar */}
            <LanguageSelector variant="navbar" />

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-white" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-full transition-all inline-flex items-center gap-2"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userDisplayName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white text-[#635bff] flex items-center justify-center font-bold text-[10px]">
                    {userDisplayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate">{userDisplayName}</span>
                <ArrowRight className="w-3 h-3 text-[#00d4b8]" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-white/90 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all hidden sm:inline-block"
              >
                {t('logIn')}
              </Link>
            )}

            <Link
              href={isAuthenticated ? "/procurements/new" : "/login"}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-white text-[#0a2540] hover:bg-slate-100 shadow-lg shadow-black/10 transition-all cursor-pointer whitespace-nowrap"
            >
              {isAuthenticated ? t('startQuote') : t('startFree')}
            </Link>

            {/* Hamburger Button on Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer md:hidden"
              title="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Dropdown Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="absolute top-20 left-0 right-0 bg-[#0d1117]/95 dark:bg-[#0c1018]/98 backdrop-blur-xl border-b border-white/10 p-5 space-y-4 md:hidden shadow-2xl z-50 animate-in slide-in-from-top-2 duration-150">
              <nav className="flex flex-col space-y-2 text-sm font-semibold text-white/90">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('home')}
                </Link>
                <Link
                  href={isAuthenticated ? "/procurements" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('quotes')}
                </Link>
                <Link
                  href={isAuthenticated ? "/tracking" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('priceRadar')}
                </Link>
                <Link
                  href={isAuthenticated ? "/suppliers" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('suppliers')}
                </Link>
                <Link
                  href={isAuthenticated ? "/analytics" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('analytics')}
                </Link>
                <Link
                  href={isAuthenticated ? "/settings?tab=billing" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-amber-300"
                >
                  {t('upgradeToProMenu')} ★
                </Link>
              </nav>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-white/80 hover:text-white"
                  >
                    {t('logIn')}
                  </Link>
                )}
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#635bff] text-white hover:bg-[#5349e0] transition-colors"
                >
                  {isAuthenticated ? t('viewDashboard') : t('startFree')}
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ─── Hero Content (Split Text Left & Monitor/Mobile Mockup Right) ─── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bold Statement */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              {t('heroTitleLine1')}
              <br />
              {t('heroTitleLine2')}
              <br />
              {t('heroTitleLine3')}
            </h1>

            <p className="text-sm sm:text-base text-white/90 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-7 py-3.5 rounded-full text-xs font-bold bg-[#0d1117] dark:bg-[#635bff] text-white hover:bg-black dark:hover:bg-[#7a73ff] shadow-2xl dark:shadow-[0_0_25px_rgba(99,91,255,0.4)] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{t('viewDashboard')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00d4b8]" />
                  </Link>
                  <Link
                    href="/procurements/new"
                    className="px-6 py-3.5 rounded-full text-xs font-semibold bg-white/10 dark:bg-[#121826]/80 hover:bg-white/20 dark:hover:bg-[#1a2236] text-white border border-transparent dark:border-white/10 transition-all backdrop-blur-md"
                  >
                    <span>{t('startQuote')}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-7 py-3.5 rounded-full text-xs font-bold bg-[#0d1117] dark:bg-[#635bff] text-white hover:bg-black dark:hover:bg-[#7a73ff] shadow-2xl dark:shadow-[0_0_25px_rgba(99,91,255,0.4)] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{t('startFree')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00d4b8]" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-full text-xs font-semibold bg-white/10 dark:bg-[#121826]/80 hover:bg-white/20 dark:hover:bg-[#1a2236] text-white border border-transparent dark:border-white/10 transition-all backdrop-blur-md"
                  >
                    <span>{t('logIn')}</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Sleek Desktop & Smartphone UI Showcase (Accepty Mockup style) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* ── Studio Desktop Monitor ── */}
            <div className="relative w-full max-w-[500px] bg-[#1a1f2c] dark:bg-[#0c1018] rounded-2xl p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20 dark:border-white/10">
              {/* Monitor Screen Frame */}
              <div className="bg-white dark:bg-[#0e131f] rounded-xl overflow-hidden shadow-inner text-[#0a2540] dark:text-white flex flex-col h-[290px] select-none text-xs border border-transparent dark:border-[#1e2430]">
                {/* App Top Bar */}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1e2430] flex items-center justify-between bg-slate-50 dark:bg-[#131926] text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-bold text-[#0a2540] dark:text-white">{t('workspace')}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-[#059669] dark:text-emerald-400 font-bold">● {t('live')}</span>
                    <span className="dark:text-slate-400">MXN</span>
                  </div>
                </div>

                {/* Dashboard layout inside screen */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Mini Sidebar */}
                  <div className="w-28 bg-[#f8fafc] dark:bg-[#0a0e17] border-r border-slate-100 dark:border-[#1e2430] p-2 space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                    <div className="px-2 py-1 rounded bg-[#635bff]/10 dark:bg-[#635bff]/20 text-[#635bff] dark:text-[#7a73ff] font-bold">{t('generalOverview')}</div>
                    <div className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#151c2c] rounded">{t('quotes')}</div>
                    <div className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#151c2c] rounded">{t('priceRadar')}</div>
                    <div className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#151c2c] rounded">{t('suppliers')}</div>
                  </div>

                  {/* Main Screen Content */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-hidden bg-white dark:bg-[#0e131f]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1e2430]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{t('todaySummary')}</span>
                        <div className="text-base font-extrabold text-[#0a2540] dark:text-white tabular-nums">$744,950.00</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#edfcf2] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border border-transparent dark:border-emerald-900/40">
                        +18.4% {t('savingsDetected')}
                      </span>
                    </div>

                    {/* Mini item list */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-1.5 rounded-md bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42] flex items-center justify-between">
                        <span className="font-semibold truncate max-w-[120px] dark:text-slate-200">50x Lenovo ThinkPad</span>
                        <span className="font-mono font-bold text-[#059669] dark:text-emerald-400">$14,899</span>
                      </div>
                      <div className="p-1.5 rounded-md bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42] flex items-center justify-between">
                        <span className="font-semibold truncate max-w-[120px] dark:text-slate-200">30x Dell 24&quot; Display</span>
                        <span className="font-mono font-bold text-[#059669] dark:text-emerald-400">$2,380</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitor Stand Base */}
              <div className="w-24 h-5 mx-auto bg-[#cbd5e1] dark:bg-[#1e2430] rounded-b-lg shadow-md -mb-4 mt-1 border-t border-transparent dark:border-white/5" />
            </div>

            {/* ── Smartphone Floating Mockup (Accepty Right Side) ── */}
            <div className="absolute -bottom-6 -right-3 sm:-right-6 w-44 sm:w-48 bg-black dark:bg-[#07090e] rounded-[32px] p-2.5 shadow-2xl border-2 border-slate-700 dark:border-[#232a38] transform rotate-2 hidden sm:block">
              {/* Phone Dynamic Island */}
              <div className="w-16 h-3 bg-black dark:bg-[#0a0d14] rounded-full mx-auto mb-1.5" />
              {/* Phone Screen */}
              <div className="bg-white dark:bg-[#0e131f] rounded-[22px] p-3 text-[#0a2540] dark:text-white space-y-2 text-[10px] shadow-inner border border-transparent dark:border-[#1e2430]">
                <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-100 dark:border-[#1e2430] text-[11px]">
                  <span>Mercant</span>
                  <span className="w-2 h-2 rounded-full bg-[#00d4b8] shadow-[0_0_8px_#00d4b8]" />
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] block">{t('savingsDetected')}</span>
                  <span className="font-extrabold text-sm text-[#059669] dark:text-emerald-400">$55,000 MXN</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42] space-y-1 text-[9px]">
                  <div className="font-semibold text-[#635bff] dark:text-[#7a73ff]">MercadoLibre · Verificado</div>
                  <div className="text-slate-500 dark:text-slate-400">Trust Score: 96/100</div>
                </div>
                <div className="w-full py-1.5 rounded-lg bg-[#0a2540] dark:bg-[#635bff] hover:dark:bg-[#7a73ff] text-white text-center font-bold text-[9px] transition-colors">
                  {t('approvePurchase')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* ─── Interactive Capabilities Showcase (Stripe High-End Style) ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635bff]/10 dark:bg-[#635bff]/20 text-[#635bff] dark:text-[#7a73ff] text-xs font-bold uppercase tracking-wider border border-transparent dark:border-[#635bff]/30">
            <Sparkles className="w-3.5 h-3.5" />
            {t('infraTag')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a2540] dark:text-white tracking-tight">
            {t('capabilitiesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('capabilitiesSubtitle')}
          </p>
        </div>

        {/* Feature Interactive Tabs */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-[#0a2540] dark:bg-[#635bff] text-white shadow-md dark:shadow-[0_0_20px_rgba(99,91,255,0.4)]'
                : 'bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1a2236] dark:hover:text-white border border-transparent dark:border-[#1e2430]'
            }`}
          >
            {t('tabMultiChannel')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trust')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trust'
                ? 'bg-[#0a2540] dark:bg-[#635bff] text-white shadow-md dark:shadow-[0_0_20px_rgba(99,91,255,0.4)]'
                : 'bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1a2236] dark:hover:text-white border border-transparent dark:border-[#1e2430]'
            }`}
          >
            {t('tabTrustScore')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-[#0a2540] dark:bg-[#635bff] text-white shadow-md dark:shadow-[0_0_20px_rgba(99,91,255,0.4)]'
                : 'bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1a2236] dark:hover:text-white border border-transparent dark:border-[#1e2430]'
            }`}
          >
            {t('tabBudgetOpt')}
          </button>
        </div>

        {/* Dynamic Interactive Tab Content Preview */}
        <div className="bg-[#f8fafc] dark:bg-[#0c1018] border border-slate-200 dark:border-[#1e2430] rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl transition-all">
          {activeTab === 'compare' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0a2540] dark:text-white">
                  {t('tab1Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('tab1Desc')}
                </p>
                <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab1Bullet1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab1Bullet2')}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-[#1e2430] p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2430] text-xs">
                  <span className="font-bold text-[#0a2540] dark:text-white">{t('tab1LiveResultsFor')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-transparent dark:border-emerald-900/40">{t('tab1OptionsFound')}</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-[#152326] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-white">CyberPuerta MX</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Envío Gratis · Stock 50 u.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">$14,899.00</div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{t('tab1BestPrice')}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-white">MercadoLibre Oficial</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Llega mañana · Stock verificado</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">$15,200.00</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Trust Score 98/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-white">OfficeDepot MX</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Garantía Corporativa Extendida</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">$16,499.00</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Trust Score 90/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trust' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0a2540] dark:text-white">
                  {t('tab2Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('tab2Desc')}
                </p>
                <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab2Bullet1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab2Bullet2')}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-[#1e2430] p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2430]">
                  <div>
                    <h4 className="text-sm font-bold text-[#0a2540] dark:text-white">{t('tab2AuditTitle')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">MercadoLibre Tienda Oficial Lenovo</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-transparent dark:border-emerald-800/50">
                    {t('tab2LowRisk')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42]">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">{t('tab2SslDomain')}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{t('tab2SslValid')}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42]">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">{t('tab2SellerRating')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">4.9 / 5.0 (12,400+ ventas)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42]">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">{t('tab2Warranty')}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{t('tab2WarrantyDesc')}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151c2c] border border-slate-100 dark:border-[#232d42]">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">{t('tab2PriceCoherence')}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{t('tab2PriceCoherenceDesc')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0a2540] dark:text-white">
                  {t('tab3Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('tab3Desc')}
                </p>
                <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab3Bullet1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('tab3Bullet2')}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-[#1e2430] p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2430]">
                  <div>
                    <h4 className="text-sm font-bold text-[#0a2540] dark:text-white">{t('tab3OptTitle')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('tab3QuoteName')}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-transparent dark:border-emerald-900/40">
                    {t('tab3SavingsAmount')}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#151c2c]">
                    <span className="text-slate-600 dark:text-slate-400">{t('tab3InitialBudget')}</span>
                    <span className="font-bold text-slate-800 dark:text-white">$1,000,000.00 MXN</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#151c2c]">
                    <span className="text-slate-600 dark:text-slate-400">{t('tab3FinalCost')}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">$834,600.00 MXN</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#1e2430] rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '83.4%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{t('tab3SpentPercent')}</span>
                    <span>{t('tab3Remaining')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Seamless Action Bar (Stripe High-End Style) ─── */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-[#1e2430]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#f8fafc] dark:bg-[#0c1018] border border-slate-200/80 dark:border-[#1e2430] rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] dark:text-white tracking-tight">
              {t('readyToQuoteTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('readyToQuoteSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/procurements/new"
              className="px-6 py-3 rounded-full text-xs font-bold bg-[#0a2540] dark:bg-[#635bff] text-white hover:bg-black dark:hover:bg-[#7a73ff] shadow-md dark:shadow-[0_0_20px_rgba(99,91,255,0.4)] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t('startNewQuoteBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00d4b8]" />
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a2540] dark:hover:text-white bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e2430] hover:border-slate-300 dark:hover:border-[#2e3748] transition-all"
            >
              {t('viewDashboard')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Enterprise Structured Footer ─── */}
      <footer className="border-t border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#07090e] py-14 px-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-[#1e2430]">
            {/* Column 1: Brand & Status */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/mercant-logo.png" alt="Mercant AI" className="h-6 w-auto object-contain dark:hidden" />
                <img src="/mercant-logo-white.png" alt="Mercant AI" className="h-6 w-auto object-contain hidden dark:block" />
                <span className="font-extrabold text-lg text-[#0a2540] dark:text-white tracking-tight">
                  mercant<span className="text-slate-400 font-normal">.ai</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                {t('brandTagline')}
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span>{t('systemOperational')}</span>
              </div>
            </div>

            {/* Column 2: Plataforma */}
            <div className="space-y-3">
              <div className="font-bold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider">{t('platform')}</div>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-xs">
                <li><Link href={isAuthenticated ? "/procurements/new" : "/login"} className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('aiQuoter')}</Link></li>
                <li><Link href={isAuthenticated ? "/tracking" : "/login"} className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('priceRadar')}</Link></li>
                <li><Link href={isAuthenticated ? "/suppliers" : "/login"} className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('tabTrustScore')}</Link></li>
                <li><Link href={isAuthenticated ? "/analytics" : "/login"} className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('financialReport')}</Link></li>
              </ul>
            </div>

            {/* Column 3: Fuentes & Conectores */}
            <div className="space-y-3">
              <div className="font-bold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider">{t('connectors')}</div>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-xs">
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">MercadoLibre México</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">Amazon Business MX</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">Distribuidores Mayoristas</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">CyberPuerta & Retail</span></li>
              </ul>
            </div>

            {/* Column 4: Acceso */}
            <div className="space-y-3">
              <div className="font-bold text-xs text-[#0a2540] dark:text-white uppercase tracking-wider">{t('access')}</div>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-xs">
                <li><Link href="/login" className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('logIn')}</Link></li>
                <li><Link href="/register" className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('createAccount')}</Link></li>
                <li><Link href="/settings" className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('settingsAlerts')}</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors">{t('mainDashboard')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-4">
              <p>© {new Date().getFullYear()} Mercant AI Technologies Inc. {t('allRightsReserved')}</p>
              <LanguageSelector variant="footer" />
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{t('securitySsl')}</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{t('termsOfService')}</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{t('privacy')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
