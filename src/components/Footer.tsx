import { Icon } from '@iconify/react'
import { cx } from '../lib/cx'
import Wordmark from './Wordmark'

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2'

const ICON_LINK = cx(
  'grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors',
  'hover:bg-bg-sunk hover:text-ink',
  FOCUS_RING,
)

// Light, friendly footer. The lead-magnet CTA is the conversion moment — a soft
// indigo band with the pitch and a clear "Let's talk" button. Below: the brand
// mark, an honest "free tool" note, and minimal social links.
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Lead-magnet CTA band ------------------------------------------------ */}
        <div className="flex flex-col items-start gap-5 rounded-2xl bg-indigo-dim p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="max-w-xl">
            <p className="font-display text-[18px] font-bold leading-snug tracking-tight text-ink sm:text-[20px]">
              Built by Vitalina Nikulina — need the whole site designed &amp; shipped?
            </p>
            <p className="mt-1.5 font-sans text-[14px] leading-relaxed text-ink-soft">
              Hero Lab is a free concept tool. I design and build production-ready sites end to end.
            </p>
          </div>
          <a
            href="https://vitaniko91-lang.github.io/"
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo px-5 py-3',
              'font-display text-[15px] font-medium text-white shadow-soft transition-colors',
              'hover:bg-[#4A3FD4]',
              FOCUS_RING,
            )}
          >
            Let&rsquo;s talk
            <Icon icon="lucide:arrow-up-right" className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        </div>

        {/* Meta row ----------------------------------------------------------- */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <Wordmark size="sm" />
            <span className="font-sans text-[13px] text-ink-faint">
              A free tool &middot; concept by Vitalina
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a href="https://github.com/vitaniko91-lang/hero-generator" aria-label="GitHub" className={ICON_LINK}>
              <Icon icon="lucide:github" className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <a href="https://x.com/VitalinaN96916" aria-label="X (formerly Twitter)" className={ICON_LINK}>
              <Icon icon="simple-icons:x" className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
