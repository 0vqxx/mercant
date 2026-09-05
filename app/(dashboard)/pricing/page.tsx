'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPricingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings?tab=billing')
  }, [router])

  return (
    <div className="p-8 text-center text-xs text-[#697386] dark:text-[#8792a2]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#635bff] border-t-transparent rounded-full animate-spin" />
        <span>Cargando planes y facturación...</span>
      </div>
    </div>
  )
}
