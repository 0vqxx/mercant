import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#eef2f6] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {children}
    </div>
  )
}
