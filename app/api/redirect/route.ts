import { NextRequest, NextResponse } from 'next/server'
import { resolveDirectProductUrl, getCanonicalDirectUrl } from '@/lib/connectors/direct_product_resolver'
import { extractCleanProduct } from '@/lib/connectors/cleanQuery'

// In-memory cache for resolved live product URLs (24h TTL)
const resolvedCache = new Map<string, { url: string; expiresAt: number }>()
const CACHE_TTL = 1000 * 60 * 60 * 24

function getFromCache(key: string): string | null {
  const item = resolvedCache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    resolvedCache.delete(key)
    return null
  }
  return item.url
}

function setCache(key: string, url: string): void {
  resolvedCache.set(key, { url, expiresAt: Date.now() + CACHE_TTL })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const store = (searchParams.get('store') || 'amazon').toLowerCase()
  const name = searchParams.get('name') || ''
  const brand = searchParams.get('brand') || ''
  const model = searchParams.get('model') || ''
  const fallbackUrl = searchParams.get('fallback') || ''

  const { cleanQuery, brand: cleanBrand, model: cleanModel } = extractCleanProduct(name, brand, model)
  const cacheKey = `${store}:${cleanQuery.toLowerCase()}`

  // Check in-memory cache first
  const cachedUrl = getFromCache(cacheKey)
  if (cachedUrl) {
    return NextResponse.redirect(cachedUrl, 302)
  }

  // 1. Check curated canonical direct product database
  const canonicalUrl = getCanonicalDirectUrl(store, cleanQuery, cleanBrand, cleanModel)
  if (canonicalUrl) {
    setCache(cacheKey, canonicalUrl)
    return NextResponse.redirect(canonicalUrl, 302)
  }

  // 2. Resolve Amazon direct product page (/dp/{ASIN}?ref=mercant)
  if (store.includes('amazon')) {
    try {
      const amazonSearchUrl = `https://www.amazon.com.mx/s?k=${encodeURIComponent(cleanQuery)}`
      const res = await fetch(amazonSearchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(3500),
      })

      if (res.ok) {
        const html = await res.text()
        const asins = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1])
        const cleanAsins = [...new Set(asins.filter((a) => a && a.length === 10))]

        if (cleanAsins.length > 0) {
          const directAmazonUrl = `https://www.amazon.com.mx/dp/${cleanAsins[0]}?ref=mercant`
          setCache(cacheKey, directAmazonUrl)
          return NextResponse.redirect(directAmazonUrl, 302)
        }
      }
    } catch (e) {
      console.warn('[redirect] Amazon direct ASIN resolution error:', e)
    }

    // Fallback for Amazon: brand-isolated and relevance-sorted direct landing
    const encodedQ = encodeURIComponent(cleanQuery)
    const fallbackAmazon = cleanBrand
      ? `https://www.amazon.com.mx/s?k=${encodedQ}&rh=p_89%3A${encodeURIComponent(cleanBrand)}&s=exact-aware-popularity-rank&ref=mercant`
      : `https://www.amazon.com.mx/s?k=${encodedQ}&s=exact-aware-popularity-rank&ref=mercant`
    return NextResponse.redirect(fallbackAmazon, 302)
  }

  // 3. Resolve MercadoLibre direct product page (/p/MLM... or /MLM-... with ref=mercant)
  if (store.includes('mercadolibre')) {
    try {
      const slug = cleanQuery.replace(/\s+/g, '-')
      const mlListadoUrl = `https://listado.mercadolibre.com.mx/${encodeURIComponent(slug)}`
      const res = await fetch(mlListadoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept-Language': 'es-MX,es;q=0.9',
        },
        signal: AbortSignal.timeout(3500),
      })

      if (res.ok) {
        const html = await res.text()
        const match =
          html.match(/https:\/\/(?:www|articulo)\.mercadolibre\.com\.mx\/[^"'\s<>&?#]*\/p\/MLM[0-9]+/) ||
          html.match(/https:\/\/articulo\.mercadolibre\.com\.mx\/MLM-[0-9]+-[^"'\s<>&?#]+/)

        if (match && match[0]) {
          const directMlUrl = `${match[0]}?ref=mercant`
          setCache(cacheKey, directMlUrl)
          return NextResponse.redirect(directMlUrl, 302)
        }
      }
    } catch (e) {
      console.warn('[redirect] MercadoLibre direct product resolution error:', e)
    }

    // Fallback for MercadoLibre
    const fallbackMl = `https://listado.mercadolibre.com.mx/${encodeURIComponent(cleanQuery.replace(/\s+/g, '-'))}?ref=mercant`
    return NextResponse.redirect(fallbackMl, 302)
  }

  // 4. Resolve direct store URL for Dell, Lenovo, HP, Truper, HomeDepot, etc.
  const resolved = resolveDirectProductUrl(store, cleanQuery, cleanBrand, cleanModel, false)
  if (resolved && !resolved.startsWith('/api/redirect')) {
    setCache(cacheKey, resolved)
    return NextResponse.redirect(resolved, 302)
  }

  if (fallbackUrl) {
    const directFallback = `${fallbackUrl}${fallbackUrl.includes('?') ? '&' : '?'}ref=mercant`
    return NextResponse.redirect(directFallback, 302)
  }

  return NextResponse.redirect(
    `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&ref=mercant`,
    302,
  )
}
