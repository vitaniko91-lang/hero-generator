import { render } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import SparkleBurst from './SparkleBurst'

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('reduce') ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

describe('SparkleBurst', () => {
  afterEach(() => {
    setReducedMotion(false) // restore the setup default
  })

  it('renders nothing under reduced motion (no-op)', () => {
    setReducedMotion(true)
    const { container } = render(<SparkleBurst trigger={1} />)
    expect(container).toBeEmptyDOMElement()
  })
})
