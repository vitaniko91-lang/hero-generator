// Deterministic, dependency-free mock generator.
//
// Same input (description + preset + tone) always yields the same HeroSpec —
// the output is seeded off the description string and varied by preset/tone.
// This is shared infra: it powers (a) the serverless function when there is no
// API key and on any parse/validation failure, and (b) the client dev fallback.
// The UI is demoed with it, so the copy must read believable and tasteful.

import { PRESETS, TONES } from './contract'
import type { GenerateRequest, HeroSpec, Preset, Tone } from './contract'

// FNV-1a — small, fast, deterministic 32-bit string hash.
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

// Known acronyms / product nouns that have a canonical casing. Keyed by the
// lowercased token so a description like "an AI note-taker" or "a SaaS CRM"
// renders "AI"/"SaaS"/"CRM" instead of the awkward "Ai"/"Saas"/"Crm".
const ACRONYMS: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  saas: 'SaaS',
  crm: 'CRM',
  ui: 'UI',
  ux: 'UX',
  b2b: 'B2B',
  b2c: 'B2C',
  ml: 'ML',
  ar: 'AR',
  vr: 'VR',
  seo: 'SEO',
  ios: 'iOS',
}

// Lowercase context (e.g. "the future of ai note-taker") — keep the word as the
// user wrote it, but still upcase known acronyms so they never read as "ai".
function canonicalCase(word: string): string {
  return ACRONYMS[word] ?? word
}

// Title context (e.g. the subject Noun) — acronyms win, otherwise capitalize.
function titleCase(word: string): string {
  return ACRONYMS[word] ?? word.charAt(0).toUpperCase() + word.slice(1)
}

// Words that don't make a good subject noun (articles, prepositions, pronouns,
// and the common "does X" verbs). Category nouns like "app"/"platform" are kept.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
  'by', 'with', 'from', 'as', 'is', 'are', 'be', 'was', 'were', 'that', 'this',
  'these', 'those', 'it', 'its', 'your', 'our', 'their', 'my', 'we', 'you',
  'they', 'who', 'which', 'where', 'when', 'how', 'helps', 'help', 'lets',
  'let', 'allows', 'allow', 'enables', 'enable', 'makes', 'make', 'build',
  'builds', 'create', 'creates', 'generate', 'generates', 'manage', 'manages',
  'track', 'tracks', 'plan', 'plans', 'find', 'finds', 'get', 'gets', 'give',
  'gives', 'turn', 'turns', 'use', 'uses', 'using', 'help', 'so', 'into',
])

// Category nouns — anchor the subject phrase around one of these when present.
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
    // Two words immediately before the category noun read most naturally:
    // "meal planning app" -> "meal planning".
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
  return [
    `Introducing ${Noun}`,
    `New`,
    `Now in private beta`,
    `Built for builders`,
    `Say hello to ${Noun}`,
  ]
}

const PRIMARY_CTAS: Record<Tone, string[]> = {
  confident: ['Get started', 'Start building', 'Get started free'],
  friendly: ['Try it free', 'Get started', 'Jump in'],
  premium: ['Request access', 'Get started', 'Book a demo'],
}

const SECONDARY_CTAS = [
  'See how it works',
  'Watch the demo',
  'Learn more',
  'Explore features',
] as const

export function mockGenerate(req: GenerateRequest): HeroSpec {
  const description = (req.description ?? '').trim()
  const baseSeed = hashString(description.toLowerCase())

  const preset: Preset =
    req.preset && PRESETS.includes(req.preset)
      ? req.preset
      : pick(PRESETS, baseSeed)
  const tone: Tone =
    req.tone && TONES.includes(req.tone) ? req.tone : pick(TONES, baseSeed >>> 3)

  // Folding preset + tone into the variant seed means changing either of them
  // shifts the copy too — so the mock "varies by preset/tone" as required.
  const variant = hashString(`${description.toLowerCase()}|${preset}|${tone}`)
  const seedFor = (label: string): number => hashString(`${label}:${variant}`)

  const subject = deriveSubject(description)
  const headlines = buildHeadlines(subject)
  const subheads = buildSubheads(subject)
  const eyebrows = buildEyebrows(subject)

  const spec: HeroSpec = {
    eyebrow: pick(eyebrows, seedFor('eyebrow')),
    headline: pick(headlines, seedFor('headline')),
    subhead: pick(subheads[tone], seedFor('subhead')),
    primaryCta: pick(PRIMARY_CTAS[tone], seedFor('primary')),
    secondaryCta: pick(SECONDARY_CTAS, seedFor('secondary')),
    preset,
  }

  if (req.accent) spec.accent = req.accent

  return spec
}
