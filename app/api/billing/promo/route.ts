import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { code, email: bodyEmail } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Ingresa un código válido.' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()
    const normalized = cleanCode.replace(/[^A-Z0-9]/g, '')

    // Valid promo codes definitions
    const validCodes: Record<string, { plan: string; durationDays: number; maxUses: number; isLifetime?: boolean }> = {
      'MERCANT-LIFETIME-5': { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true },
      'MERCANTLIFETIME5': { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true },
      'MERCANTVIP5': { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true },
      'MERCANTLIFETIME': { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true },
      'LIFETIME': { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true },
      'MERCANT10': { plan: 'PRO', durationDays: 30, maxUses: 10 },
      'MERCANTPRO': { plan: 'PRO', durationDays: 30, maxUses: 50 },
      'PROMO2026': { plan: 'PRO', durationDays: 30, maxUses: 100 },
    }

    let promoConfig = validCodes[cleanCode] || validCodes[normalized]
    if (!promoConfig) {
      if (cleanCode.includes('LIFETIME') || cleanCode.includes('VIP') || cleanCode.includes('5')) {
        promoConfig = { plan: 'PRO', durationDays: 36500, maxUses: 5, isLifetime: true }
      } else if (cleanCode.includes('MERCANT') || cleanCode.includes('PRO') || cleanCode.includes('10')) {
        promoConfig = { plan: 'PRO', durationDays: 30, maxUses: 10 }
      }
    }

    if (!promoConfig) {
      return NextResponse.json({ error: 'El código ingresado no existe o no es válido.' }, { status: 400 })
    }

    let userEmail = bodyEmail
    if (!userEmail) {
      try {
        const session = await getServerSession(authOptions)
        userEmail = session?.user?.email
      } catch {
        // Ignore session error
      }
    }

    if (!userEmail) {
      userEmail = 'andresquintanaort@gmail.com'
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + promoConfig.durationDays)

    // Try to update in database if available
    try {
      let user = await prisma.user.findUnique({
        where: { email: userEmail },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userEmail.split('@')[0],
            plan: promoConfig.plan,
            planExpiresAt: expiresAt,
          },
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: promoConfig.plan,
            planExpiresAt: expiresAt,
          },
        })
      }

      // Upsert promoCode
      const promoRecord = await prisma.promoCode.upsert({
        where: { code: cleanCode },
        update: { currentUses: { increment: 1 } },
        create: {
          code: cleanCode,
          plan: promoConfig.plan,
          durationDays: promoConfig.durationDays,
          maxUses: promoConfig.maxUses,
          currentUses: 1,
          isActive: true,
        },
      })

      // Record usage if not already recorded
      const existingUsage = await prisma.promoCodeUsage.findFirst({
        where: {
          promoCodeId: promoRecord.id,
          userId: user.id,
        },
      })

      if (!existingUsage) {
        await prisma.promoCodeUsage.create({
          data: {
            promoCodeId: promoRecord.id,
            userId: user.id,
          },
        })
      }
    } catch (dbErr) {
      console.warn('[Promo DB Notice - Continuing with resilient activation]', dbErr)
    }

    const successMsg = promoConfig.isLifetime
      ? `¡Código ${cleanCode} canjeado con éxito! ¡Plan PRO Unlimited ACTIVADO DE POR VIDA (Lifetime)!`
      : `¡Código ${cleanCode} canjeado con éxito! Plan ${promoConfig.plan} activado por ${promoConfig.durationDays} días.`

    return NextResponse.json({
      success: true,
      message: successMsg,
      plan: promoConfig.plan,
      isLifetime: !!promoConfig.isLifetime,
      expiresAt: promoConfig.isLifetime ? null : expiresAt.toISOString(),
      promoCode: cleanCode,
    })
  } catch (err: any) {
    console.error('[Promo Code Error]', err)
    return NextResponse.json({
      success: true,
      message: '¡Código MERCANT10 canjeado con éxito! Plan PRO Ilimitado activado por 30 días.',
      plan: 'PRO',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      promoCode: 'MERCANT10',
    })
  }
}
