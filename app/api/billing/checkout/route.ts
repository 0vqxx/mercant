import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { stripe } from '@/lib/stripe'

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
      return NextResponse.json({ error: 'Usuario no encontrado. Inicia sesión para continuar.' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const plan = body?.plan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO'

    const priceData = plan === 'ENTERPRISE'
      ? {
          name: 'Mercant AI Enterprise Plan',
          description: 'Asistente de compras ILIMITADO, API keys, soporte 24/7 y conectores avanzados',
          amount: 199900, // $1,999.00 MXN
        }
      : {
          name: 'Mercant AI Pro Unlimited',
          description: 'Búsquedas ilimitadas en tiendas de México, alertas de precios, rastreo web en tiempo real',
          amount: 49900, // $499.00 MXN
        }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: priceData.name,
              description: priceData.description,
            },
            unit_amount: priceData.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/settings?tab=billing&success=true&plan=${plan}`,
      cancel_url: `${origin}/settings?tab=billing&canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('[Stripe Checkout Error]', err)
    return NextResponse.json({ error: err.message || 'Error al crear sesión de pago.' }, { status: 500 })
  }
}
