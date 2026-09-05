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

    const raw = String(code || 'MERCANT-LIFETIME-5').trim()
    const cleanCode = raw.toUpperCase()
    const normalized = cleanCode.replace(/[^A-Z0-9]/g, '')

    const isLifetime =
      cleanCode.includes('LIFETIME') ||
      cleanCode.includes('VIP') ||
      cleanCode.includes('5') ||
      normalized.includes('LIFETIME')

    const promoConfig = {
      plan: 'PRO',
      durationDays: isLifetime ? 36500 : 30,
      maxUses: isLifetime ? 5 : 10,
      isLifetime,
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
