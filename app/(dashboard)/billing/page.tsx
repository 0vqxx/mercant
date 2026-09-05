'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings?tab=billing')
  }, [router])

  return (
    <div className="p-8 text-center text-xs text-[#697386] dark:text-[#8792a2]">
      Redirigiendo a Mejorar a Pro...
    </div>
  )
}

