import { describe, it, expect } from 'vitest'
import { toReact, toHtml } from './codegen'
import type { HeroSpec } from './contract'

const full: HeroSpec = {
  preset: 'bold',
  eyebrow: 'Introducing',
  headline: 'Ship your hero in seconds',
  subhead: 'Describe your product and get production-ready code.',
  primaryCta: 'Get started',
  secondaryCta: 'See how it works',
  accent: '#FF5A36',
}

describe('codegen — toReact', () => {
  it('includes the headline and primary CTA, and never leaks "undefined"', () => {
    const out = toReact(full)
    expect(out).toContain('Ship your hero in seconds')
    expect(out).toContain('Get started')
    expect(out).toContain('See how it works')
    expect(out).toContain('Introducing')
    expect(out).not.toContain('undefined')
    expect(out).toContain('export default function Hero')
  })

  it('omits optional blocks cleanly when eyebrow/secondaryCta are absent', () => {
    const out = toReact({
      preset: 'minimal',
      headline: 'Just the essentials',
      subhead: 'A single supporting line.',
      primaryCta: 'Start',
    })
    expect(out).toContain('Just the essentials')
    expect(out).toContain('Start')
    expect(out).not.toContain('undefined')
    expect(out).not.toContain('See how it works')
  })

  it('reproduces the preset/accent look (faithful to the renderer)', () => {
    // bold is a fill-accent preset; the accent must appear as the button fill.
    expect(toReact(full)).toContain('#FF5A36')
  })

  it('escapes quotes, angle brackets and JSX braces in user copy', () => {
    const out = toReact({
      preset: 'techy',
      headline: 'Save 100% "now" <b>{x}</b>',
      subhead: 'Plain & simple.',
      primaryCta: 'Go',
    })
    expect(out).toContain('&lt;b&gt;')
    expect(out).toContain('&#123;x&#125;')
    expect(out).toContain('Plain &amp; simple.')
    // The raw injected tag must not survive into the output.
    expect(out).not.toContain('<b>{x}</b>')
    // A double quote in body copy is preserved (valid in JSX text).
    expect(out).toContain('"now"')
  })
})

describe('codegen — toHtml', () => {
  it('includes the headline and primary CTA, and never leaks "undefined"', () => {
    const out = toHtml(full)
    expect(out).toContain('Ship your hero in seconds')
    expect(out).toContain('Get started')
    expect(out).toContain('See how it works')
    expect(out).not.toContain('undefined')
    expect(out).toContain('<section')
  })

  it('escapes angle brackets and ampersands in user copy', () => {
    const out = toHtml({
      preset: 'editorial',
      headline: 'Tom & Jerry <script>',
      subhead: 'Safe text.',
      primaryCta: 'Read',
    })
    expect(out).toContain('Tom &amp; Jerry &lt;script&gt;')
    expect(out).not.toContain('<script>')
  })
})
