import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  getProcurementMemory,
  updateProcurementMemory,
  deleteProcurementMemory,
} from '@/lib/procurementsMemory'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    try {
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

      if (procurement) {
        return NextResponse.json({ procurement })
      }
    } catch (dbErr) {
      console.warn('[api/procurements/[id]] DB query failed, trying memory store:', dbErr)
    }

    const memoryProc = getProcurementMemory(id)
    if (memoryProc) {
      return NextResponse.json({ procurement: memoryProc })
    }

    return NextResponse.json({ error: 'Procurement not found' }, { status: 404 })
  } catch (err: any) {
    console.error('[api/procurements/[id]] GET error:', err)
    const { id } = await params
    const memoryProc = getProcurementMemory(id)
    if (memoryProc) return NextResponse.json({ procurement: memoryProc })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { name, budget, priorityMode, status, notes } = body

    try {
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

      updateProcurementMemory(id, updated as any)
      return NextResponse.json({ success: true, procurement: updated })
    } catch (dbErr) {
      console.warn('[api/procurements/[id]] DB update failed, updating memory store:', dbErr)
    }

    const memoryUpdated = updateProcurementMemory(id, {
      ...(name ? { name } : {}),
      ...(budget !== undefined ? { budget: budget ? parseFloat(String(budget)) : null } : {}),
      ...(priorityMode ? { priorityMode } : {}),
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    })

    return NextResponse.json({ success: true, procurement: memoryUpdated })
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
    try {
      await prisma.procurement.delete({
        where: { id },
      })
    } catch (dbErr) {
      console.warn('[api/procurements/[id]] DB delete failed, removing from memory store:', dbErr)
    }

    deleteProcurementMemory(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/procurements/[id]] DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
