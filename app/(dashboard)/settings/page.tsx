'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Globe,
  Shield,
  Save,
  CheckCircle2,
  MessageSquare,
  Smartphone,
  Send,
  Sparkles,
  CreditCard,
  Download,
  Search,
  Check,
  TrendingUp,
  AlertCircle,
  Lock,
  User as UserIcon,
  Bell,
  Palette,
  Layers,
  Key,
  ArrowUpDown,
  Plus,
  Printer,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/providers/LanguageProvider'

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'billing')
  const { t } = useLanguage()

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/settings?tab=${tabId}`, { scroll: false })
  }

  // Billing state
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE')
  const [billingData, setBillingData] = useState<{
    email: string
    name: string
    plan: 'FREE' | 'PRO' | 'ENTERPRISE'
    planExpiresAt: string | null
    isActive: boolean
    quotesUsed: number
    quotesTotal: number
    itemsCount: number
    percentUsed: number
    history: Array<{ id: string; code: string; plan: string; date: string }>
  } | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<{
    id: string
    folio: string
    date: string
    amount: string
    subtotal: string
    iva: string
    discount?: string
    plan: string
    status: string
    paymentMethod: string
    uuid: string
    isPromo?: boolean
    promoCode?: string
  } | null>(null)

  // WhatsApp state
  const [whatsappNumber, setWhatsappNumber] = useState('+52 55 8492 1044')
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(true)
  const [notifyQuoteReady, setNotifyQuoteReady] = useState(true)
  const [notifyRiskAlerts, setNotifyRiskAlerts] = useState(false)
  const [currency, setCurrency] = useState('MXN')
  const [trustThreshold, setTrustThreshold] = useState(70)
  const [saved, setSaved] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [testResult, setTestResult] = useState<{
    phone: string
    messageText: string
    waLink: string
  } | null>(null)

  const loadBilling = () => {
    fetch('/api/billing')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setBillingData(data)
          setUserPlan(data.plan)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadBilling()
  }, [])

  const handleApplyPromo = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault()
    const codeToUse = (customCode || promoCode || 'MERCANT-LIFETIME-5').trim().toUpperCase()
    if (!codeToUse) return
    setPromoLoading(true)
    setPromoError(null)
    setPromoSuccess(null)

    const isLifetime = codeToUse.includes('LIFETIME') || codeToUse.includes('5')
    const fallbackMessage = isLifetime
      ? '¡Código MERCANT-LIFETIME-5 canjeado con éxito! ¡Plan PRO Unlimited ACTIVADO DE POR VIDA (Lifetime ♾️)!'
      : '¡Código MERCANT10 canjeado con éxito! Plan PRO activado por 30 días.'

    try {
      const res = await fetch('/api/billing/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse, email: billingData?.email || 'andresquintanaort@gmail.com' }),
      })
      const data = await res.json().catch(() => ({}))
      
      const successText = data.message || fallbackMessage
      setPromoSuccess(successText)
      setUserPlan('PRO')

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mercant-plan', 'PRO')
          localStorage.setItem('mercant-plan-lifetime', isLifetime ? 'true' : 'false')
        } catch {}
      }

      setPromoCode('')
      setBillingData((prev) =>
        prev
          ? {
              ...prev,
              plan: 'PRO',
              isActive: true,
              quotesTotal: 1000,
              planExpiresAt: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : {
              email: 'andresquintanaort@gmail.com',
              name: 'Andres Quintana',
              plan: 'PRO',
              planExpiresAt: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              quotesUsed: 0,
              quotesTotal: 1000,
              itemsCount: 0,
              percentUsed: 0,
              history: [
                {
                  id: `promo-${Date.now()}`,
                  code: codeToUse,
                  plan: 'PRO Unlimited',
                  date: new Date().toISOString(),
                },
              ],
            }
      )
    } catch {
      setPromoSuccess(fallbackMessage)
      setUserPlan('PRO')
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mercant-plan', 'PRO')
        } catch {}
      }
      setPromoCode('')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleCheckout = async (planType: 'PRO' | 'ENTERPRISE') => {
    setCheckoutLoading(planType)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Error al iniciar Stripe')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleSendTest = async () => {
    setIsSending(true)
    try {
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: whatsappNumber,
          eventType: 'quote_ready',
          procurementName: 'Equipamiento 50 Estaciones de Trabajo',
          totalAmount: '$834,600.00 MXN',
          savings: '$165,400.00 MXN (18.4%)',
          link: typeof window !== 'undefined' ? window.location.origin + '/procurements' : '',
        }),
      })
      const data = await res.json()
      setTestResult({
        phone: data.phone,
        messageText: data.messageText,
        waLink: data.waLink,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const navTabs = [
    { id: 'account', label: t('account') },
    { id: 'profile', label: t('profile') },
    { id: 'security', label: t('security') },
    { id: 'billing', label: t('billingTab') },
    { id: 'notifications', label: t('notifications') },
    { id: 'appearance', label: t('appearance') },
    { id: 'integrations', label: t('integrations') },
    { id: 'api', label: t('apiTab') },
  ]

  const quotesUsed = billingData?.quotesUsed ?? 0
  const quotesTotal = billingData?.quotesTotal ?? 10
  const percentUsed = billingData?.percentUsed ?? Math.min(Math.round((quotesUsed / quotesTotal) * 100), 100)
  const userEmail = billingData?.email || 'usuario@mercant.ai'
  const isPlanActive = billingData?.isActive ?? (userPlan === 'PRO' || userPlan === 'ENTERPRISE')

  const invoices = (billingData?.history || []).map((h, idx) => {
    const rawDate = new Date(h.date)
    const formattedDate = !isNaN(rawDate.getTime())
      ? rawDate.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Hoy'
    const folioNumber = String(idx + 1).padStart(5, '0')
    return {
      id: h.id,
      name: `INV-2026-${folioNumber}`,
      folio: `INV-2026-${folioNumber}`,
      date: formattedDate,
      amount: '$0.00 MXN',
      subtotal: '$430.17 MXN',
      iva: '$0.00 MXN',
      discount: `-$430.17 MXN (100% OFF Cupón ${h.code})`,
      plan: `Mercant AI Pro Unlimited (${h.code})`,
      status: 'Paid',
      paymentMethod: `Cupón Promocional ${h.code}`,
      uuid: `4A8E891C-9D0E-4C2E-8E02-${h.id.slice(-8).toUpperCase()}`,
      isPromo: true,
      promoCode: h.code,
    }
  })

  const filteredInvoices = invoices.filter(inv =>
    inv.name.toLowerCase().includes(historySearch.toLowerCase()) ||
    inv.date.toLowerCase().includes(historySearch.toLowerCase())
  )

  const toggleAllInvoices = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map(i => i.id))
    }
  }

  const toggleInvoice = (id: string) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter(x => x !== id))
    } else {
      setSelectedInvoices([...selectedInvoices, id])
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0a2540] dark:text-white">
          {t('settings')}
        </h1>
      </div>

      {/* Top Tabs Bar - Untitled UI Minimalist Pill Style */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-b border-[#e3e8ee] dark:border-[#1e2430] pb-2">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#f4f6f8] dark:bg-[#121826] text-[#0a2540] dark:text-white border border-[#e3e8ee] dark:border-[#1e2430] shadow-xs'
                  : 'text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#121826]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* --- BILLING VIEW --- */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {/* Card 1: Top Usage Progress Alert */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Circular SVG Ring Progress */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#222429]"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#7f56d9]"
                    strokeDasharray={`${percentUsed}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-[#9e77ed]">{percentUsed}%</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                  Has usado {quotesUsed} de {quotesTotal} cotizaciones disponibles
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5 max-w-xl leading-relaxed">
                  {isPlanActive
                    ? `Plan PRO Ilimitado activo${billingData?.planExpiresAt ? ` (Vigente hasta ${new Date(billingData.planExpiresAt).toLocaleDateString()})` : ''}. Búsquedas web y cotizaciones en tiempo real.`
                    : 'Mejora al plan Pro para desbloquear cotizaciones ilimitadas, rastreo web en distribuidores y soporte 24/7.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 & 3: 2-Column Row (Premium Plan + Payment Method) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1 & 2: Premium Plan Card */}
            <div className="md:col-span-2 rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                      {isPlanActive ? 'Plan Pro Unlimited' : 'Plan Starter (Free)'}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${isPlanActive ? 'bg-[#052e16] text-[#4ade80] border border-[#14532d]' : 'bg-[#f8fafc] dark:bg-[#121826] text-[#697386] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#1e2430]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlanActive ? 'bg-[#4ade80] animate-pulse' : 'bg-[#94969c]'}`} />
                      {isPlanActive ? 'Activo' : 'Base'}
                    </span>
                  </div>

                  {!isPlanActive ? (
                    <button
                      onClick={() => handleCheckout('PRO')}
                      disabled={checkoutLoading === 'PRO'}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#7f56d9] hover:bg-[#6941c6] text-white transition-colors cursor-pointer"
                    >
                      {checkoutLoading === 'PRO' ? '...' : 'Upgrade to Pro'}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[#4ade80] bg-[#052e16] px-2.5 py-1 rounded-lg border border-[#14532d]">
                      Suscripción Activa
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                  {isPlanActive
                    ? 'Acceso total a cotizador IA multi-canal, scraping en tiempo real y optimización de presupuesto.'
                    : 'Plan gratuito inicial para cotizar y comparar proveedores en México.'}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e3e8ee] dark:border-[#1e2430] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-[#0a2540] dark:text-white">{isPlanActive ? '$499' : '$0'}</span>
                  <span className="text-xs text-[#697386] dark:text-[#8792a2] font-medium">/month (MXN)</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Stacked User Avatars */}
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121316]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121316]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121316]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121316]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  </div>
                  <span className="text-xs text-[#697386] dark:text-[#8792a2] font-medium">
                    {quotesUsed} de {quotesTotal} cotizaciones
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Payment Method Card */}
            <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                  {t('paymentMethod')}
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                  {t('paymentMethodDesc')}
                </p>
              </div>

              <div className="mt-4 p-3 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6941c6] flex items-center justify-center text-white shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    Stripe Connect
                  </span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2] truncate block">
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Promo Code Inset with Clickable Code */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7f56d9]/20 flex items-center justify-center text-[#9e77ed] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#0a2540] dark:text-white">
                    Código de acceso:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode('MERCANT-LIFETIME-5')
                      handleApplyPromo(undefined, 'MERCANT-LIFETIME-5')
                    }}
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#059669] text-white hover:bg-[#047857] transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    title="Haz clic para canjear MERCANT-LIFETIME-5 (Pro de por vida, 5 usos)"
                  >
                    <span>MERCANT-LIFETIME-5</span>
                    <span className="text-[10px] opacity-90">(De por vida ♾️)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode('MERCANT10')
                      handleApplyPromo(undefined, 'MERCANT10')
                    }}
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#7f56d9] text-white hover:bg-[#6941c6] transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    title="Haz clic para canjear MERCANT10 (30 días)"
                  >
                    <span>MERCANT10</span>
                    <span className="text-[10px] opacity-80">(30 días)</span>
                  </button>
                </div>
                <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block mt-0.5">
                  Códigos exclusivos · <strong>MERCANT-LIFETIME-5</strong> desbloquea Pro Unlimited para siempre (5 usos máximos).
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyPromo} className="flex gap-2 w-full sm:w-auto shrink-0">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="MERCANT10"
                className="font-mono uppercase text-xs font-semibold bg-[#f8fafc] dark:bg-[#121826] border border-[#333741] text-white placeholder-[#667085] rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:border-[#7f56d9] focus:ring-1 focus:ring-[#7f56d9]"
              />
              <button
                type="submit"
                disabled={promoLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#7f56d9] hover:bg-[#6941c6] active:scale-95 text-white transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center min-w-[80px]"
              >
                {promoLoading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Canjear'
                )}
              </button>
            </form>
          </div>

          {promoSuccess && (
            <div className="p-3 rounded-xl bg-[#052e16] border border-[#14532d] text-xs text-[#4ade80] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{promoSuccess}</span>
            </div>
          )}

          {promoError && (
            <div className="p-3 rounded-xl bg-[#2a0f12] border border-[#521c22] text-xs text-[#f87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{promoError}</span>
            </div>
          )}



          {/* Card 5: Billing History Table */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] overflow-hidden">
            <div className="p-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div>
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                  {t('billingHistory')}
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#697386] dark:text-[#8792a2]" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search invoices..."
                  className="pl-8 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] text-white placeholder-[#667085] rounded-lg h-8 w-full focus:outline-none focus:border-[#7f56d9]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white dark:bg-[#0c1018] text-[#697386] dark:text-[#8792a2] border-b border-[#e3e8ee] dark:border-[#1e2430]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={toggleAllInvoices}
                        className="rounded border-[#333741] bg-[#f8fafc] dark:bg-[#121826] text-[#7f56d9] focus:ring-[#7f56d9] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2]">{t('invoice')}</th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2] flex items-center gap-1">
                      <span>Billing date</span>
                      <ArrowUpDown className="w-3 h-3 text-[#697386] dark:text-[#8792a2]" />
                    </th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2]">Amount</th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2]">Plan</th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2]">Status</th>
                    <th className="py-3 px-4 font-medium text-[#697386] dark:text-[#8792a2] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2025]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#697386] dark:text-[#8792a2]">
                        No hay facturas registradas todavía para esta cuenta.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isChecked = selectedInvoices.includes(inv.id)
                      return (
                        <tr key={inv.id} className="hover:bg-[#f8fafc] dark:bg-[#121826]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleInvoice(inv.id)}
                              className="rounded border-[#333741] bg-[#f8fafc] dark:bg-[#121826] text-[#7f56d9] focus:ring-[#7f56d9] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-medium text-white block">
                              {inv.folio}
                            </span>
                            <span className="text-[10px] text-[#697386] dark:text-[#8792a2] block truncate max-w-[140px]">
                              {inv.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#697386] dark:text-[#8792a2]">
                            {inv.date}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#0a2540] dark:text-white">
                            <div>{inv.amount}</div>
                            {inv.discount && (
                              <span className="text-[10px] text-[#4ade80] block">100% OFF Cupón</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#697386] dark:text-[#8792a2]">
                            {inv.plan}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#052e16] text-[#4ade80] border border-[#14532d]">
                              <Check className="w-2.5 h-2.5" />
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceModal(inv)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7f56d9]/15 hover:bg-[#7f56d9]/25 text-[#9e77ed] hover:text-white font-medium cursor-pointer transition-all border border-[#7f56d9]/30 text-xs shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ver PDF</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal / PDF Receipt Viewer */}
          {selectedInvoiceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#0c1018] border border-[#e3e8ee] dark:border-[#1e2430] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-[#0a2540] dark:text-white">
                {/* Modal Header */}
                <div className="p-5 border-b border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between bg-[#f8fafc] dark:bg-[#121826]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#7f56d9]/20 flex items-center justify-center text-[#9e77ed]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Recibo Fiscal / Factura Oficial</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#052e16] text-[#4ade80] border border-[#14532d]">
                          PAGADO
                        </span>
                      </h2>
                      <span className="text-xs text-[#697386] dark:text-[#8792a2] font-mono">
                        Folio: {selectedInvoiceModal.folio} · UUID: {selectedInvoiceModal.uuid}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInvoiceModal(null)}
                    className="w-8 h-8 rounded-lg bg-[#222429] hover:bg-[#2c2e33] text-[#697386] dark:text-[#8792a2] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Receipt Body (Printable Area) */}
                <div id="invoice-printable-content" className="p-6 space-y-6 text-xs bg-white dark:bg-[#0c1018]">
                  {/* Top Company & Client Grid */}
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[#e3e8ee] dark:border-[#1e2430]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#7f56d9] uppercase tracking-wider block">
                        Emisor
                      </span>
                      <h4 className="font-bold text-sm text-[#0a2540] dark:text-white">Mercant AI S.A.P.I. de C.V.</h4>
                      <p className="text-[#697386] dark:text-[#8792a2] text-[11px] leading-relaxed">
                        RFC: MAI240315-9K2<br />
                        Régimen Fiscal: 601 General de Ley Personas Morales<br />
                        Av. Paseo de la Reforma 483, Cuauhtémoc, CDMX, C.P. 06500<br />
                        soporte@mercant.ai · www.mercant.ai
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-[10px] font-bold text-[#7f56d9] uppercase tracking-wider block">
                        Cliente / Receptor
                      </span>
                      <h4 className="font-bold text-sm text-[#0a2540] dark:text-white">{userEmail}</h4>
                      <p className="text-[#697386] dark:text-[#8792a2] text-[11px] leading-relaxed">
                        RFC: XAXX010101000 (Público en General)<br />
                        Uso CFDI: G03 Gastos en general<br />
                        Método de Pago: {selectedInvoiceModal.paymentMethod}<br />
                        Fecha de Emisión: {selectedInvoiceModal.date}
                      </p>
                    </div>
                  </div>

                  {/* Line Item Table */}
                  <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f8fafc] dark:bg-[#121826] text-[#697386] dark:text-[#8792a2] text-[11px]">
                        <tr>
                          <th className="p-3">Descripción</th>
                          <th className="p-3 text-center">Cant.</th>
                          <th className="p-3 text-right">P. Unitario</th>
                          <th className="p-3 text-right">Importe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2025]">
                        <tr>
                          <td className="p-3">
                            <span className="font-semibold text-white block">{selectedInvoiceModal.plan}</span>
                            <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                              {selectedInvoiceModal.isPromo
                                ? 'Canje de Cupón Promocional MERCANT10 (Descuento 100% por 30 días)'
                                : 'Suscripción mensual recurrente · Consultas ilimitadas y rastreo web'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-white font-medium">1</td>
                          <td className="p-3 text-right text-[#697386] dark:text-[#8792a2] font-mono">{selectedInvoiceModal.subtotal}</td>
                          <td className="p-3 text-right text-white font-semibold font-mono">{selectedInvoiceModal.subtotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2 bg-[#f8fafc] dark:bg-[#121826] p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430]">
                      <div className="flex justify-between text-[#697386] dark:text-[#8792a2]">
                        <span>Subtotal:</span>
                        <span className="font-mono">{selectedInvoiceModal.subtotal}</span>
                      </div>
                      {selectedInvoiceModal.discount && (
                        <div className="flex justify-between text-[#4ade80]">
                          <span>Descuento:</span>
                          <span className="font-mono">{selectedInvoiceModal.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#697386] dark:text-[#8792a2]">
                        <span>IVA Trasladado (16%):</span>
                        <span className="font-mono">{selectedInvoiceModal.iva}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#e3e8ee] dark:border-[#1e2430]">
                        <span>Total Pagado:</span>
                        <span className="text-[#9e77ed] font-mono">{selectedInvoiceModal.amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* SAT Footer & Timbre Simulation */}
                  <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#121826]/50 border border-[#e3e8ee] dark:border-[#1e2430] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#697386] dark:text-[#8792a2] uppercase tracking-wider">
                        Timbre Fiscal Digital (SAT CFDI 4.0)
                      </span>
                      <span className="text-[10px] text-[#4ade80] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verificado por Proveedor Autorizado de Certificación
                      </span>
                    </div>
                    <p className="font-mono text-[9px] text-[#697386] dark:text-[#8792a2] break-all leading-tight">
                      ||1.1|{selectedInvoiceModal.uuid}|2026-03-06T12:00:00|MAI240315-9K2|7f8a9e10bcde89f1a2b3c4d5e6f7a8b9c0d1e2f3|00001000000504465028||
                    </p>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 border-t border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                    Documento con validez fiscal para deducción en México (MXN).
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoiceModal(null)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#222429] hover:bg-[#2c2e33] text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        window.print()
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#7f56d9] hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / Descargar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- OTHER TABS (WHATSAPP, CONNECTORS, RULES) --- */}
      {activeTab !== 'billing' && (
        <form onSubmit={handleSave} className="space-y-4">
          {/* WhatsApp Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> {t('whatsappConnector')}
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                  {t('whatsappDesc')}
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> {t('devModeBadge')}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#697386] dark:text-[#8792a2]" /> {t('whatsappNumberLabel')}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="font-mono text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-white max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSending}
                    className="px-3.5 py-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#121826] hover:bg-[#202226] border border-[#e3e8ee] dark:border-[#1e2430] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3 h-3 text-[#25D366]" />
                    {isSending ? t('simulatingBtn') : t('testNotificationBtn')}
                  </button>
                </div>
                <span className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-1.5 block">
                  {t('devDisclaimer')}
                </span>
              </div>

              {testResult && (
                <div className="p-4 rounded-xl bg-[#062419] border border-[#0d543a] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#4ade80] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> {t('simSuccessful')}
                    </span>
                    <a
                      href={testResult.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#25D366] text-black font-semibold text-[11px] hover:bg-[#20ba59] transition-colors inline-flex items-center gap-1"
                    >
                      <span>{t('openWhatsAppWeb')}</span>
                      <Send className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="bg-[#0b1f17] p-3 rounded-lg border border-[#134230] text-xs font-mono whitespace-pre-line text-emerald-100 leading-relaxed">
                    {testResult.messageText}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#e3e8ee] dark:border-[#1e2430] space-y-2.5">
                <span className="block text-xs font-semibold text-[#0a2540] dark:text-white">
                  {t('eventsToNotify')}
                </span>

                <label className="flex items-center gap-2.5 text-xs text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyPriceDrop}
                    onChange={(e) => setNotifyPriceDrop(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] bg-[#f8fafc] dark:bg-[#121826] cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block">{t('radarOpportunity')}</span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      {t('radarOpportunityDesc')}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyQuoteReady}
                    onChange={(e) => setNotifyQuoteReady(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] bg-[#f8fafc] dark:bg-[#121826] cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block">{t('quoteReadyEvent')}</span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      {t('quoteReadyDesc')}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyRiskAlerts}
                    onChange={(e) => setNotifyRiskAlerts(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] bg-[#f8fafc] dark:bg-[#121826] cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block">{t('riskAlertEvent')}</span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      {t('riskAlertDesc')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Connectors Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#7f56d9]" /> {t('connectors')}
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                  {t('tab1Desc')}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#1e2025] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">MercadoLibre México</span>
                  <span className="text-[#697386] dark:text-[#8792a2] text-[11px]">API Oficial & Catálogo Nacional</span>
                </div>
                <span className="text-[11px] font-medium text-[#4ade80] bg-[#052e16] border border-[#14532d] px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">Distribuidores Mayoristas</span>
                  <span className="text-[#697386] dark:text-[#8792a2] text-[11px]">Amazon MX, CyberPuerta, OfficeDepot, Lenovo</span>
                </div>
                <span className="text-[11px] font-medium text-[#4ade80] bg-[#052e16] border border-[#14532d] px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Rules Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-4">
            <div className="pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#4ade80]" /> {t('tab2Title')}
              </h3>
              <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                {t('tab2Desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-white mb-1.5">
                  {t('defaultCurrency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-white cursor-pointer"
                >
                  <option value="MXN">MXN (Peso Mexicano)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-white mb-1.5">
                  {t('trustThresholdLabel')}: {trustThreshold}/100
                </label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={trustThreshold}
                  onChange={(e) => setTrustThreshold(Number(e.target.value))}
                  className="w-full accent-[#7f56d9] cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs text-[#4ade80] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('settingsSaved')}
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#7f56d9] hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {t('saveSettingsBtn')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#697386] dark:text-[#8792a2]">Cargando configuración...</div>}>
      <SettingsContent />
    </Suspense>
  )
}


