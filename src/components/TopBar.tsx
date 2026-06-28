import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { cx } from '../lib/cx'
import Wordmark from './Wordmark'

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2'

// Numbering is meaningful here — these are a real, ordered sequence the user
// follows, so the 1/2/3 markers carry information, not decoration.
const STEPS = [
  'Describe your product in a sentence.',
  'Pick a vibe, tone, and accent color.',
  'Generate, then copy the React + Tailwind code.',
]

// A small disclosure popover. Calm chrome — no animation, dismiss on Escape
// (returns focus to the trigger) or click outside. Desktop only.
function HowItWorks() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="hl-howitworks"
        className={cx(
          'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-sans text-[14px] font-medium',
          'text-ink-soft transition-colors hover:text-ink',
          FOCUS_RING,
        )}
      >
        How it works
        <Icon
          icon="lucide:chevron-down"
          className={cx('h-4 w-4 transition-transform duration-200 ease-out', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <div
        id="hl-howitworks"
        hidden={!open}
        className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-bg-panel p-4 shadow-lift"
      >
        <p className="mb-3 font-display text-[14px] font-semibold text-ink">Three quick steps</p>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-dim font-display text-[12px] font-semibold text-indigo">
                {i + 1}
              </span>
              <span className="font-sans text-[13px] leading-relaxed text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// The app's top bar: brand mark left, a "How it works" disclosure + GitHub link +
// the lead-magnet credit right. The credit is the conversion hook — calm by
// default, fills indigo on hover. Chrome stays neutral so the colorful previews
// below are the star.
export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8">
        <a href="/" aria-label="Hero Lab — home" className={cx('rounded-lg', FOCUS_RING)}>
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden sm:block">
            <HowItWorks />
          </div>

          <a
            href="#"
            aria-label="View source on GitHub"
            className={cx(
              'grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors',
              'hover:bg-bg-sunk hover:text-ink',
              FOCUS_RING,
            )}
          >
            <Icon icon="lucide:github" className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>

          <a
            href="#"
            className={cx(
              'group inline-flex items-center gap-1.5 rounded-full border border-indigo/20 bg-indigo-dim',
              'px-3 py-1.5 font-sans text-[13px] font-medium text-indigo transition-colors',
              'hover:border-indigo hover:bg-indigo hover:text-white',
              FOCUS_RING,
            )}
          >
            <span className="hidden sm:inline">Made by Vitalina — need a full site?</span>
            <span className="sm:hidden">by Vitalina</span>
            <Icon
              icon="lucide:arrow-up-right"
              className="h-4 w-4 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </nav>
      </div>
    </header>
  )
}
