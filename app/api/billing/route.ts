import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let user = null

    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const procurementsCount = await prisma.procurement.count({
      where: { userId: user.id },
    })

    const itemsCount = await prisma.procurementItem.count({
      where: {
        procurement: {
          userId: user.id,
        },
      },
    })

    const maxFreeQuotes = 10
    const plan = user.plan || 'FREE'
    const isPro = plan === 'PRO' || plan === 'ENTERPRISE'

    const userEmail = user.email || session?.user?.email || 'usuario@mercant.ai'

    return NextResponse.json({
      email: userEmail,
      name: user.name || userEmail.split('@')[0],
      plan: plan,
      planExpiresAt: user.planExpiresAt,
      isActive: isPro,
      quotesUsed: procurementsCount,
      quotesTotal: isPro ? 1000 : maxFreeQuotes,
      itemsCount: itemsCount,
      percentUsed: isPro ? Math.min(Math.round((procurementsCount / 1000) * 100), 100) : Math.min(Math.round((procurementsCount / maxFreeQuotes) * 100), 100),
      history: user.usedPromoCodes.map(u => ({
        id: u.id,
        code: u.promoCode.code,
        plan: u.promoCode.plan,
        date: u.usedAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[Billing API Error]', err)
    return NextResponse.json({ error: 'Error al consultar subscripción' }, { status: 500 })
  }
}

