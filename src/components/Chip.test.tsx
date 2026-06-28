import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Chip from './Chip'

describe('Chip', () => {
  it('reflects selection via aria-pressed and fires onClick', () => {
    const onClick = vi.fn()
    const { rerender } = render(<Chip onClick={onClick}>Bold</Chip>)

    const chip = screen.getByRole('button', { name: 'Bold' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(chip)
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Chip selected onClick={onClick}>
        Bold
      </Chip>,
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
