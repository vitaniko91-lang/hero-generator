import InputPanel from './components/InputPanel'
import type { GenerateRequest } from './lib/contract'

// TEMPORARY InputPanel demo — replaced by the real Hero Lab layout in G6–G7.
// Renders the input panel in a centered column on the app background so the
// control surface can be screenshotted in isolation.

function App() {
  const handleGenerate = (req: GenerateRequest) => {
    // eslint-disable-next-line no-console
    console.log('generate', req)
  }

  return (
    <main className="min-h-screen bg-bg-base px-5 py-12">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight text-ink">
          <span>Hero Lab</span>
          <span className="text-coral" aria-hidden="true">
            .
          </span>
        </header>
        <InputPanel onGenerate={handleGenerate} loading={false} />
      </div>
    </main>
  )
}

export default App
