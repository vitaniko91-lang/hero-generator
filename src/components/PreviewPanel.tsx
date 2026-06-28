import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import type { HeroSpec } from '../lib/contract'
import { toHtml, toReact } from '../lib/codegen'
import { cx } from '../lib/cx'
import { useCopyToClipboard } from '../lib/useCopyToClipboard'
import { useReducedMotion } from '../lib/useReducedMotion'
import HeroPreview from './HeroPreview'
import Panel from './Panel'
import Button from './Button'
import Segmented from './Segmented'
import CodeBlock from './CodeBlock'
import PopIn from './PopIn'
import SparkleBurst from './SparkleBurst'
import type { SegmentedOption } from './Segmented'

interface PreviewPanelProps {
  spec: HeroSpec | null
  loading: boolean
  error: string | null
  /** Re-run generation — wired to both "Try again" and "Regenerate". */
  onRetry?: () => void
  /** Where the spec came from; `'mock'` shows a small "demo output" note. */
  source?: 'ai' | 'mock'
}

type CodeTab = 'react' | 'html'

const CODE_TABS: SegmentedOption<CodeTab>[] = [
  { value: 'react', label: 'React' },
  { value: 'html', label: 'HTML' },
]

// The Preview panel: a faux browser frame around the live hero, with the four
// async states (loading / error / empty / result) and, when a hero exists, a
// collapsible code area that emits faithful React + HTML for the same spec.
export default function PreviewPanel({
  spec,
  loading,
  error,
  onRetry,
  source,
}: PreviewPanelProps) {
  const [tab, setTab] = useState<CodeTab>('react')
  const [codeOpen, setCodeOpen] = useState(true)
  const [burst, setBurst] = useState(0)
  const reduced = useReducedMotion()
  const { copied, copy } = useCopyToClipboard()

  const code = useMemo(
    () => (spec ? (tab === 'react' ? toReact(spec) : toHtml(spec)) : ''),
    [spec, tab],
  )

  const handleCopyCode = async () => {
    const ok = await copy(code)
    if (ok && !reduced) setBurst((b) => b + 1)
  }

  return (
    <div className="flex w-full flex-col">
      {/* Browser frame ----------------------------------------------------- */}
      <Panel padding="none" className="overflow-hidden shadow-lift">
        <div className="flex items-center gap-3 border-b border-line bg-bg-sunk px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            <span className="h-2.5 w-2.5 rounded-full bg-sunshine" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3FD08A]" />
          </div>
          <div className="mx-auto flex max-w-[60%] items-center gap-1.5 rounded-full border border-line bg-bg-panel px-3 py-1">
            <Icon
              icon="lucide:lock"
              className="h-3 w-3 text-ink-faint"
              aria-hidden="true"
            />
            <span className="truncate font-sans text-[12px] text-ink-faint">
              yoursite.com
            </span>
          </div>
          {/* keeps the URL pill optically centered against the dots */}
          <div className="w-[52px]" aria-hidden="true" />
        </div>

        <div
          className="relative min-h-[360px] sm:min-h-[440px]"
          aria-busy={loading}
        >
          {loading ? (
            <Skeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : spec ? (
            <PopIn>
              <HeroPreview spec={spec} />
            </PopIn>
          ) : (
            <EmptyState />
          )}
        </div>
      </Panel>

      {/* Code area --------------------------------------------------------- */}
      {spec && !loading && !error && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCodeOpen((o) => !o)}
              aria-expanded={codeOpen}
              aria-controls="hl-code-region"
              className={cx(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-display text-[14px] font-medium',
                'text-ink-soft transition-colors hover:text-ink',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2',
              )}
            >
              <Icon icon="lucide:code-xml" className="h-[18px] w-[18px]" aria-hidden="true" />
              {codeOpen ? 'Hide code' : 'View code'}
              <Icon
                icon="lucide:chevron-down"
                className={cx(
                  'h-4 w-4 transition-transform duration-200 ease-out',
                  codeOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            {source === 'mock' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-dim px-2.5 py-1 font-sans text-[11px] font-medium text-indigo">
                <Icon icon="lucide:flask-conical" className="h-3 w-3" aria-hidden="true" />
                Demo output
              </span>
            )}
          </div>

          <section
            id="hl-code-region"
            aria-label="Generated code"
            hidden={!codeOpen}
            className="mt-3 flex flex-col gap-3"
          >
            <Segmented
              options={CODE_TABS}
              value={tab}
              onChange={setTab}
              ariaLabel="Code format"
            />

            <CodeBlock
              code={code}
              language={tab === 'react' ? 'tsx' : 'html'}
              maxHeight="440px"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="relative inline-flex">
                <Button
                  leadingIcon={copied ? 'lucide:check' : 'lucide:copy'}
                  onClick={handleCopyCode}
                >
                  {copied ? 'Copied' : 'Copy code'}
                </Button>
                <SparkleBurst trigger={burst} count={12} />
              </span>
              <Button
                variant="secondary"
                leadingIcon="lucide:refresh-cw"
                onClick={onRetry}
              >
                Regenerate
              </Button>
            </div>

            <span role="status" aria-live="polite" className="sr-only">
              {copied ? 'Code copied to clipboard' : ''}
            </span>
          </section>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading — a shimmering skeleton shaped like a centered hero.
// ---------------------------------------------------------------------------

function Bar({ className }: { className: string }) {
  return <span className={cx('block rounded-full bg-[#ECECF3]', className)} />
}

function Skeleton() {
  return (
    <div className="relative overflow-hidden px-8 py-14">
      <div className="mx-auto flex max-w-[34rem] flex-col items-center gap-5">
        <Bar className="h-3 w-28" />
        <div className="flex w-full flex-col items-center gap-3">
          <Bar className="h-8 w-[88%]" />
          <Bar className="h-8 w-[64%]" />
        </div>
        <div className="flex w-full flex-col items-center gap-2.5">
          <Bar className="h-4 w-[72%]" />
          <Bar className="h-4 w-[58%]" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Bar className="h-11 w-36" />
          <Bar className="h-11 w-28 bg-[#F1F1F7]" />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="hl-shimmer pointer-events-none absolute inset-0"
      />
      <span className="sr-only" role="status">
        Generating your hero…
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty — a delightful placeholder inviting the user to generate.
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 py-12 text-center sm:min-h-[440px]">
      <span className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-dim">
        <Icon icon="lucide:sparkles" className="h-8 w-8 text-indigo" aria-hidden="true" />
        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-coral" aria-hidden="true" />
        <span className="absolute -bottom-1 -left-1.5 h-2 w-2 rounded-full bg-sunshine" aria-hidden="true" />
      </span>
      <h2 className="font-display text-[20px] font-semibold text-ink">
        Your hero will appear here
      </h2>
      <p className="mt-2 max-w-[22rem] font-sans text-[14px] leading-relaxed text-ink-soft">
        Describe your product and hit{' '}
        <span className="font-medium text-ink">✨ Generate</span> — a polished hero
        with copy-paste code lands right here.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error — a friendly message and a retry.
// ---------------------------------------------------------------------------

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[360px] flex-col items-center justify-center px-8 py-12 text-center sm:min-h-[440px]"
    >
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-coral/10">
        <Icon
          icon="lucide:triangle-alert"
          className="h-8 w-8 text-coral"
          aria-hidden="true"
        />
      </span>
      <h2 className="font-display text-[20px] font-semibold text-ink">
        That didn’t generate
      </h2>
      <p className="mt-2 max-w-[24rem] font-sans text-[14px] leading-relaxed text-ink-soft">
        {message}
      </p>
      {onRetry && (
        <Button
          className="mt-6"
          leadingIcon="lucide:refresh-cw"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
