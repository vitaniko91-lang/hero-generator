import PreviewPanel from './components/PreviewPanel'
import { mockGenerate } from './lib/mockGenerate'

// TEMPORARY PreviewPanel demo — replaced by the real Hero Lab layout in G7.
// Renders the populated state (live hero preview + faithful code) so it can be
// screenshotted. To eyeball the other states, swap the props on <PreviewPanel>:
//   loading:  <PreviewPanel spec={null} loading error={null} />
//   error:    <PreviewPanel spec={null} loading={false} error="The model is warming up. Give it another go." onRetry={() => {}} />
//   empty:    <PreviewPanel spec={null} loading={false} error={null} />

const demoSpec = mockGenerate({
  description:
    'A friendly habit tracker that turns tiny daily wins into streaks worth keeping.',
  preset: 'playful',
  tone: 'friendly',
})

function App() {
  return (
    <main className="min-h-screen bg-bg-base px-5 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight text-ink">
          <span>Hero Lab</span>
          <span className="text-coral" aria-hidden="true">
            .
          </span>
        </header>
        <PreviewPanel
          spec={demoSpec}
          loading={false}
          error={null}
          source="mock"
          onRetry={() => {}}
        />
      </div>
    </main>
  )
}

export default App
