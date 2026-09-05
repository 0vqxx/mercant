import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { name, email, subject, category, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados.' },
        { status: 400 }
      )
    }

    // Generate unique Ticket ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    const ticketId = `TCK-${new Date().getFullYear()}-${randomSuffix}`

    const userEmail = email.trim().toLowerCase()

    // Persist to database
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketId,
        name: name.trim(),
        email: userEmail,
        subject: subject.trim(),
        category: category || 'other',
        message: message.trim(),
        status: 'OPEN',
        // Link to authenticated user if logged in
        ...(session?.user?.id ? { userId: session.user.id } : {}),
      },
    })

    console.log(`[Support Ticket Created] ID: ${ticketId} | DB: ${ticket.id} | From: ${name} <${userEmail}> | Category: ${category}`)

    return NextResponse.json({
      success: true,
      ticketId: ticket.ticketId,
      submittedAt: ticket.submittedAt.toISOString(),
      recipient: 'hello@mercant.org',
      message: 'Tu solicitud de soporte ha sido recibida y registrada con éxito.',
      estimatedResponseTime: 'Menos de 2 horas hábiles',
    })
  } catch (err: any) {
    console.error('[Support API Error]', err)
    return NextResponse.json(
      { error: err.message || 'Error al procesar el mensaje de soporte.' },
      { status: 500 }
    )
  }
}
