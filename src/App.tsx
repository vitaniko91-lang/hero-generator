import { useState } from 'react'
import Button from './components/Button'
import Panel from './components/Panel'
import Chip from './components/Chip'
import Segmented from './components/Segmented'
import CodeBlock from './components/CodeBlock'
import PopIn from './components/PopIn'
import SparkleBurst from './components/SparkleBurst'

// TEMPORARY primitives showcase — replaced by the real Hero Lab layout in later
// tasks. Lets the next steps inherit the components and gives us a screenshot.
const PRESETS = ['Minimal', 'Bold', 'Playful', 'Editorial', 'Techy', 'Elegant']

const TONES = [
  { value: 'confident', label: 'Confident' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'premium', label: 'Premium' },
]

const SAMPLE_CODE = `export function Hero() {
  return (
    <section className="bg-white px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        Meal planning that just works
      </h1>
      <p className="mt-4 text-lg text-zinc-500">
        Everything you need to eat well, in one friendly place.
      </p>
      <button className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-white">
        Get started
      </button>
    </section>
  )
}`

function App() {
  const [preset, setPreset] = useState('Playful')
  const [tone, setTone] = useState('friendly')
  const [burst, setBurst] = useState(0)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex items-center gap-1 font-display text-3xl font-bold tracking-tight text-ink">
        <span>Hero Lab</span>
        <span className="text-coral" aria-hidden="true">
          .
        </span>
      </header>

      <PopIn>
        <Panel bordered padding="lg" className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Style preset
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Chip key={p} selected={preset === p} onClick={() => setPreset(p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Tone
            </span>
            <Segmented
              options={TONES}
              value={tone}
              onChange={setTone}
              ariaLabel="Tone"
            />
          </section>

          <section className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Button
                leadingIcon="lucide:sparkles"
                size="lg"
                onClick={() => setBurst((b) => b + 1)}
              >
                Generate
              </Button>
              <SparkleBurst trigger={burst} />
            </div>
            <Button variant="secondary" leadingIcon="lucide:shuffle">
              Surprise me
            </Button>
            <Button variant="ghost" trailingIcon="lucide:arrow-right">
              How it works
            </Button>
          </section>

          <CodeBlock code={SAMPLE_CODE} language="tsx" />
        </Panel>
      </PopIn>
    </main>
  )
}

export default App
