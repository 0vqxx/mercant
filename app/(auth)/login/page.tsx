'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Handle standard email/password submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (isSignUpMode && !agreeTerms) {
      setError(t('agreeTerms') + ' ' + t('termsAndPrivacy'))
      setLoading(false)
      return
    }

    try {
      if (isSignUpMode) {
        // Register with API
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()

        // Also register with Supabase Auth
        try {
          await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          })
        } catch {
          // Ignore
        }

        if (!res.ok) {
          throw new Error(data.error || 'Error al crear la cuenta')
        }

        // Auto sign-in
        const loginRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (loginRes?.error) {
          setError(loginRes.error)
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        // Sign In
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (res?.error) {
          // Supabase fallback
          const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (supaErr || !supaData.session) {
            setError('Credenciales incorrectas o usuario no encontrado.')
          } else {
            router.push('/dashboard')
            router.refresh()
          }
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth via Supabase
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError(null)

      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) throw oauthError
    } catch (err: any) {
      setError(err?.message || 'No se pudo conectar con Google Log In')
      setGoogleLoading(false)
    }
  }

  // Handle Apple OAuth
  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true)
      setError(null)
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: redirectUrl },
      })
      if (oauthError) throw oauthError
    } catch (err: any) {
      setError(err?.message || 'Apple Sign In no configurado en este entorno')
      setAppleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Top Bar with Return Link & Language Selector */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#3730e3] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al inicio</span>
        </Link>
        <LanguageSelector variant="footer" />
      </div>

      {/* Main Unified Card */}
      <div className="w-full bg-white dark:bg-[#0c1018] rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08),0_0_1px_1px_rgba(0,0,0,0.04)] dark:shadow-2xl border border-slate-200/80 dark:border-[#1e2430] overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-colors">
        
        {/* LEFT COLUMN: Visual Liquid Mesh Gradient Banner */}
        <div className="md:col-span-5 relative bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3730e3] dark:bg-none dark:bg-gradient-to-br dark:from-[#0b0f19] dark:via-[#111827] dark:to-[#0b0f19] dark:border-r dark:border-[#1e2430] p-6 sm:p-8 flex flex-col justify-between text-white select-none min-h-[360px] md:min-h-[520px]">
          
          {/* Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -left-16 w-60 h-60 bg-blue-400/30 dark:bg-[#635bff]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-indigo-500/40 dark:bg-[#9333ea]/20 rounded-full blur-2xl" />
          </div>

          {/* Top Brand Tag & Headline */}
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 border border-white/20 dark:border-white/10 backdrop-blur-md">
              <img src="/mercant-logo-white.png" alt="Mercant AI" className="h-4 w-auto" />
              <span className="text-xs font-bold tracking-wide">Mercant AI</span>
            </div>

            <div className="space-y-2 pt-1">
              <span className="block text-white/75 dark:text-slate-400 text-xs font-semibold tracking-wider uppercase">
                {t('youCanEasily')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
                {t('speedUpWork')}
              </h1>
            </div>

            <div className="space-y-2.5 pt-2 text-xs font-medium text-white/90 dark:text-slate-300">
              <div className="flex items-center gap-2 bg-white/10 dark:bg-[#151c2c] px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10 dark:border-[#232d42]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b8]" />
                <span>Comparación multi-proveedor en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 dark:bg-[#151c2c] px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10 dark:border-[#232d42]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b8]" />
                <span>Auditoría de reputación Trust Score 0-100</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 dark:bg-[#151c2c] px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10 dark:border-[#232d42]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b8]" />
                <span>Optimización algorítmica de presupuesto</span>
              </div>
            </div>
          </div>

          {/* Bottom Security & Encryption Tag */}
          <div className="relative z-10 pt-6 mt-auto border-t border-white/10 dark:border-[#1e2430] flex items-center justify-between text-[11px] text-white/75 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4b8]" />
              <span>{t('securitySsl')}</span>
            </div>
            <span>v2.0 Enterprise</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Section */}
        <div className="md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-[#0c1018]">
          <div className="w-full max-w-sm mx-auto space-y-5">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('getStartedNow')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isSignUpMode ? t('enterDetailsSignUp') : t('pleaseLogIn')}
              </p>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Name field (shown in signup mode) */}
              {isSignUpMode && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('nameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3730e3]/20 focus:border-[#3730e3] transition-all"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="workmail@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3730e3]/20 focus:border-[#3730e3] transition-all"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </label>
                  {!isSignUpMode && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#3730e3] hover:text-[#2c26c7] font-semibold hover:underline transition-colors"
                    >
                      {t('forgotPassword')}
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3730e3]/20 focus:border-[#3730e3] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#3730e3] focus:ring-[#3730e3]/20 cursor-pointer"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  {t('agreeTerms')}{' '}
                  <span className="text-slate-800 dark:text-slate-200 font-semibold hover:underline">
                    {t('termsAndPrivacy')}
                  </span>
                </label>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#3730e3] hover:bg-[#2c26c7] active:bg-[#201c9b] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSignUpMode ? t('signUpBtn') : t('logInBtn')}</span>
              </button>
            </form>

            {/* Switch between Log In & Sign Up */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              {isSignUpMode ? (
                <>
                  {t('alreadyHaveAccountLogin')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(false)
                      setError(null)
                    }}
                    className="font-bold text-[#3730e3] dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t('logInBtn')}
                  </button>
                </>
              ) : (
                <>
                  {t('dontHaveAccountSignup')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(true)
                      setError(null)
                    }}
                    className="font-bold text-[#3730e3] dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t('signUpBtn')}
                  </button>
                </>
              )}
            </div>

            {/* Divider "Or" */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold absolute">
                {t('orDivider')}
              </span>
            </div>

            {/* Social Logins */}
            <div>
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continuar con <strong>Google</strong></span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
