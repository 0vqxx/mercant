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

function heuristicParse(text: string): ProductQuery[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  return lines.map((line, idx) => {
    // Check patterns like: "100 x Dell P2422H", "50 laptops", "200x sillas"
    let qty = 1
    let rest = line

    const matchQty = line.match(/^(\d+)\s*(?:x|\*|unidades de|piezas de)?\s*(.*)$/i)
    if (matchQty && matchQty[1] && matchQty[2]) {
      qty = parseInt(matchQty[1], 10)
      rest = matchQty[2].trim()
    }

    // Detect common brands
    const brands = ['Lenovo', 'Dell', 'HP', 'Logitech', 'Apple', 'Asus', 'Acer', 'Samsung', 'LG', 'Herman Miller', 'Steelcase', 'Sony']
    let foundBrand: string | undefined
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(rest)) {
        foundBrand = b
        break
      }
    }

    return {
      id: `item-${Date.now()}-${idx}`,
      name: rest,
      brand: foundBrand,
      quantity: qty,
      currency: 'MXN',
      specifications: undefined,
    }
  })
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
