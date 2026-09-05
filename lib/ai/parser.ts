/**
 * ProcureAI — AI Parser
 *
 * Calls NVIDIA NIM (OpenAI-compatible) endpoint to parse freeform
 * product-list text into structured ProductQuery items.
 * Includes a robust heuristic regex fallback when AI is unavailable or offline.
 */

import OpenAI from 'openai'
import type { ProductQuery, ParsedProductList } from '@/types'

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'dummy-build-key',
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
})

const MODEL = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k3'

const SYSTEM_PROMPT = `You are a procurement assistant that extracts structured product items from freeform text.
Return ONLY a valid JSON object:
{
  "items": [
    {
      "name": "Full product title/description",
      "brand": "Brand if mentioned (or null)",
      "model": "Model if mentioned (or null)",
      "quantity": 1,
      "currency": "MXN",
      "specifications": "Extra technical specs if mentioned"
    }
  ]
}

Rules:
- Quantity defaults to 1 if not specified.
- Support formats like "50 x laptops", "100 Dell P2422H", "200 sillas ergonómicas".
- Default currency is "MXN" unless stated otherwise.
- Never invent specs or brands that are not in the text.
- Return ONLY JSON.`

export function heuristicParse(text: string): ProductQuery[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  const items: ProductQuery[] = []

  const isHeaderLine = (line: string): boolean => {
    const l = line.toLowerCase()
    return (
      (l.includes('producto') || l.includes('artículo') || l.includes('item')) &&
      (l.includes('cantidad') || l.includes('marca') || l.includes('modelo') || l.includes('specs') || l.includes('especificaciones'))
    )
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    if (isHeaderLine(line) || /^[-|\s:]+$/.test(line)) {
      continue // Skip header or divider line
    }

    // Check delimiter: pipe (|), tab (\t), or semicolon (;)
    let delimiter: string | null = null
    if (line.includes('|')) delimiter = '|'
    else if (line.includes('\t')) delimiter = '\t'
    else if (line.includes(';') && (line.match(/;/g)?.length || 0) >= 2) delimiter = ';'

    if (delimiter) {
      const cols = line
        .split(delimiter)
        .map((c) => c.trim())
        .filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''))

      if (cols.length >= 2) {
        let name = cols[0] || 'Producto'
        let brand: string | undefined
        let model: string | undefined
        let quantity = 1
        let specifications: string | undefined

        const cleanVal = (val?: string) => {
          if (!val) return undefined
          const v = val.trim()
          if (v === '—' || v === '-' || v === 'N/A' || v === 'n/a' || v === 'null' || v === 'none' || v === '') {
            return undefined
          }
          return v
        }

        if (cols.length >= 5) {
          // Format: Producto | Marca | Modelo / SKU | Cantidad | Especificaciones
          name = cols[0]
          brand = cleanVal(cols[1])
          model = cleanVal(cols[2])
          const parsedQty = parseInt(cols[3].replace(/[^\d]/g, ''), 10)
          if (!isNaN(parsedQty) && parsedQty > 0) quantity = parsedQty
          specifications = cleanVal(cols[4])
        } else if (cols.length === 4) {
          name = cols[0]
          brand = cleanVal(cols[1])
          const possibleQty = parseInt(cols[3].replace(/[^\d]/g, ''), 10)
          const possibleQtyCol2 = parseInt(cols[2].replace(/[^\d]/g, ''), 10)
          if (!isNaN(possibleQty) && possibleQty > 0) {
            model = cleanVal(cols[2])
            quantity = possibleQty
          } else if (!isNaN(possibleQtyCol2) && possibleQtyCol2 > 0) {
            quantity = possibleQtyCol2
            specifications = cleanVal(cols[3])
          } else {
            model = cleanVal(cols[2])
            specifications = cleanVal(cols[3])
          }
        } else if (cols.length === 3) {
          name = cols[0]
          const possibleQty = parseInt(cols[1].replace(/[^\d]/g, ''), 10)
          if (!isNaN(possibleQty) && possibleQty > 0) {
            quantity = possibleQty
            specifications = cleanVal(cols[2])
          } else {
            brand = cleanVal(cols[1])
            const qty2 = parseInt(cols[2].replace(/[^\d]/g, ''), 10)
            if (!isNaN(qty2) && qty2 > 0) quantity = qty2
            else specifications = cleanVal(cols[2])
          }
        } else if (cols.length === 2) {
          name = cols[0]
          const possibleQty = parseInt(cols[1].replace(/[^\d]/g, ''), 10)
          if (!isNaN(possibleQty) && possibleQty > 0) quantity = possibleQty
          else specifications = cleanVal(cols[1])
        }

        let fullTitle = name
        if (brand && !fullTitle.toLowerCase().includes(brand.toLowerCase())) {
          fullTitle = `${fullTitle} ${brand}`
        }
        if (model && !fullTitle.toLowerCase().includes(model.toLowerCase())) {
          fullTitle = `${fullTitle} ${model}`
        }

        items.push({
          id: `item-${Date.now()}-${idx}`,
          name: fullTitle.trim(),
          brand,
          model,
          quantity,
          currency: 'MXN',
          specifications,
        })
        continue
      }
    }

    // Natural language fallback
    let qty = 1
    let rest = line

    const matchQty = line.match(/^(\d+)\s*(?:x|\*|unidades de|piezas de)?\s*(.*)$/i)
    if (matchQty && matchQty[1] && matchQty[2]) {
      qty = parseInt(matchQty[1], 10)
      rest = matchQty[2].trim()
    }

    const brands = [
      'Lenovo', 'Dell', 'HP', 'Logitech', 'Apple', 'Asus', 'Acer',
      'Samsung', 'LG', 'Herman Miller', 'Steelcase', 'Sony', 'TP-Link',
      'Microsoft', 'APC', 'Cisco', 'Ubiquiti', 'Epson', 'Canon'
    ]
    let foundBrand: string | undefined
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(rest)) {
        foundBrand = b
        break
      }
    }

    items.push({
      id: `item-${Date.now()}-${idx}`,
      name: rest,
      brand: foundBrand,
      quantity: qty,
      currency: 'MXN',
      specifications: undefined,
    })
  }

  return items
}

export async function parseProductList(text: string): Promise<ParsedProductList> {
  if (!text?.trim()) {
    return { items: [], rawInput: text }
  }

  const rawInput = text.trim()
  const fallbackItems = heuristicParse(rawInput)

  if (!process.env.NVIDIA_API_KEY) {
    return { items: fallbackItems, rawInput }
  }

  try {
    // Race Kimi-k3 with a 1500ms timeout for ultra-fast instant UI responsiveness
    const aiPromise = client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawInput },
      ],
      temperature: 0.1,
      max_tokens: 800,
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI parsing timeout')), 1600)
    )

    const completion = await Promise.race([aiPromise, timeoutPromise])

    const rawContent = completion.choices[0]?.message?.content ?? ''
    const cleaned = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    if (Array.isArray(parsed.items) && parsed.items.length > 0) {
      const items: ProductQuery[] = parsed.items.map((item: any, idx: number) => ({
        id: `item-${Date.now()}-${idx}`,
        name: item.name ?? 'Producto sin nombre',
        brand: item.brand ?? undefined,
        model: item.model ?? undefined,
        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        currency: item.currency ?? 'MXN',
        specifications: item.specifications ?? undefined,
      }))
      return { items, rawInput }
    }

    return { items: fallbackItems, rawInput }
  } catch (err) {
    console.warn('[AI Parser] Fast fallback to heuristic parser:', err)
    return { items: fallbackItems, rawInput }
  }
}
