import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            offers: {
              include: {
                alerts: true,
              },
              orderBy: {
                buyingScore: 'desc',
              },
            },
          },
        },
      },
    })

    if (!procurement) {
      return NextResponse.json({ error: 'Procurement not found' }, { status: 404 })
    }

    return NextResponse.json({ procurement })
  } catch (err: any) {
    console.error('[api/procurements/[id]] GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, budget, priorityMode, status, notes } = body

    const updated = await prisma.procurement.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(budget !== undefined ? { budget: budget ? parseFloat(String(budget)) : null } : {}),
        ...(priorityMode ? { priorityMode } : {}),
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    })

    return NextResponse.json({ success: true, procurement: updated })
  } catch (err: any) {
    console.error('[api/procurements/[id]] PUT error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.procurement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/procurements/[id]] DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
