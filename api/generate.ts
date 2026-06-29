// Vercel serverless function (Node runtime) for Hero Lab generation.
//
// SELF-CONTAINED ON PURPOSE: this file has NO relative imports into ../src/*.
// Under the project's ESM ("type":"module") setup, Vercel's function bundler
// could not resolve cross-directory imports into the Vite `src/` tree at runtime
// (ERR_MODULE_NOT_FOUND). The contract + deterministic mock are therefore inlined
// here. The browser's source of truth stays in src/lib/{contract,mockGenerate}.ts;
// if you change the mock/contract there, mirror the change here.
//
// Behavior: POST only. No ANTHROPIC_API_KEY -> deterministic mock. With a key ->
// Claude Haiku, validated, with a graceful mock fallback on any failure. Never
// hard-fails on the AI path; never leaks the key or raw errors.

// --- Contract (inlined from src/lib/contract.ts) -----------------------------
const PRESETS = ['minimal', 'bold', 'playful', 'editorial', 'techy', 'elegant'] as const
type Preset = (typeof PRESETS)[number]
const TONES = ['confident', 'friendly', 'premium'] as const
type Tone = (typeof TONES)[number]

interface HeroSpec {
  eyebrow?: string
  headline: string
  subhead: string
  primaryCta: string
  secondaryCta?: string
  preset: Preset
  accent?: string
}
interface GenerateRequest {
  description: string
  preset?: Preset
  tone?: Tone
  accent?: string
}

function isHeroSpec(x: unknown): x is HeroSpec {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  const nonEmptyString = (v: unknown): boolean =>
    typeof v === 'string' && v.trim().length > 0
  const optionalString = (v: unknown): boolean =>
    v === undefined || typeof v === 'string'
  if (!nonEmptyString(o.headline)) return false
  if (!nonEmptyString(o.subhead)) return false
  if (!nonEmptyString(o.primaryCta)) return false
  if (typeof o.preset !== 'string' || !(PRESETS as readonly string[]).includes(o.preset)) {
    return false
  }
  if (!optionalString(o.eyebrow)) return false
  if (!optionalString(o.secondaryCta)) return false
  if (!optionalString(o.accent)) return false
  return true
}

// --- Deterministic mock (inlined from src/lib/mockGenerate.ts) ----------------
function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length]
}
const ACRONYMS: Record<string, string> = {
  ai: 'AI', api: 'API', saas: 'SaaS', crm: 'CRM', ui: 'UI', ux: 'UX',
  b2b: 'B2B', b2c: 'B2C', ml: 'ML', ar: 'AR', vr: 'VR', seo: 'SEO', ios: 'iOS',
}
function canonicalCase(word: string): string {
  return ACRONYMS[word] ?? word
}
function titleCase(word: string): string {
  return ACRONYMS[word] ?? word.charAt(0).toUpperCase() + word.slice(1)
}
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
  'by', 'with', 'from', 'as', 'is', 'are', 'be', 'was', 'were', 'that', 'this',
  'these', 'those', 'it', 'its', 'your', 'our', 'their', 'my', 'we', 'you',
  'they', 'who', 'which', 'where', 'when', 'how', 'helps', 'help', 'lets',
  'let', 'allows', 'allow', 'enables', 'enable', 'makes', 'make', 'build',
  'builds', 'create', 'creates', 'generate', 'generates', 'manage', 'manages',
  'track', 'tracks', 'plan', 'plans', 'find', 'finds', 'get', 'gets', 'give',
  'gives', 'turn', 'turns', 'use', 'uses', 'using', 'so', 'into',
])
const CATEGORY = new Set([
  'app', 'apps', 'platform', 'tool', 'tools', 'service', 'services', 'studio',
  'suite', 'dashboard', 'assistant', 'engine', 'kit', 'hub', 'system',
  'network', 'marketplace', 'builder', 'generator', 'tracker', 'planner',
  'manager', 'analytics', 'crm', 'saas', 'software', 'api', 'bot', 'widget',
  'editor', 'workspace', 'portal', 'store', 'shop', 'site', 'website',
])
interface Subject {
  Noun: string
  nounLower: string
}
function deriveSubject(description: string): Subject {
  const tokens = (description.toLowerCase().match(/[a-z][a-z'-]*[a-z]|[a-z]/g) ?? [])
    .filter((w) => w.length >= 2)
  const keywords = tokens.filter((w) => !STOPWORDS.has(w))
  if (keywords.length === 0) {
    return { Noun: 'Your Product', nounLower: 'your product' }
  }
  const catIndex = keywords.findIndex((w) => CATEGORY.has(w))
  let phrase: string[]
  if (catIndex === -1) {
    phrase = keywords.slice(0, 2)
  } else if (catIndex === 0) {
    phrase = keywords.slice(0, 1)
  } else if (catIndex === 1) {
    phrase = keywords.slice(0, 2)
  } else {
    phrase = keywords.slice(catIndex - 2, catIndex)
  }
  if (phrase.length === 0) phrase = keywords.slice(0, 2)
  return {
    Noun: phrase.map(titleCase).join(' '),
    nounLower: phrase.map(canonicalCase).join(' '),
  }
}
function buildHeadlines({ Noun, nounLower }: Subject): string[] {
  return [
    `${Noun} that just works`,
    `${Noun}, reimagined`,
    `Meet the future of ${nounLower}`,
    `Your ${nounLower}, supercharged`,
    `${Noun} without the busywork`,
    `Build ${nounLower} people love`,
    `${Noun}, finally done right`,
    `The smarter way to do ${nounLower}`,
  ]
}
function buildSubheads({ Noun, nounLower }: Subject): Record<Tone, string[]> {
  return {
    confident: [
      `The modern way to handle ${nounLower}. Set up in minutes and ship with confidence.`,
      `Stop wrestling with ${nounLower}. Get a polished, production-ready result in seconds.`,
      `${Noun} built for teams that move fast — launch, measure, and grow without the overhead.`,
    ],
    friendly: [
      `Everything you need for ${nounLower}, in one friendly place. No clutter, no fuss — just results.`,
      `Make ${nounLower} feel easy again. Get started in minutes and see the difference today.`,
      `${Noun} that works the way you think. Simple to start, genuinely delightful to use.`,
    ],
    premium: [
      `A refined approach to ${nounLower}, crafted for people who care about the details.`,
      `${Noun}, elevated. Thoughtfully designed, beautifully simple, ready when you are.`,
      `Experience ${nounLower} at its finest — powerful, polished, effortlessly elegant.`,
    ],
  }
}
function buildEyebrows({ Noun }: Subject): string[] {
  return [`Introducing ${Noun}`, `New`, `Now in private beta`, `Built for builders`, `Say hello to ${Noun}`]
}
const PRIMARY_CTAS: Record<Tone, string[]> = {
  confident: ['Get started', 'Start building', 'Get started free'],
  friendly: ['Try it free', 'Get started', 'Jump in'],
  premium: ['Request access', 'Get started', 'Book a demo'],
}
const SECONDARY_CTAS = ['See how it works', 'Watch the demo', 'Learn more', 'Explore features'] as const

function mockGenerate(req: GenerateRequest): HeroSpec {
  const description = (req.description ?? '').trim()
  const baseSeed = hashString(description.toLowerCase())
  const preset: Preset =
    req.preset && PRESETS.includes(req.preset) ? req.preset : pick(PRESETS, baseSeed)
  const tone: Tone =
    req.tone && TONES.includes(req.tone) ? req.tone : pick(TONES, baseSeed >>> 3)
  const variant = hashString(`${description.toLowerCase()}|${preset}|${tone}`)
  const seedFor = (label: string): number => hashString(`${label}:${variant}`)
  const subject = deriveSubject(description)
  const spec: HeroSpec = {
    eyebrow: pick(buildEyebrows(subject), seedFor('eyebrow')),
    headline: pick(buildHeadlines(subject), seedFor('headline')),
    subhead: pick(buildSubheads(subject)[tone], seedFor('subhead')),
    primaryCta: pick(PRIMARY_CTAS[tone], seedFor('primary')),
    secondaryCta: pick(SECONDARY_CTAS, seedFor('secondary')),
    preset,
  }
  if (req.accent) spec.accent = req.accent
  return spec
}

// --- Vercel Node handler types -----------------------------------------------
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

// --- Rate limiting (best-effort, in-memory per-IP; resets on cold start) ------
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

async function callClaude(apiKey: string, req: GenerateRequest): Promise<HeroSpec | null> {
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
          { role: 'assistant', content: '{' },
        ],
      }),
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!resp.ok) return null

  const data = (await resp.json()) as { content?: Array<{ type?: string; text?: string }> }
  const textBlock = data.content?.find((b) => b.type === 'text')
  const text = textBlock?.text ?? ''
  const parsed = extractJsonObject(`{${text}`)
  if (typeof parsed !== 'object' || parsed === null) return null

  const obj = parsed as Record<string, unknown>
  const aiPreset =
    typeof obj.preset === 'string' && (PRESETS as readonly string[]).includes(obj.preset)
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
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
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
    res.status(400).json({ error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` })
    return
  }

  let preset: Preset | undefined
  if (body && body.preset !== undefined) {
    if (typeof body.preset !== 'string' || !(PRESETS as readonly string[]).includes(body.preset)) {
      res.status(400).json({ error: 'Invalid preset.' })
      return
    }
    preset = body.preset as Preset
  }

  const generateReq: GenerateRequest = {
    description,
    preset,
    tone: body && typeof body.tone === 'string' ? (body.tone as GenerateRequest['tone']) : undefined,
    accent: body && typeof body.accent === 'string' ? body.accent : undefined,
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(200).json({ spec: mockGenerate(generateReq), source: 'mock' })
    return
  }

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
