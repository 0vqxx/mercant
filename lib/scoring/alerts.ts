import { type AlertResult, AlertType, AlertSeverity } from '@/types'

interface AlertInput {
  unitPrice: number
  medianPrice: number
  trustScore: number
  trustCategory: string
  reviewCount: number | null
  rating: number | null
  sourceUrl: string
  shippingCost: number | null
  availability: string
  matchScore: number
  supplierDomain: string
  isDemo?: boolean
}

export function generateAlerts(input: AlertInput): AlertResult[] {
  const {
    unitPrice,
    medianPrice,
    trustScore,
    reviewCount,
    rating,
    shippingCost,
    availability,
    matchScore,
    isDemo = false,
  } = input

  const alerts: AlertResult[] = []

  // 1. SUSPICIOUS_PRICE (DANGER)
  if (medianPrice > 0 && unitPrice > 0) {
    const pctBelow = ((medianPrice - unitPrice) / medianPrice) * 100
    if (pctBelow >= 40) {
      alerts.push({
        type: AlertType.SUSPICIOUS_PRICE,
        severity: AlertSeverity.DANGER,
        message: `Precio inusualmente bajo (${Math.round(pctBelow)}% debajo de la mediana)`,
        detail: `Esta oferta cuesta aproximadamente ${Math.round(pctBelow)}% menos que el promedio encontrado. Verifica disponibilidad, condiciones y vendedor antes de comprar.`,
        isDemo,
      })
    }
  }

  // 2. LOW_TRUST (WARNING)
  if (trustScore < 40) {
    alerts.push({
      type: AlertType.LOW_TRUST,
      severity: AlertSeverity.WARNING,
      message: 'Proveedor con reputación limitada o información insuficiente',
      detail: 'Este proveedor tiene información limitada disponible. No fue posible verificar historial o garantías suficientes.',
      isDemo,
    })
  }

  // 3. SUSPICIOUS_REVIEWS (WARNING)
  if (rating != null && reviewCount != null && rating < 3.0 && reviewCount > 5) {
    alerts.push({
      type: AlertType.SUSPICIOUS_REVIEWS,
      severity: AlertSeverity.WARNING,
      message: `Calificaciones bajas del vendedor (${rating.toFixed(1)}★)`,
      detail: `El vendedor tiene una calificación promedio de ${rating.toFixed(1)}★ con ${reviewCount} opiniones registradas.`,
      isDemo,
    })
  }

  // 4. OUT_OF_STOCK (WARNING)
  if (availability.toUpperCase() === 'OUT_OF_STOCK') {
    alerts.push({
      type: AlertType.OUT_OF_STOCK,
      severity: AlertSeverity.WARNING,
      message: 'Producto reportado como agotado',
      detail: 'El proveedor indica que este producto no cuenta con unidades disponibles actualmente.',
      isDemo,
    })
  }

  // 5. PRODUCT_MISMATCH (WARNING)
  if (matchScore < 0.6) {
    alerts.push({
      type: AlertType.PRODUCT_MISMATCH,
      severity: AlertSeverity.WARNING,
      message: 'Posible discrepancia con el producto solicitado',
      detail: 'Este resultado podría no coincidir de manera exacta con el modelo o especificaciones solicitadas. Confirma los detalles técnicos.',
      isDemo,
    })
  }

  // 6. HIDDEN_SHIPPING (INFO)
  if (shippingCost === null) {
    alerts.push({
      type: AlertType.HIDDEN_SHIPPING,
      severity: AlertSeverity.INFO,
      message: 'Costo de envío no especificado',
      detail: 'El costo de envío no está disponible en la oferta observada. Verifica los cargos de flete antes de concretar la orden.',
      isDemo,
    })
  }

  // 7. INSUFFICIENT_INFO (INFO)
  if (trustScore < 25) {
    alerts.push({
      type: AlertType.INSUFFICIENT_INFO,
      severity: AlertSeverity.INFO,
      message: 'Información pública insuficiente para dictamen seguro',
      detail: 'No hay suficientes datos públicos verificables sobre este vendedor en los registros consultados.',
      isDemo,
    })
  }

  return alerts
}
