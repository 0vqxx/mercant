'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { Language, TranslationKey, translations } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey | string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (key) => (translations.es as Record<string, string>)[key] || key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('mercant-lang') as Language | null
      if (saved && (saved === 'es' || saved === 'en' || saved === 'pt')) {
        setLanguageState(saved)
        document.documentElement.lang = saved
      } else {
        const browserLang = navigator.language?.slice(0, 2)?.toLowerCase()
        if (browserLang === 'en' || browserLang === 'pt') {
          setLanguageState(browserLang as Language)
          document.documentElement.lang = browserLang
        }
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('mercant-lang', lang)
      document.documentElement.lang = lang
    } catch {
      // Ignore
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey | string): string => {
      const dict = (translations[language] || translations.es) as Record<string, string>
      const fallback = (translations.es as Record<string, string>)[key]
      return dict[key] || fallback || key
    },
    [language]
  )

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
