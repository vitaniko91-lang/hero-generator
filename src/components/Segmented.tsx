import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { cx } from '../lib/cx'
import { gentleSpring } from '../lib/motion'
import { useReducedMotion } from '../lib/useReducedMotion'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name for the radiogroup, e.g. "Tone". */
  ariaLabel: string
  className?: string
}

// Segmented control with radio semantics + a sliding indigo indicator. Arrow
// keys move selection (roving tabindex); the indicator slides on a spring via a
// shared layoutId, and snaps instantly under reduced motion.
export default function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedProps<T>) {
  const reduced = useReducedMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = options.findIndex((o) => o.value === value)

  const selectAt = (index: number) => {
    const next = (index + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        selectAt(activeIndex + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        selectAt(activeIndex - 1)
        break
      case 'Home':
        e.preventDefault()
        selectAt(0)
        break
      case 'End':
        e.preventDefault()
        selectAt(options.length - 1)
        break
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cx('inline-flex gap-1 rounded-lg bg-bg-sunk p-1', className)}
    >
      {options.map((opt, i) => {
        const checked = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cx(
              'relative z-10 flex-1 rounded-md px-4 py-1.5 text-[13px] font-medium font-sans',
              'select-none transition-colors focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-indigo outline-offset-1 whitespace-nowrap',
              checked ? 'text-white' : 'text-ink-soft hover:text-ink',
            )}
          >
            {checked && (
              <motion.span
                layoutId={`segmented-${ariaLabel}`}
                transition={reduced ? { duration: 0 } : gentleSpring}
                className="absolute inset-0 -z-10 rounded-md bg-indigo shadow-soft"
                aria-hidden="true"
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
