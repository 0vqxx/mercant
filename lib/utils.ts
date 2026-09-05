/**
 * ProcureAI — Shared Utility Functions
 *
 * Pure helpers used across server and client code.
 * All functions are tree-shakeable — import only what you need.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'

// ---------------------------------------------------------------------------
// Tailwind class merge
// ---------------------------------------------------------------------------

/**
 * Merge Tailwind CSS class names with conflict resolution.
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4')
 * // → 'py-1 bg-blue-500 px-4'  (px-4 wins over px-2)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as a localised currency string.
 *
 * @param amount  - Numeric amount
 * @param currency - ISO 4217 code, e.g. "MXN", "USD"
 * @param locale  - BCP 47 locale tag (default: "es-MX")
 * @returns Formatted string, e.g. "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'MXN',
  locale: string = 'es-MX',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Format a Date as a human-readable absolute date string.
 * - Today     → "Hoy, 14:35"
 * - Yesterday → "Ayer, 14:35"
 * - Otherwise → "12 sep 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) {
    return `Hoy, ${format(d, 'HH:mm')}`
  }
  if (isYesterday(d)) {
    return `Ayer, ${format(d, 'HH:mm')}`
  }
  return format(d, 'd MMM yyyy', { locale: es })
}

/**
 * Format a Date as a relative time string ("hace 2 horas").
 *
 * @param date   - Date to compare against now
 * @param locale - 'es' for Spanish (default), 'en' for English
 */
export function formatTimeAgo(
  date: Date | string,
  locale: 'es' | 'en' = 'es',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: locale === 'es' ? es : undefined,
  })
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Extract the bare domain from a URL string.
 *
 * @example
 * getDomainFromUrl('https://www.mercadolibre.com.mx/item/123')
 * // → 'mercadolibre.com.mx'
 */
export function getDomainFromUrl(url: string): string {
  try {
    const { hostname } = new URL(url)
    // Strip leading "www." for cleaner display
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the median of an array of numbers.
 * Returns 0 for empty arrays.
 */
export function getMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
}

/**
 * Calculate how much `price` deviates from the median of `prices`.
 *
 * @returns Percentage deviation — positive means above median, negative below.
 * @example
 * calculatePriceDeviation(150, [100, 120, 150, 200])
 * // → 13.2  (13.2% above the median of 132.5 … approx)
 */
export function calculatePriceDeviation(
  price: number,
  prices: number[],
): number {
  if (prices.length === 0) return 0
  const median = getMedian(prices)
  if (median === 0) return 0
  return ((price - median) / median) * 100
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Convert a string to a URL-safe slug.
 *
 * @example
 * slugify('Dell XPS 13 (2024) — Laptop')
 * // → 'dell-xps-13-2024-laptop'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // keep only alphanumeric, spaces, hyphens
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to hyphen
    .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
}

/**
 * Truncate a string to `maxLength` characters, appending "…" if cut.
 *
 * @param text      - Source string
 * @param maxLength - Maximum length including the ellipsis (default: 80)
 */
export function truncate(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

// ---------------------------------------------------------------------------
// Async helpers
// ---------------------------------------------------------------------------

/**
 * Promise-based sleep — useful for rate-limiting, retry back-off, etc.
 *
 * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/**
 * Clamp a number between `min` and `max`.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Round a number to a specified number of decimal places.
 */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Return a value's percentage of a total, clamped 0–100.
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return clamp((value / total) * 100, 0, 100)
}
