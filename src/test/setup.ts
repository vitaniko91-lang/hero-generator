import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees after every test to avoid cross-test DOM leakage.
afterEach(() => {
  cleanup()
})

// jsdom has no matchMedia — stub it (used by prefers-reduced-motion checks).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})

// jsdom has no IntersectionObserver — stub it (used by scroll-reveal motion).
class IntersectionObserverStub {
  root: Element | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
