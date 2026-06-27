import { describe, it, expect } from 'vitest'
import { isHeroSpec, PRESETS, TONES } from './contract'
import type { HeroSpec } from './contract'

const validSpec: HeroSpec = {
  eyebrow: 'Introducing Hero Lab',
  headline: 'Hero sections that just work',
  subhead: 'Describe your product and ship a polished hero in seconds.',
  primaryCta: 'Get started',
  secondaryCta: 'See how it works',
  preset: 'playful',
  accent: '#5B4DF0',
}

describe('isHeroSpec', () => {
  it('accepts a fully populated valid spec', () => {
    expect(isHeroSpec(validSpec)).toBe(true)
  })

  it('accepts a minimal valid spec (only required fields)', () => {
    expect(
      isHeroSpec({
        headline: 'Ship faster',
        subhead: 'A short subhead.',
        primaryCta: 'Start',
        preset: 'minimal',
      }),
    ).toBe(true)
  })

  it('accepts every known preset', () => {
    for (const preset of PRESETS) {
      expect(isHeroSpec({ ...validSpec, preset })).toBe(true)
    }
  })

  it('rejects non-objects and null', () => {
    expect(isHeroSpec(null)).toBe(false)
    expect(isHeroSpec(undefined)).toBe(false)
    expect(isHeroSpec('string')).toBe(false)
    expect(isHeroSpec(42)).toBe(false)
    expect(isHeroSpec([])).toBe(false)
  })

  it('rejects missing or empty required string fields', () => {
    expect(isHeroSpec({ ...validSpec, headline: undefined })).toBe(false)
    expect(isHeroSpec({ ...validSpec, headline: '' })).toBe(false)
    expect(isHeroSpec({ ...validSpec, headline: '   ' })).toBe(false)
    expect(isHeroSpec({ ...validSpec, subhead: undefined })).toBe(false)
    expect(isHeroSpec({ ...validSpec, primaryCta: '' })).toBe(false)
  })

  it('rejects an unknown or non-string preset', () => {
    expect(isHeroSpec({ ...validSpec, preset: 'neon' })).toBe(false)
    expect(isHeroSpec({ ...validSpec, preset: undefined })).toBe(false)
    expect(isHeroSpec({ ...validSpec, preset: 123 })).toBe(false)
  })

  it('rejects non-string optional fields', () => {
    expect(isHeroSpec({ ...validSpec, eyebrow: 5 })).toBe(false)
    expect(isHeroSpec({ ...validSpec, secondaryCta: {} })).toBe(false)
    expect(isHeroSpec({ ...validSpec, accent: true })).toBe(false)
  })

  it('exposes the documented preset and tone sets', () => {
    expect(PRESETS).toEqual([
      'minimal',
      'bold',
      'playful',
      'editorial',
      'techy',
      'elegant',
    ])
    expect(TONES).toEqual(['confident', 'friendly', 'premium'])
  })
})
