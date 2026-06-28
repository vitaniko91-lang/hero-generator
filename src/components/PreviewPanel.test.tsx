import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PreviewPanel from './PreviewPanel'
import type { HeroSpec } from '../lib/contract'

const spec: HeroSpec = {
  preset: 'playful',
  eyebrow: 'New',
  headline: 'Build something lovely',
  subhead: 'A short supporting line that explains the value.',
  primaryCta: 'Get started',
  secondaryCta: 'Learn more',
}

describe('PreviewPanel', () => {
  it('shows a loading skeleton with a status when loading', () => {
    render(<PreviewPanel spec={null} loading error={null} />)
    expect(screen.getByText(/Generating your hero/)).toBeInTheDocument()
    // No code area while loading.
    expect(screen.queryByRole('region', { name: 'Generated code' })).not.toBeInTheDocument()
  })

  it('shows a friendly error with a working retry', () => {
    const onRetry = vi.fn()
    render(
      <PreviewPanel
        spec={null}
        loading={false}
        error="The model is warming up."
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('The model is warming up.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows a delightful empty hint when there is no spec', () => {
    render(<PreviewPanel spec={null} loading={false} error={null} />)
    expect(screen.getByText('Your hero will appear here')).toBeInTheDocument()
    expect(screen.getByText(/Describe your product and hit/)).toBeInTheDocument()
  })

  it('renders the hero preview and the generated code when a spec is present', () => {
    render(<PreviewPanel spec={spec} loading={false} error={null} source="mock" />)

    expect(
      screen.getByRole('heading', { name: /Build something lovely/ }),
    ).toBeInTheDocument()

    const region = screen.getByRole('region', { name: 'Generated code' })
    expect(within(region).getByText(/export default function Hero/)).toBeInTheDocument()
    // The mock badge surfaces the demo source.
    expect(screen.getByText('Demo output')).toBeInTheDocument()
  })
})
