'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  TrendingDown,
  PlusCircle,
  Sun,
  Moon,
  Building2,
  PieChart,
  Sliders,
  Sparkles,
  CreditCard,
  LogOut,
  User as UserIcon,
  LifeBuoy,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobileDrawer?: boolean
}

export function Sidebar({ isOpen, onClose, isMobileDrawer = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const supabase = createClient()

  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [imageError, setImageError] = useState(false)
  const [isProPlan, setIsProPlan] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
    let isMounted = true

    const getSupabaseUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && isMounted) {
          setSupabaseUser(user)
        }
      } catch {
        // Ignore
      }
    }
    getSupabaseUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSupabaseUser(session?.user ?? null)
        setImageError(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }
    await signOut({ callbackUrl: '/' })
  }

  // Google OAuth profile extraction (photo, full name, gmail)
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

  const userEmail =
    supabaseUser?.email ||
    session?.user?.email ||
    'usuario@mercant.ai'

  const navSections = [
    {
      title: t('operations'),
      items: [
        { href: '/dashboard', label: t('generalOverview'), icon: LayoutDashboard },
        { href: '/procurements', label: t('quotes'), icon: ShoppingCart },
        { href: '/procurements/new', label: t('newSearch'), icon: PlusCircle, badge: 'IA' },
      ],
    },
    {
      title: t('intelligenceMarket'),
      items: [
        { href: '/tracking', label: t('priceRadar'), icon: TrendingDown },
        { href: '/history', label: t('purchaseHistory'), icon: History },
        { href: '/suppliers', label: t('suppliersTrust'), icon: Building2 },
      ],
    },
    {
      title: t('financeControl'),
      items: [
        { href: '/analytics', label: t('savingsReport'), icon: PieChart },
        {
          href: '/settings?tab=billing',
          label: isProPlan ? 'Plan Pro (Activo)' : t('upgradeToProMenu'),
          icon: Sparkles,
          badge: isProPlan ? 'ACTIVO' : 'PRO',
          badgeActive: isProPlan,
        },
        { href: '/settings', label: t('settingsAlerts'), icon: Sliders },
        { href: '/support', label: t('supportDesk'), icon: LifeBuoy },
      ],
    },
  ]

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand logo */}
      <div className="p-4 border-b border-[#f4f6f8] dark:border-[#1e2430] flex items-center justify-between">
        <Link
          href="/"
          onClick={() => isMobileDrawer && onClose?.()}
          className="flex items-center gap-2.5 group"
          title={t('home')}
        >
          <img
            src="/mercant-logo.png"
            alt="Mercant Logo"
            className="h-6 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform"
          />
          <img
            src="/mercant-logo-white.png"
            alt="Mercant Logo"
            className="h-6 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-sm font-bold tracking-tight text-[#0a2540] dark:text-white">
              Mercant <span className="text-[#635bff] dark:text-[#7a73ff]">AI</span>
            </span>
            <span className="block text-[10px] text-[#697386] dark:text-[#8792a2] -mt-1 font-medium">
              {t('enterpriseSourcing')}
            </span>
          </div>
        </Link>

        {isMobileDrawer && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#697386] dark:text-[#8792a2] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2430] hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer md:hidden"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="text-[10px] font-semibold text-[#697386] dark:text-[#8792a2] px-2.5 py-1 uppercase tracking-wider">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobileDrawer && onClose?.()}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#f4f6f8] text-[#0a2540] dark:bg-[#635bff]/15 dark:text-white dark:border dark:border-[#635bff]/30 font-semibold'
                      : 'text-[#4f566b] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-[#121826]',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isActive
                          ? 'text-[#635bff] dark:text-[#7a73ff]'
                          : 'text-[#697386] dark:text-[#8792a2]',
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {(item as any).badge && (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.2 rounded border',
                      (item as any).badgeActive
                        ? 'bg-[#052e16] text-[#4ade80] border-[#14532d]'
                        : 'bg-[#f4f6f8] dark:bg-[#1a2236] text-[#635bff] dark:text-[#7a73ff] border-[#e3e8ee] dark:border-[#2e3748]'
                    )}>
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer controls & language / theme toggle */}
      <div className="p-3 border-t border-[#f4f6f8] dark:border-[#1e2430] space-y-2">
        {/* User Card & Logout Button */}
        <div className="p-2 rounded-lg bg-[#f8fafc] dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {userAvatar && !imageError ? (
              <img
                src={userAvatar}
                alt={userDisplayName}
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#e3e8ee] dark:border-[#2e3748] ring-1 ring-black/5"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#635bff] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userDisplayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#0a2540] dark:text-white truncate" title={userDisplayName}>
                {userDisplayName}
              </div>
              <div className="text-[10px] text-[#697386] dark:text-[#8792a2] truncate -mt-0.5" title={userEmail}>
                {userEmail}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title={t('logout')}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Selector in Sidebar */}
        <LanguageSelector variant="sidebar" />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-[#4f566b] dark:text-[#8792a2] hover:bg-[#f8fafc] dark:hover:bg-[#121826] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#7a73ff]" /> : <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />}
            <span>{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
          </span>
          <span className="text-[10px] text-[#697386] dark:text-slate-400 uppercase tracking-wider bg-[#f4f6f8] dark:bg-[#121826] border border-transparent dark:border-[#1e2430] px-1.5 py-0.5 rounded">
            {theme}
          </span>
        </button>
      </div>
    </div>
  )

  if (isMobileDrawer) {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />
        {/* Slide-over panel */}
        <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0c1018] border-r border-[#e3e8ee] dark:border-[#1e2430] shadow-2xl animate-in slide-in-from-left duration-200">
          {content}
        </aside>
      </div>
    )
  }

  return (
    <aside className="hidden md:flex w-64 border-r border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] flex-col h-screen shrink-0 select-none transition-colors duration-200">
      {content}
    </aside>
  )
}
