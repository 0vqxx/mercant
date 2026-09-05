/**
 * ProcureAI — Auth Helpers
 *
 * Server-side helpers for retrieving and requiring authentication.
 * Use `requireAuth()` in Server Components / Actions that must be
 * protected, and `getOptionalSession()` where auth is optional.
 */

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// ---------------------------------------------------------------------------
// requireAuth — redirect to /login if the user is not authenticated
// ---------------------------------------------------------------------------

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }
  return session as typeof session & { user: { id: string } }
}

// ---------------------------------------------------------------------------
// getOptionalSession — returns session or null without redirecting
// ---------------------------------------------------------------------------

export async function getOptionalSession() {
  return getServerSession(authOptions)
}
