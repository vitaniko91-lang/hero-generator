import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import type { GenerateResult } from './lib/contract'

// Deterministic generate so the flow test never touches the network. Keep the
// real RateLimitError export so App's `instanceof` check still resolves.
vi.mock('./lib/generate', async () => {
  const actual = await vi.importActual<typeof import('./lib/generate')>('./lib/generate')
  const generateHero = vi.fn(
    async (): Promise<GenerateResult> => ({
      spec: {
        preset: 'playful',
        eyebrow: 'New',
        headline: 'A hero, generated',
        subhead: 'A short supporting line that explains the value.',
        primaryCta: 'Get started',
      },
      source: 'mock',
    }),
  )
  return { ...actual, generateHero }
})

describe('App', () => {
  it('renders exactly one h1 plus the Hero Lab wordmark (bar + footer)', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    // Wordmark appears in both the top bar and the footer.
    expect(screen.getAllByText('Hero Lab').length).toBeGreaterThanOrEqual(2)
  })

  it('renders the two-panel workspace: input controls + an empty preview', () => {
    render(<App />)
    expect(screen.getByLabelText('Describe your product')).toBeInTheDocument()
    expect(screen.getByText('Your hero will appear here')).toBeInTheDocument()
  })

  it('populates the preview when the user generates', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Describe your product'), {
      target: { value: 'A calm meditation app that schedules tiny daily resets.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Generate/ }))

    // The generated hero heading pops into the preview, and the code area opens.
    expect(
      await screen.findByRole('heading', { name: /A hero, generated/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Generated code' })).toBeInTheDocument()
  })
})
