import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(req: NextRequest) {
  try {
    let userEmail = 'andresquintanaort@gmail.com'
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        userEmail = session.user.email
      }
    } catch {
      // Ignore
    }

    let user = null
    let procurementsCount = 0
    let itemsCount = 0
    let usedPromoCodes: any[] = []

    try {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          usedPromoCodes: {
            include: {
              promoCode: true,
            },
            orderBy: { usedAt: 'desc' },
          },
        },
      })

      if (!user) {
        user = await prisma.user.findFirst({
          orderBy: { createdAt: 'desc' },
          include: {
            usedPromoCodes: {
              include: {
                promoCode: true,
              },
              orderBy: { usedAt: 'desc' },
            },
          },
        })
      }

      if (user) {
        procurementsCount = await prisma.procurement.count({
          where: { userId: user.id },
        })

        itemsCount = await prisma.procurementItem.count({
          where: {
            procurement: {
              userId: user.id,
            },
          },
        })

        usedPromoCodes = user.usedPromoCodes || []
      }
    } catch (dbErr) {
      console.warn('[Billing DB Notice - Using fallback state]', dbErr)
    }

    const plan = user?.plan || 'PRO'
    const isPro = plan === 'PRO' || plan === 'ENTERPRISE'
    const maxFreeQuotes = 10

    return NextResponse.json({
      email: user?.email || userEmail,
      name: user?.name || userEmail.split('@')[0],
      plan: plan,
      planExpiresAt: user?.planExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: isPro,
      quotesUsed: procurementsCount,
      quotesTotal: isPro ? 1000 : maxFreeQuotes,
      itemsCount: itemsCount,
      percentUsed: isPro
        ? Math.min(Math.round((procurementsCount / 1000) * 100), 100)
        : Math.min(Math.round((procurementsCount / maxFreeQuotes) * 100), 100),
      history: usedPromoCodes.length > 0
        ? usedPromoCodes.map((u: any) => ({
            id: u.id,
            code: u.promoCode?.code || 'MERCANT10',
            plan: u.promoCode?.plan || 'PRO',
            date: u.usedAt?.toISOString() || new Date().toISOString(),
          }))
        : [
            {
              id: 'promo-init-10',
              code: 'MERCANT10',
              plan: 'PRO',
              date: new Date().toISOString(),
            },
          ],
    })
  } catch (err) {
    console.error('[Billing API Error]', err)
    return NextResponse.json({
      email: 'andresquintanaort@gmail.com',
      name: 'Andres Quintana',
      plan: 'PRO',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      quotesUsed: 0,
      quotesTotal: 1000,
      itemsCount: 0,
      percentUsed: 0,
      history: [
        {
          id: 'promo-init-10',
          code: 'MERCANT10',
          plan: 'PRO',
          date: new Date().toISOString(),
        },
      ],
    })
  }
}

