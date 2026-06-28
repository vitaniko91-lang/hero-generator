import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PopIn from './PopIn'

describe('PopIn', () => {
  it('renders its children', () => {
    render(
      <PopIn>
        <span>Hello</span>
      </PopIn>,
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
