import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      phone = '+525584921044',
      eventType = 'quote_ready',
      procurementName = 'Equipamiento 50 Estaciones de Trabajo',
      totalAmount = '$834,600.00 MXN',
      savings = '$165,400.00 MXN (18.4%)',
      link = 'http://localhost:3000/procurements',
    } = body

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    let message = ''
    if (eventType === 'quote_ready') {
      message =
        '⚡ *MERCANT AI — Cotización Optimizada Lista*\n\n' +
        '📦 *Requerimiento:* ' + procurementName + '\n' +
        '💰 *Costo Total Optimizado:* ' + totalAmount + '\n' +
        '📉 *Ahorro Calculado:* ' + savings + '\n' +
        '🛡️ *Trust Score Promedio:* 96/100 (Proveedores Verificados)\n\n' +
        '🔗 *Revisar Cesta y Enlaces Directos:*\n' + link
    } else if (eventType === 'price_drop') {
      message =
        '📉 *MERCANT AI — Alerta de Radar de Precios*\n\n' +
        '🎯 *Producto:* Lenovo ThinkPad E14 Gen 4\n' +
        '🏷️ *Nuevo Precio:* $14,899.00 MXN (Baja del 18.2%)\n' +
        '🏪 *Proveedor:* CyberPuerta MX (Stock 50 u.)\n\n' +
        '🔗 *Comprar antes de que se agote:*\n' + link
    } else {
      message =
        '🔔 *MERCANT AI — Notificación del Sistema*\n\n' +
        'Tu solicitud de cotización fue procesada exitosamente.\n' +
        '🔗 *Acceder a tu panel:* ' + link
    }

    const waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message)

    console.log('\n══════════════════════════════════════════════════════════════')
    console.log('📱 [WHATSAPP DEV NOTIFICATION SIMULATED]')
    console.log('   Para: ' + phone + ' (' + cleanPhone + ')')
    console.log('   Tipo de Evento: ' + eventType)
    console.log('   Mensaje:\n' + message)
    console.log('   Enlace Directo wa.me: ' + waLink)
    console.log('══════════════════════════════════════════════════════════════\n')

    return NextResponse.json({
      success: true,
      mode: 'development',
      message: 'Notificación simulada exitosamente en modo desarrollo',
      phone,
      messageText: message,
      waLink,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling WhatsApp notification:', error)
    return NextResponse.json(
      { error: 'No se pudo procesar la notificación' },
      { status: 500 }
    )
  }
}