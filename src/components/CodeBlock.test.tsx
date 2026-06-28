import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CodeBlock from './CodeBlock'

describe('CodeBlock', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('copies the code to the clipboard and announces it', async () => {
    const code = 'const x = 1'
    render(<CodeBlock code={code} language="tsx" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code),
    )
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard'),
    )
  })
})
