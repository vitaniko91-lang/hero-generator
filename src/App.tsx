import { useCallback, useRef, useState } from 'react'
import { generateHero, RateLimitError } from './lib/generate'
import type { GenerateRequest, HeroSpec } from './lib/contract'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import InputPanel from './components/InputPanel'
import PreviewPanel from './components/PreviewPanel'

// Hero Lab — the assembled single-screen tool. Top bar over a two-panel
// workspace (Input → Preview) over the footer. App owns the async generate
// state and threads it into both panels.
function App() {
  const [spec, setSpec] = useState<HeroSpec | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'ai' | 'mock'>('mock')
  // Remembered for Regenerate / Try again — replays the last request verbatim.
  const lastReq = useRef<GenerateRequest | null>(null)

  const handleGenerate = useCallback(async (req: GenerateRequest) => {
    lastReq.current = req
    setLoading(true)
    setError(null)
    try {
      const result = await generateHero(req)
      setSpec(result.spec)
      setSource(result.source)
    } catch (err) {
      // generateHero only throws on a rate limit; every other failure already
      // degraded to a local mock and resolved. So the only error to surface is
      // the friendly "slow down" message (with a generic safety net).
      setError(
        err instanceof RateLimitError
          ? 'Whoa — that’s a lot of heroes at once! Give it a few seconds and try again.'
          : 'Something hiccuped on our end. Give it another go.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRegenerate = useCallback(() => {
    if (lastReq.current) handleGenerate(lastReq.current)
  }, [handleGenerate])

  // Announce settled outcomes; the loading state announces itself from the
  // skeleton's own status region, so we stay quiet during it to avoid double talk.
  const liveStatus = error
    ? 'Generation failed — see the message in the preview.'
    : spec && !loading
      ? 'Your hero is ready.'
      : ''

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <TopBar />

      <main
        id="workspace"
        className="mx-auto w-full max-w-content flex-1 px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        {/* Page intro — the single h1 lives here. */}
        <div className="mb-7 max-w-2xl sm:mb-9">
          <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[32px]">
            Turn a sentence into a hero section.
          </h1>
          <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
            Describe your product, pick a vibe, and copy the React&nbsp;+&nbsp;Tailwind code —
            generated in seconds.
          </p>
        </div>

        {/* Workspace: Input (~40%) left, Preview (~60%) right on lg+; stacked on mobile. */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6">
          <InputPanel onGenerate={handleGenerate} loading={loading} />
          <PreviewPanel
            spec={spec}
            loading={loading}
            error={error}
            onRetry={handleRegenerate}
            source={source}
          />
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {liveStatus}
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default App
