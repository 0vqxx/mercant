/**
 * ProcureAI — High-Precision Product Query Cleaner
 *
 * Strips RFP and tender filler (e.g. "Computadora de escritorio", "Licencia de sistema operativo",
 * "Suite ofimática", "Equipo de", "Adquisición de", "Suministro de") and extracts the high-signal
 * brand, model, and search query for direct e-commerce product resolution.
 */

const KNOWN_BRANDS = [
  // IT & Tech
  'dell', 'hp', 'lenovo', 'apple', 'cisco', 'tp-link', 'tplink', 'apc', 'asus', 'acer',
  'kingston', 'samsung', 'lg', 'logitech', 'microsoft', 'intel', 'amd', 'fortinet',
  'ubiquiti', 'epson', 'canon', 'brother', 'zebra', 'honeywell', 'tripp lite', 'cyberpower',
  'sony', 'viewsonic', 'benq', 'adata', 'corsair', 'seagate', 'western digital', 'wd',
  // Mobiliario & Ergonomía
  'herman miller', 'steelcase', 'requiez', 'pm steele', 'haworth', 'ikea', 'offiho', 'gebesa',
  // Ferretería & Herramientas
  'truper', 'dewalt', 'bosch', 'makita', 'milwaukee', 'stanley', 'urrea', 'pretul', 'surtek',
  'dremel', 'comex', 'berel', 'sika', 'rotoplas', 'helvex', 'baco',
  // Seguridad & EPP
  '3m', 'berrendo', 'cruces', 'lica', 'derma care', 'msa', 'ansell', 'uvex', 'riverline',
  // Médico & Clínico
  'omron', 'welch allyn', 'littmann', 'bd', 'contec', 'mindray', 'roche', 'nipro',
  // Limpieza
  'kimberly-clark', 'kimberly clark', 'scott', 'kleenex', 'clorox', 'lysol', 'windex',
  'fabuloso', 'ariel', 'roma', 'foca', 'harpic', 'sanirent',
  // Electricidad
  'schneider electric', 'schneider', 'square d', 'condumex', 'iusa', 'bticino', 'leviton',
  'philips', 'osram', 'sylvania', 'volteck',
  // Clima
  'carrier', 'trane', 'york', 'mirage', 'midea', 'daikin',
  // Papelería
  'scribe', 'xerox', 'navigator', 'facia bond', 'bic', 'paper mate', 'pilot', 'sharpie',
]

const NOISE_PHRASES = [
  /\bcomputadora de escritorio\b/gi,
  /\bcomputadora portatil\b/gi,
  /\bcomputadora portátil\b/gi,
  /\blaptop de oficina\b/gi,
  /\bequipo de computo\b/gi,
  /\bequipo de cómputo\b/gi,
  /\blicencia de sistema operativo\b/gi,
  /\blicencia por equipo\b/gi,
  /\blicencia oem\b/gi,
  /\bsuite ofimatica\b/gi,
  /\bsuite ofimática\b/gi,
  /\bpaqueteria de oficina\b/gi,
  /\bpaquetería de oficina\b/gi,
  /\badquisicion de\b/gi,
  /\badquisición de\b/gi,
  /\bsuministro de\b/gi,
  /\bcompra de\b/gi,
  /\bservicio de\b/gi,
  /\bpaquete de\b/gi,
  /\bpieza[s]? de\b/gi,
  /\bunidad[es]? de\b/gi,
  /\bcon cable\b/gi,
  /\balambrico\b/gi,
  /\balámbrico\b/gi,
  /\bcolor negro\b/gi,
  /\bdistribucion espanol\b/gi,
  /\bdistribución español\b/gi,
  /\bespanol\b/gi,
  /\bespañol\b/gi,
  /\binstalacion y configuracion\b/gi,
  /\binstalación y configuración\b/gi,
  /\bconfiguracion de equipos\b/gi,
  /\bconfiguración de equipos\b/gi,
  /\bpara 50 equipos\b/gi,
  /\bmarca\b/gi,
  /\bmodelo\b/gi,
]

export interface CleanedProduct {
  brand: string
  model: string
  cleanQuery: string
}

export function extractCleanProduct(
  name: string,
  rawBrand?: string,
  rawModel?: string,
): CleanedProduct {
  let text = `${name || ''}`.trim()

  // 1. Inferred or clean brand
  let brand = (rawBrand || '').trim()
  if (!brand) {
    const lower = text.toLowerCase()
    for (const b of KNOWN_BRANDS) {
      if (lower.includes(b)) {
        brand = b.charAt(0).toUpperCase() + b.slice(1)
        break
      }
    }
  }

  // 2. Clean model
  let model = (rawModel || '').trim()

  // Remove noise phrases
  let cleaned = text
  for (const rx of NOISE_PHRASES) {
    cleaned = cleaned.replace(rx, ' ')
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // If model is "—" or empty, try extracting from cleaned text
  if (!model || model === '—' || model === '-') {
    const tokens = cleaned.split(' ')
    // Find alphanumeric model-like tokens (e.g., KB216, MS116, 7020, P2425H, BVX900, T150, ER7206)
    const modelCandidates = tokens.filter((t) => /^[A-Za-z0-9\-_]{3,}$/.test(t) && /\d/.test(t))
    if (modelCandidates.length > 0) {
      model = modelCandidates.join(' ')
    }
  }

  // Deduplicate words between brand, model and cleaned
  const allWords: string[] = []
  if (brand) allWords.push(...brand.split(/\s+/))
  if (model) allWords.push(...model.split(/\s+/))
  if (allWords.length === 0) allWords.push(...cleaned.split(/\s+/))

  const uniqueWords: string[] = []
  for (const w of allWords) {
    const low = w.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (low && !uniqueWords.some((u) => u.toLowerCase().replace(/[^a-z0-9]/g, '') === low)) {
      uniqueWords.push(w)
    }
  }

  let cleanQuery = uniqueWords.join(' ').trim()
  if (!cleanQuery) {
    cleanQuery = cleaned.trim() || name.trim()
  }

  return {
    brand,
    model,
    cleanQuery,
  }
}
