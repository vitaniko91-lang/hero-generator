import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { cx } from '../lib/cx'
import { popSpring } from '../lib/motion'
import { useReducedMotion } from '../lib/useReducedMotion'
import {
  PRESETS,
  TONES,
  type GenerateRequest,
  type Preset,
  type Tone,
} from '../lib/contract'
import { PRESET_TOKENS } from '../lib/presets'
import Panel from './Panel'
import Button from './Button'
import Chip from './Chip'
import Segmented from './Segmented'
import type { SegmentedOption } from './Segmented'

interface InputPanelProps {
  onGenerate: (req: GenerateRequest) => void
  loading: boolean
}

const MAX_CHARS = 600
// Warn when the counter gets close — gentle nudge, not a hard block.
const WARN_AT = Math.round(MAX_CHARS * 0.9)

// Short label (what the chip shows) + the full prompt it autofills.
const EXAMPLES: { label: string; text: string }[] = [
  {
    label: 'AI note-taker',
    text: 'An AI note-taker that records meetings and turns them into searchable, shareable summaries.',
  },
  {
    label: 'DTC skincare brand',
    text: 'A direct-to-consumer skincare brand making small-batch botanical serums for sensitive skin.',
  },
  {
    label: 'Dev observability tool',
    text: 'A developer observability platform that unifies traces, logs, and metrics behind one query language.',
  },
  {
    label: 'Habit tracker',
    text: 'A friendly habit tracker that turns tiny daily wins into streaks worth keeping.',
  },
]

// Curated accent options. Hex literals double as the swatch fill and the value
// emitted on the request, so the generated hero can honour the user's pick.
const SWATCHES: { name: string; hex: string }[] = [
  { name: 'Indigo', hex: '#5B4DF0' },
  { name: 'Coral', hex: '#FF6B5C' },
  { name: 'Emerald', hex: '#3FD08A' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Black', hex: '#18181B' },
]

const TONE_OPTIONS: SegmentedOption<Tone>[] = TONES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}))

const FIELD_LABEL = 'font-sans text-[13px] font-medium text-ink'

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

function buildRequest(o: {
  description: string
  preset?: Preset
  tone: Tone
  accent?: string
}): GenerateRequest {
  const req: GenerateRequest = { description: o.description, tone: o.tone }
  if (o.preset) req.preset = o.preset
  if (o.accent) req.accent = o.accent
  return req
}

// A small springy action button used for the example prompts — an *action*
// (autofills the textarea), so plain button semantics, not the aria-pressed Chip.
function ExampleButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: string
}) {
  const reduced = useReducedMotion()
  const gestures = reduced
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.93 }, transition: popSpring }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      {...gestures}
      className={cx(
        'rounded-full border border-line bg-bg-panel px-3 py-1.5 font-sans text-[12px]',
        'font-medium text-ink-soft select-none transition-colors',
        'hover:border-indigo/40 hover:bg-indigo-dim hover:text-indigo',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2',
      )}
    >
      {children}
    </motion.button>
  )
}

// A round colour swatch (or the "Auto" / no-accent option). Real button with
// aria-pressed + a descriptive aria-label, springy on press.
function Swatch({
  hex,
  name,
  ariaLabel,
  selected,
  onClick,
}: {
  hex?: string
  name: string
  ariaLabel: string
  selected: boolean
  onClick: () => void
}) {
  const reduced = useReducedMotion()
  const gestures = reduced
    ? {}
    : { whileHover: { scale: 1.12 }, whileTap: { scale: 0.9 }, transition: popSpring }
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      title={name}
      onClick={onClick}
      {...gestures}
      className={cx(
        'relative grid h-8 w-8 place-items-center rounded-full border border-black/10 select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2',
        selected && 'ring-2 ring-indigo ring-offset-2 ring-offset-bg-panel',
      )}
      style={hex ? { backgroundColor: hex } : undefined}
    >
      {/* "Auto" swatch: white with a diagonal slash so it reads as "none/let it decide". */}
      {!hex && (
        <span aria-hidden="true" className="relative block h-8 w-8 overflow-hidden rounded-full bg-bg-panel">
          <span className="absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink-faint" />
        </span>
      )}
      {/* Checkmark for selected coloured swatches (Auto shows the ring only). */}
      {selected && hex && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 drop-shadow"
          fill="none"
          stroke="#fff"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </motion.button>
  )
}

// The Input panel owns the control state and emits a GenerateRequest. The
// description is the only required field; preset (undefined = "let AI pick") and
// accent (undefined = "let the style decide") are optional biases.
export default function InputPanel({ onGenerate, loading }: InputPanelProps) {
  const [description, setDescription] = useState('')
  const [preset, setPreset] = useState<Preset | undefined>(undefined)
  const [tone, setTone] = useState<Tone>('confident')
  const [accent, setAccent] = useState<string | undefined>(undefined)

  const trimmed = description.trim()
  const canGenerate = trimmed.length > 0 && !loading
  const count = description.length
  const nearLimit = count >= WARN_AT

  const handleGenerate = () => {
    if (!canGenerate) return
    onGenerate(buildRequest({ description: trimmed, preset, tone, accent }))
  }

  // Surprise me: random example + random preset/tone, then fire immediately.
  const handleSurprise = () => {
    if (loading) return
    const ex = pick(EXAMPLES)
    const p = pick(PRESETS)
    const t = pick(TONES)
    setDescription(ex.text)
    setPreset(p)
    setTone(t)
    onGenerate(buildRequest({ description: ex.text, preset: p, tone: t, accent }))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <Panel as="section" padding="lg" bordered className="flex flex-col gap-6">
      {/* Description -------------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="hl-desc" className={FIELD_LABEL}>
            Describe your product
          </label>
          <span
            id="hl-desc-count"
            className={cx(
              'font-sans text-[12px] font-medium tabular-nums transition-colors',
              nearLimit ? 'text-coral-ink' : 'text-ink-faint',
            )}
          >
            {count}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          id="hl-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_CHARS}
          rows={4}
          placeholder="e.g. A calendar app that auto-schedules deep-work blocks around your meetings"
          aria-describedby="hl-desc-count hl-desc-hint"
          className={cx(
            'w-full resize-y rounded-lg border border-transparent bg-bg-sunk px-4 py-3',
            'font-sans text-[15px] leading-relaxed text-ink placeholder:text-ink-faint',
            'transition-colors focus:border-indigo/40',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2',
          )}
        />
        <span id="hl-desc-hint" className="sr-only">
          Press Command or Control plus Enter to generate.
        </span>
      </div>

      {/* Example prompts --------------------------------------------------- */}
      <div role="group" aria-labelledby="hl-examples-label" className="flex flex-col gap-2">
        <span id="hl-examples-label" className={FIELD_LABEL}>Try an example</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <ExampleButton key={ex.label} onClick={() => setDescription(ex.text)}>
              {ex.label}
            </ExampleButton>
          ))}
        </div>
      </div>

      {/* Style presets ----------------------------------------------------- */}
      <div role="group" aria-labelledby="hl-style-label" className="flex flex-col gap-2">
        <span id="hl-style-label" className={FIELD_LABEL}>
          Style
        </span>
        <div className="flex flex-wrap gap-2">
          <Chip selected={preset === undefined} onClick={() => setPreset(undefined)}>
            Let AI pick
          </Chip>
          {PRESETS.map((p) => (
            <Chip key={p} selected={preset === p} onClick={() => setPreset(p)}>
              {PRESET_TOKENS[p].label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Tone -------------------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <span className={FIELD_LABEL}>Tone</span>
        <Segmented
          options={TONE_OPTIONS}
          value={tone}
          onChange={setTone}
          ariaLabel="Tone"
          className="w-full"
        />
      </div>

      {/* Accent colour ----------------------------------------------------- */}
      <div role="group" aria-labelledby="hl-accent-label" className="flex flex-col gap-2">
        <span id="hl-accent-label" className={FIELD_LABEL}>
          Accent color
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <Swatch
            name="Auto"
            ariaLabel="No accent, let the style decide"
            selected={!accent}
            onClick={() => setAccent(undefined)}
          />
          {SWATCHES.map((s) => (
            <Swatch
              key={s.hex}
              hex={s.hex}
              name={s.name}
              ariaLabel={`${s.name} accent`}
              selected={!!accent && accent.toLowerCase() === s.hex.toLowerCase()}
              onClick={() => setAccent(s.hex)}
            />
          ))}
          {/* Custom colour — native picker behind a rainbow well. */}
          <label
            title="Custom color"
            className={cx(
              'relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full',
              'border border-black/10 focus-within:outline focus-within:outline-2',
              'focus-within:outline-indigo focus-within:outline-offset-2',
            )}
            style={{
              background:
                'conic-gradient(from 0deg, #FF6B5C, #FFC44D, #3FD08A, #3B82F6, #5B4DF0, #EC4899, #FF6B5C)',
            }}
          >
            <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-bg-panel text-[10px] text-ink-soft">
              +
            </span>
            <input
              type="color"
              value={accent ?? '#5B4DF0'}
              onChange={(e) => setAccent(e.target.value)}
              aria-label="Custom accent color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      {/* Actions ----------------------------------------------------------- */}
      <div className="flex flex-col gap-2.5 pt-1">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!canGenerate}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Generating…
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span>
              Generate
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={handleSurprise}
          disabled={loading}
          className="w-full"
        >
          Surprise me
        </Button>
      </div>
    </Panel>
  )
}
