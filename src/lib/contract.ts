// Data contract for the Hero Lab generation engine.
// Shared by the serverless function (api/generate.ts), the deterministic mock,
// and the client helper. Keep this file framework-free (no React, no DOM) so it
// can be imported from the Vercel Node handler as well as the browser bundle.

export const PRESETS = [
  'minimal',
  'bold',
  'playful',
  'editorial',
  'techy',
  'elegant',
] as const
export type Preset = (typeof PRESETS)[number]

export const TONES = ['confident', 'friendly', 'premium'] as const
export type Tone = (typeof TONES)[number]

export interface HeroSpec {
  eyebrow?: string
  /** The H1 — punchy, <= ~9 words. */
  headline: string
  /** 1–2 sentences. */
  subhead: string
  /** e.g. "Get started". */
  primaryCta: string
  /** e.g. "See how it works". */
  secondaryCta?: string
  /** Chosen visual style (maps to design tokens in G4). */
  preset: Preset
  /** Optional hex the look should use. */
  accent?: string
}

export interface GenerateRequest {
  /** The user's product / startup description. */
  description: string
  /** User-chosen preset (bias). */
  preset?: Preset
  tone?: Tone
  accent?: string
}

export interface GenerateResult {
  spec: HeroSpec
  source: 'ai' | 'mock'
}

/**
 * Runtime guard for a HeroSpec. Used by both the serverless function (to validate
 * model output before trusting it) and the client (to validate the API response).
 * Required string fields must be non-empty; `preset` must be a known preset;
 * optional fields, when present, must be strings.
 */
export function isHeroSpec(x: unknown): x is HeroSpec {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>

  const nonEmptyString = (v: unknown): boolean =>
    typeof v === 'string' && v.trim().length > 0
  const optionalString = (v: unknown): boolean =>
    v === undefined || typeof v === 'string'

  if (!nonEmptyString(o.headline)) return false
  if (!nonEmptyString(o.subhead)) return false
  if (!nonEmptyString(o.primaryCta)) return false
  if (
    typeof o.preset !== 'string' ||
    !(PRESETS as readonly string[]).includes(o.preset)
  ) {
    return false
  }
  if (!optionalString(o.eyebrow)) return false
  if (!optionalString(o.secondaryCta)) return false
  if (!optionalString(o.accent)) return false

  return true
}
