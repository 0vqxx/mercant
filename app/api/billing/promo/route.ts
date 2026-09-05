import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let user = null

    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    }

    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión para canjear tu código.' }, { status: 401 })
    }

    const { code } = await req.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Ingresa un código válido.' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()

    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    })

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'El código ingresado no existe o está desactivado.' }, { status: 400 })
    }

    if (promo.currentUses >= promo.maxUses) {
      return NextResponse.json({ error: 'Este código ya ha alcanzado su límite máximo de 10 cuentas.' }, { status: 400 })
    }

    const existingUsage = await prisma.promoCodeUsage.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promo.id,
          userId: user.id,
        },
      },
    })

    if (existingUsage) {
      return NextResponse.json({ error: 'Ya has canjeado este código en esta cuenta.' }, { status: 400 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + promo.durationDays)

    await prisma.$transaction([
      prisma.promoCodeUsage.create({
        data: {
          promoCodeId: promo.id,
          userId: user.id,
        },
      }),
      prisma.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          plan: promo.plan,
          planExpiresAt: expiresAt,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Código canjeado con éxito. Plan ' + promo.plan + ' activado por ' + promo.durationDays + ' días.',
      plan: promo.plan,
      expiresAt,
      remainingUses: promo.maxUses - (promo.currentUses + 1),
    })
  } catch (err: any) {
    console.error('[Promo Code Error]', err)
    return NextResponse.json({ error: 'Error al procesar el código promocional.' }, { status: 500 })
  }
}
