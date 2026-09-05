/**
 * ProcureAI — NVIDIA NIM AI Client
 *
 * Thin wrapper around the OpenAI-compatible NVIDIA NIM API.
 * Provides typed helpers for text completion and structured JSON extraction,
 * with automatic retry logic and proper error surfaces.
 *
 * Environment variables:
 *   NVIDIA_API_KEY   — required, your NIM API key
 *   NVIDIA_BASE_URL  — optional, defaults to https://integrate.api.nvidia.com/v1
 *   NVIDIA_MODEL     — optional, defaults to moonshotai/kimi-k3
 */

import OpenAI from 'openai'
import { sleep } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'dummy-key-for-build-time',
  baseURL:
    process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
})

const MODEL = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k3'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompletionOptions {
  /** Maximum tokens to generate (default: 2048) */
  maxTokens?: number
  /** Sampling temperature 0–2 (default: 0.2 for deterministic JSON tasks) */
  temperature?: number
  /** Maximum number of automatic retries on transient errors (default: 2) */
  maxRetries?: number
}

/** Raw chat message for building multi-turn prompts */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Internal retry config
const DEFAULT_MAX_RETRIES = 2
const RETRY_DELAY_BASE_MS = 1000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine whether an error is transient (worth retrying).
 */
function isRetryable(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    // 429 Too Many Requests, 500/502/503/504 server errors
    return err.status === 429 || (err.status >= 500 && err.status < 600)
  }
  // Network-level errors (ECONNRESET, etc.)
  if (err instanceof Error) {
    return (
      err.message.includes('ECONNRESET') ||
      err.message.includes('ETIMEDOUT') ||
      err.message.includes('fetch failed')
    )
  }
  return false
}

/**
 * Exponential back-off with jitter: base * 2^attempt ± random jitter.
 */
function backoffMs(attempt: number): number {
  const base = RETRY_DELAY_BASE_MS * Math.pow(2, attempt)
  const jitter = Math.random() * 500
  return base + jitter
}

// ---------------------------------------------------------------------------
// Core completion with retry
// ---------------------------------------------------------------------------

/**
 * Execute a chat completion with automatic retry on transient errors.
 *
 * @internal — Prefer `completion()` or `completionJSON()` over calling this directly.
 */
async function chatWithRetry(
  messages: ChatMessage[],
  options: CompletionOptions = {},
): Promise<string> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const temperature = options.temperature ?? 0.2
  const maxTokens = options.maxTokens ?? 2048

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens,
      })

      const content = response.choices[0]?.message?.content
      if (content == null) {
        throw new Error('AI returned an empty response (no content field)')
      }

      return content
    } catch (err) {
      lastError = err

      if (attempt < maxRetries && isRetryable(err)) {
        const delay = backoffMs(attempt)
        console.warn(
          `[ai/client] Transient error on attempt ${attempt + 1}/${maxRetries + 1}. ` +
            `Retrying in ${Math.round(delay)}ms…`,
          err instanceof Error ? err.message : err,
        )
        await sleep(delay)
        continue
      }

      // Non-retryable or exhausted retries — surface a clean error
      if (err instanceof OpenAI.APIError) {
        throw new Error(
          `AI API error ${err.status} (${err.code ?? 'unknown'}): ${err.message}`,
        )
      }
      throw err
    }
  }

  // Should never reach here, but TypeScript needs an explicit throw
  throw lastError
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a plain-text completion from the AI model.
 *
 * @param systemPrompt - Instruction for the model's behaviour
 * @param userPrompt   - The user's request / data to process
 * @param options      - Optional completion settings
 * @returns Raw string response from the model
 */
export async function completion(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {},
): Promise<string> {
  return chatWithRetry(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options,
  )
}

/**
 * Get a structured JSON completion from the AI model.
 *
 * The model is instructed to return only valid JSON. The response is stripped
 * of any markdown fences before parsing.
 *
 * @param systemPrompt - Instruction for the model's behaviour (should include JSON schema)
 * @param userPrompt   - The user's request / data to process
 * @param options      - Optional completion settings
 * @returns Parsed JSON value (type T)
 * @throws {SyntaxError} If the model returns unparseable JSON after retries
 */
export async function completionJSON<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {},
): Promise<T> {
  // Reinforce JSON-only output in the system prompt
  const jsonSystemPrompt =
    systemPrompt.trimEnd() +
    '\n\nIMPORTANT: Respond with ONLY valid JSON — no markdown, no code fences, no explanation.'

  const raw = await chatWithRetry(
    [
      { role: 'system', content: jsonSystemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { ...options, temperature: options.temperature ?? 0.1 },
  )

  // Strip ```json … ``` or ``` … ``` fences the model may add anyway
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch (parseErr) {
    throw new Error(
      `AI returned invalid JSON. Parse error: ${(parseErr as Error).message}\n` +
        `Raw response (first 500 chars): ${cleaned.slice(0, 500)}`,
    )
  }
}

/**
 * Multi-turn chat completion — use when you need conversation history.
 *
 * @param messages - Array of chat messages (system + user + assistant turns)
 * @param options  - Optional completion settings
 */
export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {},
): Promise<string> {
  return chatWithRetry(messages, options)
}

/** Expose the underlying OpenAI client for advanced use cases. */
export { client as nimClient, MODEL as nimModel }
