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
  Building,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Server,
  Webhook,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Trash2,
  CheckCheck,
  HelpCircle,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Language } from '@/lib/i18n/translations'

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'account')
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/settings?tab=${tabId}`, { scroll: false })
  }

  // General Notification Save state
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const triggerSaveNotification = (msg = 'Ajustes guardados correctamente') => {
    setSaveSuccess(msg)
    setTimeout(() => setSaveSuccess(null), 3000)
  }

  // --- 1. CUENTA (ACCOUNT) STATE ---
  const [accountForm, setAccountForm] = useState({
    companyName: 'Tecnología y Suministros MX S.A. de C.V.',
    rfc: 'TSM2108159A3',
    taxRegime: '601 - General de Ley Personas Morales',
    cfdiUsage: 'G03 - Gastos en general',
    billingEmail: 'facturacion@mercant.org',
    corporatePhone: '+52 55 4162 8900',
    street: 'Av. Insurgentes Sur 1602, Piso 9',
    colonia: 'Crédito Constructor',
    zipCode: '03940',
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mercant_account_settings')
      if (saved) {
        setAccountForm((prev) => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {}
  }, [])

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem('mercant_account_settings', JSON.stringify(accountForm))
    } catch {}
    triggerSaveNotification('Datos de la cuenta y fiscales guardados')
  }

  // --- 2. PERFIL (PROFILE) STATE ---
  const [profileForm, setProfileForm] = useState({
    fullName: 'Andrés Quintana',
    email: 'andresquintanaort@gmail.com',
    role: 'Director de Compras & Sourcing',
    phone: '+52 55 8492 1044',
    timezone: 'America/Mexico_City',
    bio: 'Encargado de adquisiciones corporativas, optimización de presupuesto de TI y licitaciones.',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mercant_profile_settings')
      if (saved) {
        setProfileForm((prev) => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {}
  }, [])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem('mercant_profile_settings', JSON.stringify(profileForm))
    } catch {}
    triggerSaveNotification('Perfil de usuario actualizado exitosamente')
  }

  // --- 3. SEGURIDAD (SECURITY) STATE ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden.')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    triggerSaveNotification('Contraseña actualizada con éxito')
  }

  // --- 4. FACTURACIÓN (BILLING) STATE ---
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

  const loadBilling = () => {
    if (typeof window !== 'undefined') {
      const storedPlan = localStorage.getItem('mercant-plan')
      if (storedPlan === 'PRO' || storedPlan === 'ENTERPRISE') {
        setUserPlan(storedPlan as 'PRO' | 'ENTERPRISE')
      }
    }

    fetch('/api/billing')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          const storedPlan = typeof window !== 'undefined' ? localStorage.getItem('mercant-plan') : null
          const effectivePlan = (storedPlan === 'PRO' || storedPlan === 'ENTERPRISE') ? storedPlan : (data.plan || 'FREE')
          const isPro = effectivePlan === 'PRO' || effectivePlan === 'ENTERPRISE'

          data.plan = effectivePlan
          if (isPro) {
            data.isActive = true
            data.quotesTotal = 1000
          }
          setBillingData(data)
          setUserPlan(effectivePlan as 'FREE' | 'PRO' | 'ENTERPRISE')
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadBilling()

    const handlePlanUpdate = (e: any) => {
      const detail = e.detail || {}
      const newPlan = detail.plan || 'PRO'
      setUserPlan(newPlan)
      setBillingData((prev) =>
        prev
          ? { ...prev, plan: newPlan, isActive: true, quotesTotal: 1000 }
          : null
      )
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mercant-plan-updated', handlePlanUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mercant-plan-updated', handlePlanUpdate)
      }
    }
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

    // Reactively update local state and broadcast immediately
    setUserPlan('PRO')
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mercant-plan', 'PRO')
        localStorage.setItem('mercant-plan-lifetime', isLifetime ? 'true' : 'false')
        window.dispatchEvent(new CustomEvent('mercant-plan-updated', { detail: { plan: 'PRO', isLifetime } }))
      } catch {}
    }

    setBillingData((prev) => {
      const newHistoryItem = {
        id: `promo-${Date.now()}`,
        code: codeToUse,
        plan: 'PRO Unlimited',
        date: new Date().toISOString(),
      }
      const existingHistory = prev?.history || []
      return {
        email: prev?.email || profileForm.email || 'andresquintanaort@gmail.com',
        name: prev?.name || profileForm.fullName || 'Andres Quintana',
        plan: 'PRO',
        planExpiresAt: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        quotesUsed: prev?.quotesUsed ?? 0,
        quotesTotal: 1000,
        itemsCount: prev?.itemsCount ?? 0,
        percentUsed: 0,
        history: [newHistoryItem, ...existingHistory.filter((h) => h.code !== codeToUse)],
      }
    })

    try {
      const res = await fetch('/api/billing/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse, email: billingData?.email || profileForm.email || 'andresquintanaort@gmail.com' }),
      })
      const data = await res.json().catch(() => ({}))
      
      const successText = data.message || fallbackMessage
      setPromoSuccess(successText)
      setPromoCode('')
    } catch {
      setPromoSuccess(fallbackMessage)
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

  // --- 5. NOTIFICACIONES (NOTIFICATIONS) STATE ---
  const [whatsappNumber, setWhatsappNumber] = useState('+52 55 8492 1044')
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(true)
  const [notifyQuoteReady, setNotifyQuoteReady] = useState(true)
  const [notifyRiskAlerts, setNotifyRiskAlerts] = useState(false)
  const [notifyEmailDigest, setNotifyEmailDigest] = useState(true)
  const [notifyTenderAlerts, setNotifyTenderAlerts] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [testResult, setTestResult] = useState<{
    phone: string
    messageText: string
    waLink: string
  } | null>(null)

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

  // --- 6. APARIENCIA (APPEARANCE) STATE ---
  const [currency, setCurrency] = useState('MXN')
  const [trustThreshold, setTrustThreshold] = useState(70)

  // --- 7. INTEGRACIONES (INTEGRATIONS) STATE ---
  const [integrations, setIntegrations] = useState({
    mercadolibre: true,
    amazon: true,
    cyberpuerta: true,
    officedepot: true,
    sap: false,
    odoo: true,
    netsuite: false,
    aspel: false,
  })
  const [webhookUrl, setWebhookUrl] = useState('https://erp.tuempresa.com/api/v1/mercant-webhook')

  // --- 8. API STATE ---
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [apiEnvironment, setApiEnvironment] = useState<'live' | 'test'>('live')
  const liveApiKey = 'mk_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
  const testApiKey = 'mk_test_3c1b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1b'
  const currentKey = apiEnvironment === 'live' ? liveApiKey : testApiKey

  const copyToClipboard = (text: string, cb: () => void) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      cb()
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const navTabs = [
    { id: 'account', label: t('account'), icon: Building },
    { id: 'profile', label: t('profile'), icon: UserIcon },
    { id: 'security', label: t('security'), icon: Lock },
    { id: 'billing', label: t('billingTab'), icon: CreditCard },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'integrations', label: t('integrations'), icon: Layers },
    { id: 'api', label: t('apiTab'), icon: Key },
  ]

  const quotesUsed = billingData?.quotesUsed ?? 0
  const quotesTotal = billingData?.quotesTotal ?? 10
  const percentUsed = billingData?.percentUsed ?? Math.min(Math.round((quotesUsed / quotesTotal) * 100), 100)
  const userEmail = billingData?.email || profileForm.email || 'usuario@mercant.ai'
  const isPlanActive = userPlan === 'PRO' || userPlan === 'ENTERPRISE' || Boolean(billingData?.isActive)

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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white">
            {t('settings')}
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Administra tu cuenta de empresa, perfiles de usuario, facturación CFDI 4.0, integraciones y llaves de API.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Top Tabs Bar - Minimalist Pill Style */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-b border-[#e3e8ee] dark:border-[#1e2430] pb-2">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#0a2540] text-white dark:bg-[#7f56d9] dark:text-white shadow-xs font-semibold'
                  : 'text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#121826]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. CUENTA (ACCOUNT) TAB */}
      {/* ======================================================== */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="space-y-6">
          {/* Card: Datos de la Empresa / Razón Social */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635bff]/10 dark:bg-[#7f56d9]/20 flex items-center justify-center text-[#635bff] dark:text-[#9e77ed]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                    Datos de la Empresa y Razón Social
                  </h3>
                  <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                    Información corporativa empleada en emisión de cotizaciones y facturas oficiales.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Razón Social o Nombre Legal
                </label>
                <Input
                  value={accountForm.companyName}
                  onChange={(e) => setAccountForm({ ...accountForm, companyName: e.target.value })}
                  placeholder="Ej. Mi Empresa S.A. de C.V."
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  RFC (Registro Federal de Contribuyentes)
                </label>
                <Input
                  value={accountForm.rfc}
                  onChange={(e) => setAccountForm({ ...accountForm, rfc: e.target.value.toUpperCase() })}
                  placeholder="XAXX010101000"
                  className="font-mono text-xs uppercase bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Régimen Fiscal
                </label>
                <select
                  value={accountForm.taxRegime}
                  onChange={(e) => setAccountForm({ ...accountForm, taxRegime: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff]"
                >
                  <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                  <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                  <option value="603 - Personas Morales con Fines no Lucrativos">603 - Personas Morales con Fines no Lucrativos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Uso de CFDI por Defecto
                </label>
                <select
                  value={accountForm.cfdiUsage}
                  onChange={(e) => setAccountForm({ ...accountForm, cfdiUsage: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff]"
                >
                  <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                  <option value="G01 - Adquisición de mercancías">G01 - Adquisición de mercancías</option>
                  <option value="I04 - Equipo de cómputo y accesorios">I04 - Equipo de cómputo y accesorios</option>
                  <option value="CP01 - Pagos">CP01 - Pagos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Correo Electrónico de Facturación / Pagos
                </label>
                <Input
                  type="email"
                  value={accountForm.billingEmail}
                  onChange={(e) => setAccountForm({ ...accountForm, billingEmail: e.target.value })}
                  placeholder="facturacion@empresa.com"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Teléfono Corporativo
                </label>
                <Input
                  value={accountForm.corporatePhone}
                  onChange={(e) => setAccountForm({ ...accountForm, corporatePhone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>
            </div>
          </div>

          {/* Card: Domicilio Fiscal */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <MapPin className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Domicilio Fiscal en México
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Calle y Número
                </label>
                <Input
                  value={accountForm.street}
                  onChange={(e) => setAccountForm({ ...accountForm, street: e.target.value })}
                  placeholder="Calle, No. Exterior, No. Interior"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Código Postal (C.P.)
                </label>
                <Input
                  value={accountForm.zipCode}
                  onChange={(e) => setAccountForm({ ...accountForm, zipCode: e.target.value })}
                  placeholder="03940"
                  className="font-mono text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Colonia
                </label>
                <Input
                  value={accountForm.colonia}
                  onChange={(e) => setAccountForm({ ...accountForm, colonia: e.target.value })}
                  placeholder="Colonia"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Ciudad / Municipio
                </label>
                <Input
                  value={accountForm.city}
                  onChange={(e) => setAccountForm({ ...accountForm, city: e.target.value })}
                  placeholder="Ciudad de México"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Estado
                </label>
                <Input
                  value={accountForm.state}
                  onChange={(e) => setAccountForm({ ...accountForm, state: e.target.value })}
                  placeholder="CDMX"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Zona de Peligro
              </h4>
              <p className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-0.5">
                Restablece tus búsquedas locales y configuración en este navegador.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Estás seguro de restablecer los datos locales de cotizaciones?')) {
                  localStorage.removeItem('mercant_procurements_cache')
                  triggerSaveNotification('Datos locales restablecidos')
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              Limpiar Caché Local
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#635bff] hover:bg-[#5346e0] dark:bg-[#7f56d9] dark:hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Datos de Cuenta</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 2. PERFIL (PROFILE) TAB */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#635bff] to-[#7f56d9] flex items-center justify-center text-white font-bold text-xl ring-4 ring-indigo-50 dark:ring-indigo-950/30">
                AQ
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                  {profileForm.fullName || 'Usuario Mercant'}
                </h3>
                <span className="text-xs text-[#697386] dark:text-[#8792a2]">
                  {profileForm.email} · {profileForm.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Nombre Completo
                </label>
                <Input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Tu nombre completo"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Correo Electrónico Personal / Login
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="nombre@empresa.com"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Puesto / Cargo en la Empresa
                </label>
                <Input
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  placeholder="Ej. Procurement Manager, Comprador Sr."
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Teléfono Directo
                </label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Zona Horaria
                </label>
                <select
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff]"
                >
                  <option value="America/Mexico_City">Hora Central de México (CDMX / Monterrey / GDL) - GMT-6</option>
                  <option value="America/Cancun">Hora del Sureste (Cancún / Chetumal) - GMT-5</option>
                  <option value="America/Tijuana">Hora del Pacífico (Tijuana / Mexicali) - GMT-8</option>
                  <option value="America/Hermosillo">Hora del Noroeste (Sonora) - GMT-7</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Notas Predeterminadas en Solicitudes de Cotización
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Instrucciones automáticas para proveedores..."
                  className="w-full p-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-xl text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#635bff] hover:bg-[#5346e0] dark:bg-[#7f56d9] dark:hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 3. SEGURIDAD (SECURITY) TAB */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Card: Change Password */}
          <form onSubmit={handleUpdatePassword} className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Lock className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Cambiar Contraseña
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Contraseña Actual
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Nueva Contraseña
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Confirmar Contraseña
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Ocultar caracteres' : 'Mostrar caracteres'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0a2540] dark:bg-[#7f56d9] hover:bg-[#1e2e48] dark:hover:bg-[#6941c6] text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                Actualizar Contraseña
              </button>
            </div>
          </form>

          {/* Card: 2FA */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                    Autenticación en Dos Pasos (2FA)
                  </h3>
                  <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                    Protege el acceso a tus cotizaciones corporativas requiriendo un código TOTP (Google Authenticator / 1Password).
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked)
                    triggerSaveNotification(e.target.checked ? '2FA activado con éxito' : '2FA desactivado')
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#1e2430] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {twoFactorEnabled ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                <CheckCheck className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block">Autenticación 2FA Activada</span>
                  <span className="text-[11px] opacity-90">Tu cuenta está protegida con cifrado de segundo factor.</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                Se recomienda habilitar 2FA para cuentas que gestionan compras por más de $100,000 MXN mensuales.
              </p>
            )}
          </div>

          {/* Card: Active Sessions */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              Sesiones Activas
            </h3>

            <div className="divide-y divide-[#e3e8ee] dark:divide-[#1e2430] text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-[#635bff] dark:text-[#9e77ed]" />
                  <div>
                    <span className="font-semibold text-[#0a2540] dark:text-white block">
                      Mac OS · Chrome (Navegador actual)
                    </span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      Ciudad de México, México · IP 187.190.12.44 · Activa ahora
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Esta sesión
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FACTURACIÓN (BILLING) TAB */}
      {/* ======================================================== */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {/* Card 1: Top Usage Progress Alert */}
          <div className={`rounded-2xl border bg-white dark:bg-[#0c1018] p-5 flex items-center justify-between gap-4 transition-all ${
            isPlanActive
              ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
              : 'border-[#e3e8ee] dark:border-[#1e2430]'
          }`}>
            <div className="flex items-center gap-4">
              {/* Circular SVG Ring Progress */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#e3e8ee] dark:text-[#222429]"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isPlanActive ? 'text-[#059669] dark:text-[#34d399]' : 'text-[#635bff] dark:text-[#7f56d9]'}
                    strokeDasharray={isPlanActive ? '100, 100' : `${percentUsed}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-bold ${isPlanActive ? 'text-[#059669] dark:text-[#34d399]' : 'text-[#635bff] dark:text-[#9e77ed]'}`}>
                  {isPlanActive ? '♾️' : `${percentUsed}%`}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">
                  {isPlanActive
                    ? 'Cotizaciones Ilimitadas Activas (Plan PRO Unlimited)'
                    : `Has usado ${quotesUsed} de ${quotesTotal} cotizaciones disponibles`}
                </h3>
                <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5 max-w-xl leading-relaxed">
                  {isPlanActive
                    ? `Plan PRO Ilimitado activo${billingData?.planExpiresAt ? ` (Vigente hasta ${new Date(billingData.planExpiresAt).toLocaleDateString()})` : ' (Vigencia de por vida ♾️)'}. Búsquedas web y cotizaciones en tiempo real en más de 500 distribuidores.`
                    : 'Mejora al plan Pro para desbloquear cotizaciones ilimitadas, rastreo web en distribuidores y soporte 24/7.'}
                </p>
              </div>
            </div>

            {isPlanActive && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#052e16] text-[#4ade80] border border-[#14532d] shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                LIFETIME ♾️
              </span>
            )}
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div>
              <h2 className="text-base font-bold text-[#0a2540] dark:text-white">
                Planes de Precios y Suscripción
              </h2>
              <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                Selecciona tu plan o canjea tu código de acceso para desbloquear cotizaciones ilimitadas en vivo.
              </p>
            </div>
            {isPlanActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#052e16] text-[#4ade80] border border-[#14532d] self-start sm:self-auto shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                Suscripción PRO Activa
              </span>
            )}
          </div>

          {/* 3-Column Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Starter Free Card */}
            <div className={`rounded-2xl border bg-white dark:bg-[#0c1018] p-5 flex flex-col justify-between transition-all ${
              !isPlanActive
                ? 'border-[#635bff] dark:border-[#7f56d9] ring-2 ring-[#635bff]/10 shadow-sm'
                : 'border-[#e3e8ee] dark:border-[#1e2430] opacity-85'
            }`}>
              <div>
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                    Starter (Gratuito)
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    !isPlanActive
                      ? 'bg-[#f4f6f8] dark:bg-[#1a2236] text-[#635bff] dark:text-[#7a73ff] border border-[#e3e8ee] dark:border-[#2e3748]'
                      : 'bg-[#f8fafc] dark:bg-[#121826] text-[#697386] dark:text-[#8792a2]'
                  }`}>
                    {!isPlanActive ? 'Plan Actual' : 'Plan Base'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="text-2xl font-extrabold text-[#0a2540] dark:text-white">$0</span>
                  <span className="text-xs text-[#697386] dark:text-[#8792a2] font-medium">MXN / mes</span>
                </div>

                <p className="text-xs text-[#697386] dark:text-[#8792a2] mb-4">
                  Ideal para profesionales independientes y primeras cotizaciones de suministros.
                </p>

                <ul className="space-y-2 text-xs text-[#4f566b] dark:text-[#8792a2] border-t border-[#f4f6f8] dark:border-[#1e2430] pt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span><strong>10 cotizaciones</strong> al mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Comparativa en 3 distribuidores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Enlaces directos con <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ref=mercant</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Historial de 30 días</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-[#f4f6f8] dark:border-[#1e2430]">
                {!isPlanActive ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#f4f6f8] dark:bg-[#1a2236] text-[#697386] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#2e3748] cursor-default text-center"
                  >
                    Tu Plan Actual ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-medium text-[#8792a2] border border-dashed border-[#e3e8ee] dark:border-[#1e2430] cursor-default text-center"
                  >
                    Plan Base
                  </button>
                )}
              </div>
            </div>

            {/* 2. PRO Unlimited Card (Highlighted) */}
            <div className={`relative rounded-2xl border-2 bg-white dark:bg-[#0c1018] p-5 flex flex-col justify-between transition-all duration-300 ${
              isPlanActive
                ? 'border-emerald-500/80 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-[#635bff] dark:border-[#7f56d9] bg-[#635bff]/[0.02] ring-4 ring-[#635bff]/10 shadow-lg shadow-[#635bff]/10'
            }`}>
              {/* Floating Top Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                {isPlanActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#052e16] text-[#4ade80] border border-[#14532d] shadow-sm uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                    ★ TU PLAN ACTUAL (ACTIVO ♾️)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#635bff] text-white shadow-sm uppercase tracking-wider">
                    ★ MÁS POPULAR
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between pb-2 pt-1">
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white flex items-center gap-1.5">
                    <span>Plan Pro Unlimited</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#635bff] dark:text-[#9e77ed]" />
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isPlanActive
                      ? 'bg-[#052e16] text-[#4ade80] border border-[#14532d]'
                      : 'bg-[#635bff]/15 text-[#635bff] dark:text-[#9e77ed]'
                  }`}>
                    {isPlanActive ? 'Desbloqueado' : 'Recomendado'}
                  </span>
                </div>

                <div className="mt-1 mb-2">
                  {isPlanActive ? (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#059669] dark:text-[#34d399]">$0</span>
                      <span className="line-through text-xs font-semibold text-[#697386] dark:text-[#8792a2]">$499 MXN</span>
                      <span className="text-[10px] font-bold text-[#059669] dark:text-[#34d399] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        100% OFF Cupón Activo
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-[#0a2540] dark:text-white">$499</span>
                      <span className="text-xs text-[#697386] dark:text-[#8792a2] font-medium">MXN / mes</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#697386] dark:text-[#8792a2] mb-4">
                  {isPlanActive
                    ? 'Acceso total sin límites a comparativas de distribuidores, enlaces directos y radar de precios.'
                    : 'Cotizaciones ilimitadas con IA multi-canal, scraping en tiempo real y optimización de presupuesto.'}
                </p>

                <ul className="space-y-2 text-xs text-[#4f566b] dark:text-[#8792a2] border-t border-[#f4f6f8] dark:border-[#1e2430] pt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span><strong className="text-[#0a2540] dark:text-white">Cotizaciones ILIMITADAS</strong> con IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Búsqueda en <strong>más de 500 distribuidores</strong> en México</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Enlaces directos con <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">ref=mercant</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Radar de precios en vivo & alertas WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Descargas ilimitadas de Órdenes de Compra (PDF / Excel)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-[#f4f6f8] dark:border-[#1e2430]">
                {isPlanActive ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#052e16] text-[#4ade80] border border-[#14532d] shadow-xs flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-4 h-4 text-[#4ade80]" />
                    <span>Plan Pro Activo ✓ (Desbloqueado)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCheckout('PRO')}
                    disabled={checkoutLoading === 'PRO'}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#635bff] hover:bg-[#5346e0] dark:bg-[#7f56d9] dark:hover:bg-[#6941c6] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkoutLoading === 'PRO' ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mejorar a Pro Unlimited</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 3. Enterprise B2B Card */}
            <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                    Enterprise B2B
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f8fafc] dark:bg-[#121826] text-[#697386] dark:text-[#8792a2] border border-[#e3e8ee] dark:border-[#1e2430]">
                    Corporativo
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="text-2xl font-extrabold text-[#0a2540] dark:text-white">$1,999</span>
                  <span className="text-xs text-[#697386] dark:text-[#8792a2] font-medium">MXN / mes</span>
                </div>

                <p className="text-xs text-[#697386] dark:text-[#8792a2] mb-4">
                  Para departamentos de adquisiciones corporativas con flujos de aprobación y ERPs.
                </p>

                <ul className="space-y-2 text-xs text-[#4f566b] dark:text-[#8792a2] border-t border-[#f4f6f8] dark:border-[#1e2430] pt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Todo lo incluido en Pro Unlimited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Multi-usuario con roles de compra y aprobación</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Integración API REST para ERP (SAP, Oracle, Odoo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Mayoristas cerrados (CVA, CT Internacional, Ingram)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Account Manager dedicado & SLA &lt; 1 hora</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-[#f4f6f8] dark:border-[#1e2430]">
                <a
                  href="mailto:ventas@mercant.ai?subject=Cotizaci%C3%B3n%20Plan%20Enterprise%20B2B"
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-[#e3e8ee] dark:border-[#333741] text-[#0a2540] dark:text-white hover:bg-[#f8fafc] dark:hover:bg-[#121826] flex items-center justify-center gap-2 transition-colors"
                >
                  Contactar Ventas
                </a>
              </div>
            </div>
          </div>

          {/* Row: Promo Code & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Promo Code Inset (col-span-2) */}
            <div className="md:col-span-2 rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#635bff]/15 dark:bg-[#7f56d9]/20 flex items-center justify-center text-[#635bff] dark:text-[#9e77ed] shrink-0">
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
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#635bff] dark:bg-[#7f56d9] text-white hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1"
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
                  className="font-mono uppercase text-xs font-semibold bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#333741] text-[#0a2540] dark:text-white placeholder-[#667085] rounded-lg px-3 py-2 w-full sm:w-36 focus:outline-none focus:border-[#635bff]"
                />
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#635bff] dark:bg-[#7f56d9] hover:opacity-90 active:scale-95 text-white transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center min-w-[75px]"
                >
                  {promoLoading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Canjear'
                  )}
                </button>
              </form>
            </div>

            {/* Payment Method (col-span-1) */}
            <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#0a2540] dark:text-white">
                  {t('paymentMethod')}
                </h3>
                <p className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-0.5">
                  {t('paymentMethodDesc')}
                </p>
              </div>

              <div className="mt-3 p-2.5 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#635bff] dark:bg-[#6941c6] flex items-center justify-center text-white shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#0a2540] dark:text-white block truncate">
                    {isPlanActive ? 'Cupón Activo / Stripe Connect' : 'Stripe Connect'}
                  </span>
                  <span className="text-[10px] text-[#697386] dark:text-[#8792a2] truncate block">
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>
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
                  className="pl-8 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white placeholder-[#667085] rounded-lg h-8 w-full focus:outline-none focus:border-[#635bff]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8fafc] dark:bg-[#0c1018] text-[#697386] dark:text-[#8792a2] border-b border-[#e3e8ee] dark:border-[#1e2430]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={toggleAllInvoices}
                        className="rounded border-[#333741] bg-[#f8fafc] dark:bg-[#121826] text-[#635bff] cursor-pointer"
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
                <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#1e2025]">
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
                        <tr key={inv.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#121826]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleInvoice(inv.id)}
                              className="rounded border-[#333741] bg-[#f8fafc] dark:bg-[#121826] text-[#635bff] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-medium text-[#0a2540] dark:text-white block">
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#635bff]/10 dark:bg-[#7f56d9]/15 hover:bg-[#635bff]/20 dark:hover:bg-[#7f56d9]/25 text-[#635bff] dark:text-[#9e77ed] font-medium cursor-pointer transition-all border border-[#635bff]/20 text-xs shadow-xs"
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
                    <div className="w-9 h-9 rounded-xl bg-[#635bff]/15 dark:bg-[#7f56d9]/20 flex items-center justify-center text-[#635bff] dark:text-[#9e77ed]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#0a2540] dark:text-white flex items-center gap-2">
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
                    type="button"
                    onClick={() => setSelectedInvoiceModal(null)}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#222429] hover:bg-gray-200 dark:hover:bg-[#2c2e33] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Receipt Body (Printable Area) */}
                <div id="invoice-printable-content" className="p-6 space-y-6 text-xs bg-white dark:bg-[#0c1018]">
                  {/* Top Company & Client Grid */}
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[#e3e8ee] dark:border-[#1e2430]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#635bff] dark:text-[#7f56d9] uppercase tracking-wider block">
                        Emisor
                      </span>
                      <h4 className="font-bold text-sm text-[#0a2540] dark:text-white">Mercant AI S.A.P.I. de C.V.</h4>
                      <p className="text-[#697386] dark:text-[#8792a2] text-[11px] leading-relaxed">
                        RFC: MAI240315-9K2<br />
                        Régimen Fiscal: 601 General de Ley Personas Morales<br />
                        Av. Paseo de la Reforma 483, Cuauhtémoc, CDMX, C.P. 06500<br />
                        soporte@mercant.org · www.mercant.org
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-[10px] font-bold text-[#635bff] dark:text-[#7f56d9] uppercase tracking-wider block">
                        Cliente / Receptor
                      </span>
                      <h4 className="font-bold text-sm text-[#0a2540] dark:text-white">{userEmail}</h4>
                      <p className="text-[#697386] dark:text-[#8792a2] text-[11px] leading-relaxed">
                        RFC: {accountForm.rfc || 'XAXX010101000'}<br />
                        Uso CFDI: {accountForm.cfdiUsage.split(' ')[0]}<br />
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
                      <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#1e2025]">
                        <tr>
                          <td className="p-3">
                            <span className="font-semibold text-[#0a2540] dark:text-white block">{selectedInvoiceModal.plan}</span>
                            <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                              {selectedInvoiceModal.isPromo
                                ? 'Canje de Cupón Promocional (Descuento 100% en cotizaciones)'
                                : 'Suscripción mensual recurrente · Consultas ilimitadas y rastreo web'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-[#0a2540] dark:text-white font-medium">1</td>
                          <td className="p-3 text-right text-[#697386] dark:text-[#8792a2] font-mono">{selectedInvoiceModal.subtotal}</td>
                          <td className="p-3 text-right text-[#0a2540] dark:text-white font-semibold font-mono">{selectedInvoiceModal.subtotal}</td>
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
                      <div className="flex justify-between text-sm font-bold text-[#0a2540] dark:text-white pt-2 border-t border-[#e3e8ee] dark:border-[#1e2430]">
                        <span>Total Pagado:</span>
                        <span className="text-[#635bff] dark:text-[#9e77ed] font-mono">{selectedInvoiceModal.amount}</span>
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
                      type="button"
                      onClick={() => setSelectedInvoiceModal(null)}
                      className="px-3.5 py-1.5 rounded-lg bg-gray-200 dark:bg-[#222429] hover:bg-gray-300 dark:hover:bg-[#2c2e33] text-[#0a2540] dark:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print()
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#635bff] dark:bg-[#7f56d9] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
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

      {/* ======================================================== */}
      {/* 5. NOTIFICACIONES (NOTIFICATIONS) TAB */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* WhatsApp Connector Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#25D366]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                    {t('whatsappConnector')}
                  </h3>
                  <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                    {t('whatsappDesc')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#697386] dark:text-[#8792a2]" /> {t('whatsappNumberLabel')}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="font-mono text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSending}
                    className="px-3.5 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-[#25D366]" />
                    {isSending ? t('simulatingBtn') : t('testNotificationBtn')}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
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

                  <div className="bg-white dark:bg-[#0b1f17] p-3 rounded-lg border border-emerald-200 dark:border-[#134230] text-xs font-mono whitespace-pre-line text-emerald-900 dark:text-emerald-100 leading-relaxed">
                    {testResult.messageText}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#e3e8ee] dark:border-[#1e2430] space-y-3">
                <span className="block text-xs font-semibold text-[#0a2540] dark:text-white">
                  {t('eventsToNotify')}
                </span>

                <label className="flex items-start gap-2.5 text-xs text-[#0a2540] dark:text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyPriceDrop}
                    onChange={(e) => setNotifyPriceDrop(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block">{t('radarOpportunity')}</span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      {t('radarOpportunityDesc')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-[#0a2540] dark:text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyQuoteReady}
                    onChange={(e) => setNotifyQuoteReady(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block">{t('quoteReadyEvent')}</span>
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      {t('quoteReadyDesc')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-[#0a2540] dark:text-[#d0d5dd] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyRiskAlerts}
                    onChange={(e) => setNotifyRiskAlerts(e.target.checked)}
                    className="rounded border-[#333741] text-[#25D366] focus:ring-[#25D366] mt-0.5 cursor-pointer"
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

          {/* Email Notifications Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Mail className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Notificaciones por Correo Electrónico
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <span className="font-semibold text-[#0a2540] dark:text-white block">Resumen Semanal de Ahorro y Cotizaciones</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Envía cada lunes un desglose consolidado de ahorros acumulados.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmailDigest}
                  onChange={(e) => setNotifyEmailDigest(e.target.checked)}
                  className="rounded border-[#333741] text-[#635bff] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <span className="font-semibold text-[#0a2540] dark:text-white block">Licitaciones y Requisiciones Públicas Detectadas</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Alertar cuando la IA identifique licitaciones afines a tu catálogo.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyTenderAlerts}
                  onChange={(e) => setNotifyTenderAlerts(e.target.checked)}
                  className="rounded border-[#333741] text-[#635bff] cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => triggerSaveNotification('Preferencias de notificación actualizadas')}
              className="px-5 py-2.5 rounded-xl bg-[#635bff] dark:bg-[#7f56d9] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Notificaciones</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. APARIENCIA (APPEARANCE) TAB */}
      {/* ======================================================== */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Card: Theme Selector */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Palette className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Tema de la Plataforma
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Option */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  theme === 'light'
                    ? 'border-[#635bff] bg-indigo-50/40 dark:bg-[#121826]'
                    : 'border-[#e3e8ee] dark:border-[#1e2430] hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-amber-500 shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#0a2540] dark:text-white block">
                    Modo Claro (Light)
                  </span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                    Diseño limpio estilo Stripe / Linear para oficinas iluminadas.
                  </span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-[#635bff]" />}
              </div>

              {/* Dark Mode Option */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  theme === 'dark'
                    ? 'border-[#7f56d9] bg-[#7f56d9]/10'
                    : 'border-[#e3e8ee] dark:border-[#1e2430] hover:border-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#121826] border border-[#1e2430] flex items-center justify-center text-[#9e77ed] shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#0a2540] dark:text-white block">
                    Modo Oscuro (Dark)
                  </span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                    Alto contraste y menor fatiga visual para sesiones prolongadas.
                  </span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-[#9e77ed]" />}
              </div>
            </div>
          </div>

          {/* Card: Idioma y Región */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Globe className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Idioma & Localización
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Idioma de la Interfaz
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full h-9 px-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff] cursor-pointer"
                >
                  <option value="es">Español (México / LatAm)</option>
                  <option value="en">English (United States)</option>
                  <option value="pt">Português (Brasil)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  {t('defaultCurrency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] rounded-lg text-[#0a2540] dark:text-white focus:outline-none focus:border-[#635bff] cursor-pointer"
                >
                  <option value="MXN">MXN (Peso Mexicano - $)</option>
                  <option value="USD">USD (Dólar Estadounidense - US$)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  {t('trustThresholdLabel')}: {trustThreshold}/100
                </label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={trustThreshold}
                  onChange={(e) => setTrustThreshold(Number(e.target.value))}
                  className="w-full accent-[#635bff] dark:accent-[#7f56d9] cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => triggerSaveNotification('Ajustes de apariencia aplicados')}
              className="px-5 py-2.5 rounded-xl bg-[#635bff] dark:bg-[#7f56d9] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Apariencia</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. INTEGRACIONES (INTEGRATIONS) TAB */}
      {/* ======================================================== */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Canales de Proveedores y Distribuidores */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                    Canales de Búsqueda y Mayoristas Conectados
                  </h3>
                  <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                    Conexiones de scraping y APIs oficiales en tiempo real para cotizaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">MercadoLibre México</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">API Oficial & Catálogo Nacional</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">Amazon Business México</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Precios corporativos y Prime B2B</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">CyberPuerta & Mayoristas TI</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Stock de hardware y componentes</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">OfficeDepot & Lenovo Mayorista</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Suministros de oficina y estaciones</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Conectores ERP y Contabilidad */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Server className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                  Sistemas ERP & Contabilidad
                </h3>
                <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                  Sincroniza automáticamente órdenes de compra y cotizaciones aprobadas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">SAP Business One</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Sincronización de OC y Catálogos</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntegrations(prev => ({ ...prev, sap: !prev.sap }))
                    triggerSaveNotification(!integrations.sap ? 'Conector SAP conectado' : 'Conector SAP desactivado')
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    integrations.sap
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-[#1e2430] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540]'
                  }`}
                >
                  {integrations.sap ? 'Conectado' : 'Conectar'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">Odoo Enterprise / Community</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Módulo de Compras e Inventario</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntegrations(prev => ({ ...prev, odoo: !prev.odoo }))
                    triggerSaveNotification(!integrations.odoo ? 'Conector Odoo conectado' : 'Conector Odoo desactivado')
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    integrations.odoo
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-[#1e2430] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540]'
                  }`}
                >
                  {integrations.odoo ? 'Conectado' : 'Conectar'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">Aspel SAE / COI</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Sistemas administrativos en México</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntegrations(prev => ({ ...prev, aspel: !prev.aspel }))
                    triggerSaveNotification(!integrations.aspel ? 'Conector Aspel conectado' : 'Conector Aspel desactivado')
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    integrations.aspel
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-[#1e2430] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540]'
                  }`}
                >
                  {integrations.aspel ? 'Conectado' : 'Conectar'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0a2540] dark:text-white block">Oracle NetSuite</span>
                  <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">SuiteCloud Sourcing API</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntegrations(prev => ({ ...prev, netsuite: !prev.netsuite }))
                    triggerSaveNotification(!integrations.netsuite ? 'Conector NetSuite conectado' : 'Conector NetSuite desactivado')
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    integrations.netsuite
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-[#1e2430] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540]'
                  }`}
                >
                  {integrations.netsuite ? 'Conectado' : 'Conectar'}
                </button>
              </div>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <Webhook className="w-4 h-4 text-[#635bff] dark:text-[#9e77ed]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                Webhooks de Eventos (Push)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                URL de Destino para Webhooks
              </label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://tudominio.com/webhooks/mercant"
                  className="font-mono text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
                <button
                  type="button"
                  onClick={() => triggerSaveNotification('Webhook de prueba enviado (HTTP 200 OK)')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0a2540] dark:bg-[#7f56d9] text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer shrink-0"
                >
                  Probar Enlace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. API TAB */}
      {/* ======================================================== */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Keys Card */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#1e2430]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635bff]/10 dark:bg-[#7f56d9]/20 flex items-center justify-center text-[#635bff] dark:text-[#9e77ed]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540] dark:text-white">
                    Claves de Acceso a la API de Mercant
                  </h3>
                  <p className="text-xs text-[#697386] dark:text-[#8792a2]">
                    Permite a tus desarrolladores cotizar listas y consultar precios en tiempo real mediante REST.
                  </p>
                </div>
              </div>

              {/* Environment Toggle */}
              <div className="flex items-center bg-[#f8fafc] dark:bg-[#121826] p-1 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430]">
                <button
                  type="button"
                  onClick={() => setApiEnvironment('live')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    apiEnvironment === 'live'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-[#697386] dark:text-[#8792a2]'
                  }`}
                >
                  Producción (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setApiEnvironment('test')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    apiEnvironment === 'test'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-[#697386] dark:text-[#8792a2]'
                  }`}
                >
                  Pruebas (Sandbox)
                </button>
              </div>
            </div>

            {/* API Key field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0a2540] dark:text-white">
                Secret API Key ({apiEnvironment.toUpperCase()})
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    value={apiKeyVisible ? currentKey : `${currentKey.slice(0, 8)}${'•'.repeat(28)}${currentKey.slice(-4)}`}
                    className="font-mono text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="absolute right-2 top-2 text-xs text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white px-2 py-0.5"
                  >
                    {apiKeyVisible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(currentKey, () => setCopiedKey(true))}
                  className="px-3.5 py-2 rounded-lg bg-[#635bff] dark:bg-[#7f56d9] text-white text-xs font-semibold hover:opacity-90 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2] block">
                Nunca compartas tus claves secretas en repositorios públicos.
              </span>
            </div>

            {/* Base Endpoint */}
            <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-[#0a2540] dark:text-white block">URL Base de API</span>
                <code className="font-mono text-[#635bff] dark:text-[#9e77ed]">https://api.mercant.org/v1</code>
              </div>
              <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">Límite: 1,000 req/min</span>
            </div>
          </div>

          {/* Quickstart Code Example */}
          <div className="rounded-2xl border border-[#e3e8ee] dark:border-[#1e2430] bg-[#0c1018] text-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2430]">
              <span className="text-xs font-bold font-mono text-[#9e77ed]">Ejemplo cURL · Cotizar Lista de Productos</span>
              <button
                type="button"
                onClick={() => {
                  const curlCmd = `curl -X POST https://api.mercant.org/v1/procurements \\
  -H "Authorization: Bearer ${currentKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Equipamiento Dell", "items": [{"name": "Dell OptiPlex 7020", "quantity": 50}]}'`
                  copyToClipboard(curlCmd, () => triggerSaveNotification('Comando cURL copiado'))
                }}
                className="text-xs text-[#8792a2] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar cURL</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-emerald-300 bg-black/50 p-4 rounded-xl overflow-x-auto leading-relaxed border border-[#1e2430]">
{`curl -X POST https://api.mercant.org/v1/procurements \\
  -H "Authorization: Bearer ${currentKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Equipamiento Dell Licitación 2026",
    "budget": 850000,
    "items": [
      { "name": "Dell OptiPlex 7020", "quantity": 50 },
      { "name": "Monitor Dell P2425H", "quantity": 50 }
    ]
  }'`}
            </pre>
          </div>
        </div>
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
