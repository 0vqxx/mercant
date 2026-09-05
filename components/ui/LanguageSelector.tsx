'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Language } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇲🇽' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

interface LanguageSelectorProps {
  variant?: 'navbar' | 'sidebar' | 'footer' | 'minimal'
  className?: string
}

export function LanguageSelector({ variant = 'minimal', className }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left select-none', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold',
          variant === 'navbar' &&
            'px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20',
          variant === 'sidebar' &&
            'w-full justify-between px-2.5 py-1.5 rounded-md text-[#4f566b] dark:text-[#8792a2] hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]',
          variant === 'footer' &&
            'px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
          variant === 'minimal' &&
            'px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
        )}
      >
        <span className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 opacity-80" />
          <span>{current.flag}</span>
          <span className="uppercase tracking-wider">{current.code}</span>
        </span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-36 rounded-xl bg-white dark:bg-[#151a24] border border-slate-200 dark:border-[#232a38] shadow-lg py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100',
            variant === 'sidebar' ? 'bottom-full mb-1.5 left-0' : 'right-0'
          )}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[#f4f6f8] text-[#0a2540] dark:bg-[#1e2430] dark:text-white font-bold'
                    : 'text-[#4f566b] dark:text-[#8792a2] hover:bg-[#f8fafc] dark:hover:bg-[#1a2130] hover:text-[#0a2540] dark:hover:text-white'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#635bff]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
