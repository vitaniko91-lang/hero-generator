import type { ReactNode } from 'react'
import type { HeroSpec } from './lib/contract'
import { PRESET_TOKENS } from './lib/presets'
import HeroPreview from './components/HeroPreview'

// TEMPORARY preset showcase — replaced by the real Hero Lab layout in G5–G7.
// Renders HeroPreview for all six presets with believable, style-appropriate
// copy so the range (and distinctness) is visible at a glance.

interface Showcase {
  spec: HeroSpec
  descriptor: string
}

const SHOWCASE: Showcase[] = [
  {
    descriptor: 'Cool white · airy · monochrome · quiet outline CTA',
    spec: {
      preset: 'minimal',
      eyebrow: 'Now in public beta',
      headline: 'Write without the noise',
      subhead:
        'A calm, distraction-free editor that gets out of your way so the words can land.',
      primaryCta: 'Start writing',
      secondaryCta: 'See how it works',
    },
  },
  {
    descriptor: 'Warm near-black · huge geometric type · electric vermillion',
    spec: {
      preset: 'bold',
      eyebrow: 'Ship day, every day',
      headline: 'Deploy in seconds, not Fridays',
      subhead:
        'Push to main and watch it go live worldwide — no YAML archaeology, no pager at 2am.',
      primaryCta: 'Start deploying',
      secondaryCta: 'Read the docs',
    },
  },
  {
    descriptor: 'Soft gradient wash · rounded pills · vivid pink · ambient blobs',
    spec: {
      preset: 'playful',
      eyebrow: 'Hello, good habits',
      headline: 'Tiny habits that actually stick',
      subhead:
        'Friendly nudges, cheerful streaks, and a little confetti when you show up. A better day, one tap at a time.',
      primaryCta: 'Get started free',
      secondaryCta: 'Take the tour',
    },
  },
  {
    descriptor: 'Warm paper · Georgia serif · terracotta · asymmetric rule',
    spec: {
      preset: 'editorial',
      eyebrow: 'The Quarterly',
      headline: 'Journalism worth slowing down for',
      subhead:
        'Long reads, original reporting, and essays from writers we trust — delivered every Sunday morning.',
      primaryCta: 'Subscribe',
      secondaryCta: 'Browse the archive',
    },
  },
  {
    descriptor: 'Dark navy · mono label · electric cyan · faint grid · sharp',
    spec: {
      preset: 'techy',
      eyebrow: 'introducing v2',
      headline: 'Observability that speaks your stack',
      subhead:
        'Traces, logs, and metrics in one query language. Instrument once, debug anything, ship with confidence.',
      primaryCta: 'Read the quickstart',
      secondaryCta: 'View on GitHub',
    },
  },
  {
    descriptor: 'Deep emerald · fine wide-tracked sans · muted gold · hairline frame',
    spec: {
      preset: 'elegant',
      eyebrow: 'Maison Lumière',
      headline: 'The art of the unhurried morning',
      subhead:
        'Considered skincare, made in small batches from botanicals we source by hand. Quiet luxury for everyday ritual.',
      primaryCta: 'Discover the collection',
      secondaryCta: 'Our story',
    },
  },
]

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="flex h-9 items-center gap-2 border-b border-line bg-bg-sunk px-4">
        <span className="h-3 w-3 rounded-full bg-[#FF6B5C]" />
        <span className="h-3 w-3 rounded-full bg-[#FFC44D]" />
        <span className="h-3 w-3 rounded-full bg-[#3FD08A]" />
        <span className="ml-3 h-4 flex-1 max-w-[260px] rounded bg-white/70" />
      </div>
      {children}
    </div>
  )
}

function App() {
  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-1 font-display text-3xl font-bold tracking-tight text-ink">
          <span>Hero Lab</span>
          <span className="text-coral" aria-hidden="true">
            .
          </span>
        </div>
        <p className="max-w-xl font-sans text-[15px] text-ink-soft">
          Six curated output styles. Each preset is its own little design system —
          tasteful, and built to look nothing like the others.
        </p>
      </header>

      {SHOWCASE.map(({ spec, descriptor }) => (
        <section key={spec.preset} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">
              {PRESET_TOKENS[spec.preset].label}
            </h2>
            <span className="font-sans text-[12px] text-ink-faint">
              {descriptor}
            </span>
          </div>
          <BrowserFrame>
            <HeroPreview spec={spec} />
          </BrowserFrame>
        </section>
      ))}
    </main>
  )
}

export default App
