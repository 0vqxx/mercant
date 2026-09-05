/**
 * ProcureAI — Product Normalizer
 *
 * Checks whether two offer titles or an offer title and a query correspond
 * to the exact same product and computes a matching score (0 to 1).
 */

export function normalizeProductTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function computeProductMatchScore(
  query: { name: string; brand?: string; model?: string },
  offerTitle: string,
): number {
  const normOffer = normalizeProductTitle(offerTitle)
  const tokens: string[] = []

  if (query.brand) tokens.push(...normalizeProductTitle(query.brand).split(' '))
  if (query.model) tokens.push(...normalizeProductTitle(query.model).split(' '))
  tokens.push(...normalizeProductTitle(query.name).split(' '))

  const uniqueTokens = Array.from(new Set(tokens.filter((t) => t.length > 2)))
  if (uniqueTokens.length === 0) return 0.8

  let matched = 0
  for (const token of uniqueTokens) {
    if (normOffer.includes(token)) {
      matched++
    }
  }

  const score = matched / uniqueTokens.length
  return Math.min(1, Math.max(0.2, score))
}
