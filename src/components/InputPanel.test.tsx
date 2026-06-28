import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputPanel from './InputPanel'

describe('InputPanel', () => {
  it('autofills the textarea when an example chip is clicked', () => {
    render(<InputPanel onGenerate={vi.fn()} loading={false} />)

    const textarea = screen.getByLabelText('Describe your product') as HTMLTextAreaElement
    expect(textarea.value).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'AI note-taker' }))
    expect(textarea.value).toContain('AI note-taker')
  })

  it('sets aria-pressed on a preset chip when selected', () => {
    render(<InputPanel onGenerate={vi.fn()} loading={false} />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    expect(bold).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(bold)
    expect(bold).toHaveAttribute('aria-pressed', 'true')
  })

  it('disables Generate when empty and emits the built request when filled', () => {
    const onGenerate = vi.fn()
    render(<InputPanel onGenerate={onGenerate} loading={false} />)

    const generate = screen.getByRole('button', { name: 'Generate' })
    expect(generate).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Describe your product'), {
      target: { value: '  A calm focus timer  ' },
    })
    expect(generate).toBeEnabled()

    fireEvent.click(generate)
    expect(onGenerate).toHaveBeenCalledTimes(1)
    // description trimmed; tone defaults to confident; preset/accent omitted (let AI pick).
    expect(onGenerate).toHaveBeenCalledWith({
      description: 'A calm focus timer',
      tone: 'confident',
    })
  })

  it('includes the chosen preset and accent in the request', () => {
    const onGenerate = vi.fn()
    render(<InputPanel onGenerate={onGenerate} loading={false} />)

    fireEvent.change(screen.getByLabelText('Describe your product'), {
      target: { value: 'A dev tool' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Techy' }))
    fireEvent.click(screen.getByRole('button', { name: 'Coral accent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(onGenerate).toHaveBeenCalledWith({
      description: 'A dev tool',
      tone: 'confident',
      preset: 'techy',
      accent: '#FF6B5C',
    })
  })

  it('triggers Generate on Cmd/Ctrl+Enter inside the textarea', () => {
    const onGenerate = vi.fn()
    render(<InputPanel onGenerate={onGenerate} loading={false} />)

    const textarea = screen.getByLabelText('Describe your product')
    fireEvent.change(textarea, { target: { value: 'A note app' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })

    expect(onGenerate).toHaveBeenCalledTimes(1)
    expect(onGenerate).toHaveBeenCalledWith({
      description: 'A note app',
      tone: 'confident',
    })
  })

  it('does not generate on Cmd+Enter when empty', () => {
    const onGenerate = vi.fn()
    render(<InputPanel onGenerate={onGenerate} loading={false} />)

    fireEvent.keyDown(screen.getByLabelText('Describe your product'), {
      key: 'Enter',
      metaKey: true,
    })
    expect(onGenerate).not.toHaveBeenCalled()
  })
})
