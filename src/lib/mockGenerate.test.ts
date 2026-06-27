import { describe, it, expect } from 'vitest'
import { mockGenerate } from './mockGenerate'
import { isHeroSpec, PRESETS, TONES } from './contract'
import type { GenerateRequest } from './contract'

const DESCRIPTIONS = [
  'an AI tool that generates landing page heroes',
  'a meal planning app for busy families',
  'developer analytics platform for shipping faster',
  'a calm meditation companion',
  'enterprise invoicing software for agencies',
  '', // empty edge case
]

describe('mockGenerate', () => {
  it('returns a valid HeroSpec for a range of descriptions', () => {
    for (const description of DESCRIPTIONS) {
      const spec = mockGenerate({ description })
      expect(isHeroSpec(spec)).toBe(true)
    }
  })

  it('returns a valid HeroSpec for every preset', () => {
    for (const preset of PRESETS) {
      const spec = mockGenerate({ description: 'a note taking app', preset })
      expect(isHeroSpec(spec)).toBe(true)
      expect(spec.preset).toBe(preset)
    }
  })

  it('keeps the headline punchy (<= ~9 words)', () => {
    for (const description of DESCRIPTIONS) {
      const spec = mockGenerate({ description })
      const wordCount = spec.headline.trim().split(/\s+/).length
      expect(wordCount).toBeLessThanOrEqual(9)
    }
  })

  it('is deterministic — same input yields the same output', () => {
    const req: GenerateRequest = {
      description: 'a meal planning app for busy families',
      preset: 'bold',
      tone: 'friendly',
    }
    expect(mockGenerate(req)).toEqual(mockGenerate(req))
  })

  it('is deterministic without explicit preset/tone too', () => {
    const req: GenerateRequest = { description: 'developer analytics platform' }
    const a = mockGenerate(req)
    const b = mockGenerate(req)
    expect(a).toEqual(b)
    // The derived preset/tone are themselves stable and valid.
    expect(PRESETS).toContain(a.preset)
  })

  it('honors a user-chosen preset', () => {
    const spec = mockGenerate({ description: 'a crm for small teams', preset: 'techy' })
    expect(spec.preset).toBe('techy')
  })

  it('varies the copy when the tone changes', () => {
    const description = 'a meal planning app for busy families'
    const outputs = TONES.map((tone) => mockGenerate({ description, tone }))
    const subheads = new Set(outputs.map((s) => s.subhead))
    // Each tone draws from a different subhead pool, so at least two differ.
    expect(subheads.size).toBeGreaterThan(1)
  })

  it('passes the accent through when provided', () => {
    const spec = mockGenerate({ description: 'a design tool', accent: '#FF6B5C' })
    expect(spec.accent).toBe('#FF6B5C')
  })

  it('omits accent when none is provided', () => {
    const spec = mockGenerate({ description: 'a design tool' })
    expect(spec.accent).toBeUndefined()
  })
})
