// Vercel serverless function (Node runtime) for Hero Lab generation.
//
// - POST only. Body -> GenerateRequest. Validates a non-empty, length-capped
//   description and an optional preset within the allowed set.
// - Best-effort in-memory per-IP rate limit.
// - No ANTHROPIC_API_KEY -> returns a deterministic mock (so preview deploys and
//   local/no-key runs work). With a key -> calls Claude Haiku, validates the JSON
//   it returns, and falls back to the mock on any failure. The tool never
//   hard-fails on the AI path and never leaks the key or raw errors.

import { PRESETS, isHeroSpec } from '../src/lib/contract'
import type { GenerateRequest, HeroSpec, Preset } from '../src/lib/contract'
import { mockGenerate } from '../src/lib/mockGenerate'

// Minimal Vercel Node handler types (kept local to avoid a @vercel/node dependency).
interface ApiRequest {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}
interface ApiResponse {
  status(code: number): ApiResponse
  json(body: unknown): void
  setHeader(name: string, value: string): void
}

const MAX_DESCRIPTION_LENGTH = 600
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 400
const REQUEST_TIMEOUT_MS = 12_000

// --- Rate limiting -----------------------------------------------------------
// Best-effort, in-memory per-IP token bucket. NOTE: serverless instances are
// ephemeral, so this map resets on every cold start and is not shared across
// concurrent instances. That is acceptable for a portfolio tool; the durable
// upgrade would be Vercel KV (or another shared store) keyed by IP.
const RATE_LIMIT = 8
const RATE_WINDOW_MS = 60_000
const buckets = new Map<string, { count: number; reset: number }>()

function clientIp(req: ApiRequest): string {
  const xff = req.headers['x-forwarded-for']
  const raw = Array.isArray(xff) ? xff[0] : xff
  return raw?.split(',')[0]?.trim() || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || now > bucket.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return false
  }
  if (bucket.count >= RATE_LIMIT) return true
  bucket.count += 1
  return false
}

// --- Request parsing ---------------------------------------------------------
function parseBody(body: unknown): Record<string, unknown> | null {
  if (body == null) return null
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body)
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return null
    }
  }
  if (typeof body === 'object') return body as Record<string, unknown>
  return null
}

// --- Anthropic call ----------------------------------------------------------
const SYSTEM_PROMPT = [
  'You are a senior landing-page copywriter.',
  'Given a product description, write one punchy hero section.',
  'Return ONLY a single JSON object — no prose, no markdown, no code fences — with exactly these keys:',
  '"eyebrow" (optional short label), "headline" (the H1, punchy, max ~9 words),',
  '"subhead" (1-2 sentences), "primaryCta" (e.g. "Get started"),',
  '"secondaryCta" (optional, e.g. "See how it works").',
  'Do not include any other keys. Do not include styling or CSS.',
].join(' ')

function buildUserPrompt(req: GenerateRequest): string {
  const lines = [`Product description: ${req.description}`]
  if (req.preset) lines.push(`Visual preset: ${req.preset}`)
  if (req.tone) lines.push(`Tone: ${req.tone}`)
  if (req.accent) lines.push(`Accent color: ${req.accent}`)
  lines.push('Write the hero section as a single JSON object now.')
  return lines.join('\n')
}

function extractJsonObject(raw: string): unknown {
  const text = raw.trim()
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim().length > 0 ? v : undefined
}

/**
 * Calls Claude Haiku and returns a validated HeroSpec, or null on any failure
 * (non-OK response, malformed/truncated JSON, fails isHeroSpec). The preset and
 * accent are app-controlled: we honor the user's choice, then the model's valid
 * suggestion, then the deterministic mock's pick — copy comes from the model.
 */
async function callClaude(
  apiKey: string,
  req: GenerateRequest,
): Promise<HeroSpec | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let resp: Response
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt(req) },
          // Prefill the assistant turn with "{" to force JSON output.
          { role: 'assistant', content: '{' },
        ],
      }),
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!resp.ok) return null

  const data = (await resp.json()) as {
    content?: Array<{ type?: string; text?: string }>
  }
  const textBlock = data.content?.find((b) => b.type === 'text')
  const text = textBlock?.text ?? ''
  // We prefilled "{", so the model's output continues from there.
  const parsed = extractJsonObject(`{${text}`)
  if (typeof parsed !== 'object' || parsed === null) return null

  const obj = parsed as Record<string, unknown>
  const aiPreset =
    typeof obj.preset === 'string' &&
    (PRESETS as readonly string[]).includes(obj.preset)
      ? (obj.preset as Preset)
      : undefined

  const spec: HeroSpec = {
    headline: typeof obj.headline === 'string' ? obj.headline : '',
    subhead: typeof obj.subhead === 'string' ? obj.subhead : '',
    primaryCta: typeof obj.primaryCta === 'string' ? obj.primaryCta : '',
    preset: req.preset ?? aiPreset ?? mockGenerate(req).preset,
  }
  const eyebrow = asOptionalString(obj.eyebrow)
  if (eyebrow) spec.eyebrow = eyebrow
  const secondaryCta = asOptionalString(obj.secondaryCta)
  if (secondaryCta) spec.secondaryCta = secondaryCta
  const accent = req.accent ?? asOptionalString(obj.accent)
  if (accent) spec.accent = accent

  return isHeroSpec(spec) ? spec : null
}

// --- Handler -----------------------------------------------------------------
export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (isRateLimited(clientIp(req))) {
    res.status(429).json({ error: 'Too many requests, try again in a moment.' })
    return
  }

  const body = parseBody(req.body)
  const description =
    body && typeof body.description === 'string' ? body.description.trim() : ''
  if (!description) {
    res.status(400).json({ error: 'A non-empty description is required.' })
    return
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    res.status(400).json({
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    })
    return
  }

  let preset: Preset | undefined
  if (body && body.preset !== undefined) {
    if (
      typeof body.preset !== 'string' ||
      !(PRESETS as readonly string[]).includes(body.preset)
    ) {
      res.status(400).json({ error: 'Invalid preset.' })
      return
    }
    preset = body.preset as Preset
  }

  const generateReq: GenerateRequest = {
    description,
    preset,
    tone:
      body && typeof body.tone === 'string'
        ? (body.tone as GenerateRequest['tone'])
        : undefined,
    accent:
      body && typeof body.accent === 'string' ? body.accent : undefined,
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(200).json({ spec: mockGenerate(generateReq), source: 'mock' })
    return
  }

  // Prefer a graceful mock fallback over a hard failure on any AI-path error.
  try {
    const spec = await callClaude(apiKey, generateReq)
    if (spec) {
      res.status(200).json({ spec, source: 'ai' })
      return
    }
  } catch {
    // swallow — fall through to mock (never leak the key or raw error)
  }
  res.status(200).json({ spec: mockGenerate(generateReq), source: 'mock' })
}
