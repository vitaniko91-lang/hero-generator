import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Segmented from './Segmented'

const options = [
  { value: 'confident', label: 'Confident' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'premium', label: 'Premium' },
]

describe('Segmented', () => {
  it('exposes radiogroup + radio semantics', () => {
    render(
      <Segmented
        options={options}
        value="confident"
        onChange={() => {}}
        ariaLabel="Tone"
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Tone' })).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn()
    render(
      <Segmented
        options={options}
        value="confident"
        onChange={onChange}
        ariaLabel="Tone"
      />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Friendly' }))
    expect(onChange).toHaveBeenCalledWith('friendly')
  })

  it('moves selection with arrow keys', () => {
    const onChange = vi.fn()
    render(
      <Segmented
        options={options}
        value="confident"
        onChange={onChange}
        ariaLabel="Tone"
      />,
    )
    fireEvent.keyDown(screen.getByRole('radiogroup', { name: 'Tone' }), {
      key: 'ArrowRight',
    })
    expect(onChange).toHaveBeenCalledWith('friendly')
  })
})
