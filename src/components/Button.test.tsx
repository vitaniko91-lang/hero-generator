import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders a primary button with brand classes + focus-visible ring', () => {
    render(<Button>Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn.className).toContain('bg-indigo')
    expect(btn.className).toContain('text-white')
    expect(btn.className).toContain('active:scale-95')
    expect(btn.className).toContain('focus-visible:outline-indigo')
  })

  it('renders an anchor when href is provided', () => {
    render(<Button href="https://example.com">Link</Button>)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Sec</Button>)
    expect(screen.getByRole('button', { name: 'Sec' }).className).toContain(
      'border-line',
    )
  })
})
