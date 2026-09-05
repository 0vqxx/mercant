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

const SYSTEM_PROMPT = `You are an expert procurement and tender assistant (Licitaciones y Compras Gubernamentales/Corporativas).
Your goal is to parse procurement requests, product lists, tenders (licitaciones), RFPs, or technical annexes into structured items.

Return ONLY a valid JSON object matching this schema:
{
  "suggestedName": "Short descriptive procurement title (e.g., 'Licitación Equipamiento de Cómputo Q3')",
  "suggestedBudget": 150000, // numerical amount if mentioned in document or null
  "items": [
    {
      "name": "Full descriptive product title",
      "brand": "Brand if mentioned (e.g., 'Dell', 'Lenovo', 'Cisco') or null",
      "model": "Model / SKU / Part number if mentioned or null",
      "quantity": 1,
      "currency": "MXN",
      "specifications": "Technical specs, dimensions, processors, RAM, warranty, etc."
    }
  ]
}

Rules:
- Extract all requested items, equipment, software licenses, materials, or services.
- Quantity defaults to 1 if not explicitly specified.
- If quantity is specified (e.g. '50 pzas', '10 unidades', '2 lotes'), parse as positive integer.
- Default currency is 'MXN' unless USD/EUR is explicitly stated.
- Never invent brands or specifications that are not present in the text.
- Return ONLY the JSON object, no markdown wrappers, no explanations.`

export function heuristicParse(text: string): { items: ProductQuery[]; suggestedName?: string; suggestedBudget?: number | null } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  const items: ProductQuery[] = []
  let suggestedName: string | undefined
  let suggestedBudget: number | null = null

  // Check for tender title or budget in initial lines
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i]
    if (/licitaci[oó]n|concurso|requerimiento|adquisici[oó]n|compra/i.test(l) && !suggestedName) {
      suggestedName = l.replace(/^[-*•#\s]+/, '').slice(0, 80)
    }
    const budgetMatch = l.match(/(?:presupuesto|monto|techo|estimado|valor)\s*(?:m[aá]ximo|total)?:?\s*\$?\s*([\d,]+(?:\.\d+)?)/i)
    if (budgetMatch && budgetMatch[1] && !suggestedBudget) {
      const num = parseFloat(budgetMatch[1].replace(/,/g, ''))
      if (!isNaN(num) && num > 0) suggestedBudget = num
    }
  }

  const isHeaderLine = (line: string): boolean => {
    const l = line.toLowerCase()
    return (
      (l.includes('producto') || l.includes('artículo') || l.includes('item') || l.includes('descripción')) &&
      (l.includes('cantidad') || l.includes('marca') || l.includes('modelo') || l.includes('specs') || l.includes('especificaciones'))
    )
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    if (isHeaderLine(line) || /^[-|\s:=_]+$/.test(line) || /^--- Página \d+ ---$/.test(line)) {
      continue // Skip header, page markers, or divider lines
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

    // Natural language / numbered lists fallback (e.g., "1. 50 computadoras Dell...")
    let qty = 1
    let rest = line.replace(/^\d+[\.\)\-]\s*/, '') // Remove bullet/numbering

    const matchQty = rest.match(/^(\d+)\s*(?:x|\*|unidades(?: de)?|piezas(?: de)?|equipos(?: de)?|pzas\.?)?\s*(.*)$/i)
    if (matchQty && matchQty[1] && matchQty[2]) {
      qty = parseInt(matchQty[1], 10)
      rest = matchQty[2].trim()
    }

    // Skip short non-product filler sentences
    if (rest.length < 3 || /^(anexo|página|sección|requisito|nota)/i.test(rest)) {
      continue
    }

    const brands = [
      'Lenovo', 'Dell', 'HP', 'Logitech', 'Apple', 'Asus', 'Acer',
      'Samsung', 'LG', 'Herman Miller', 'Steelcase', 'Sony', 'TP-Link',
      'Microsoft', 'APC', 'Cisco', 'Ubiquiti', 'Epson', 'Canon', 'Fortinet'
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

  return { items, suggestedName, suggestedBudget }
}

export async function parseProductList(text: string): Promise<ParsedProductList> {
  if (!text?.trim()) {
    return { items: [], rawInput: text }
  }

  const rawInput = text.trim()
  const { items: fallbackItems, suggestedName, suggestedBudget } = heuristicParse(rawInput)

  if (!process.env.NVIDIA_API_KEY) {
    return { items: fallbackItems, suggestedName, suggestedBudget, rawInput }
  }

  try {
    const isLongDocument = rawInput.length > 500
    const timeoutMs = isLongDocument ? 4500 : 2000

    const aiPromise = client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawInput.slice(0, 12000) },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI parsing timeout')), timeoutMs)
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

      return {
        items,
        suggestedName: parsed.suggestedName || suggestedName,
        suggestedBudget: parsed.suggestedBudget ?? suggestedBudget,
        rawInput,
      }
    }

    return { items: fallbackItems, suggestedName, suggestedBudget, rawInput }
  } catch (err) {
    console.warn('[AI Parser] Fast fallback to heuristic parser:', err)
    return { items: fallbackItems, suggestedName, suggestedBudget, rawInput }
  }
}
