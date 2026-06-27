import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Hero Lab wordmark', () => {
    render(<App />)
    expect(screen.getByText('Hero Lab')).toBeInTheDocument()
  })
})
