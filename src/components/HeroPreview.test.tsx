import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HeroPreview from './HeroPreview'
import { PRESETS } from '../lib/contract'
import type { HeroSpec } from '../lib/contract'

const base: HeroSpec = {
  preset: 'minimal',
  eyebrow: 'New',
  headline: 'Build something lovely',
  subhead: 'A short supporting line that explains the value.',
  primaryCta: 'Get started',
  secondaryCta: 'Learn more',
}

describe('HeroPreview', () => {
  it('renders eyebrow, headline, subhead and both CTAs', () => {
    render(<HeroPreview spec={base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Build something lovely',
    )
    expect(
      screen.getByText('A short supporting line that explains the value.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Get started')).toBeInTheDocument()
    expect(screen.getByText('Learn more')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders every preset without error and keeps the headline', () => {
    for (const preset of PRESETS) {
      const { unmount } = render(<HeroPreview spec={{ ...base, preset }} />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Build something lovely',
      )
      unmount()
    }
  })

  it('omits the secondary CTA when not provided', () => {
    render(<HeroPreview spec={{ ...base, secondaryCta: undefined }} />)
    expect(screen.queryByText('Learn more')).not.toBeInTheDocument()
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('applies an accent override on a filled-accent preset', () => {
    render(<HeroPreview spec={{ ...base, preset: 'bold', accent: '#FF00AA' }} />)
    const cta = screen.getByText('Get started')
    const style = (cta.getAttribute('style') ?? '').toLowerCase()
    expect(style.includes('ff00aa') || style.includes('255, 0, 170')).toBe(true)
  })
})
