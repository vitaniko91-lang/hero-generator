import type { CSSProperties, ReactNode } from 'react'
import type { HeroSpec } from '../lib/contract'
import { PRESET_TOKENS, readableOn, alpha } from '../lib/presets'
import type { PresetTokens } from '../lib/presets'

interface HeroPreviewProps {
  spec: HeroSpec
  className?: string
}

// Live hero renderer. Turns a HeroSpec + chosen preset into a complete,
// self-contained hero band: eyebrow · headline · subhead · CTAs, styled
// entirely from PRESET_TOKENS via inline `style` (colors + fonts) so the look
// is portable to generated code. Sizes use `clamp()` with `cqi`, and the root
// declares a size container, so the band scales fluidly to its width (~600–900px
// in the preview frame, and smaller).
//
// This renders INSIDE the tool, so the headline is a `role="heading"` element
// (not an <h1>) to avoid clashing with the page's own heading outline, and the
// CTAs are inert visual artifacts (`tabIndex=-1`, `aria-hidden`) kept out of the
// tool's tab order and accessibility tree.
export default function HeroPreview({ spec, className }: HeroPreviewProps) {
  const t = PRESET_TOKENS[spec.preset]

  // Accent override: a spec-supplied accent wins, and we recompute legible
  // on-accent text for it; otherwise we use the preset's curated pairing.
  const accent = spec.accent ?? t.accent
  const onAccent = spec.accent ? readableOn(spec.accent) : t.accentText

  const center = t.align === 'center'

  const rootStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    background: t.bg,
    color: t.surfaceText,
    containerType: 'inline-size',
    isolation: 'isolate',
  }

  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    minHeight: t.minHeight,
    padding: t.sectionPadding,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: center ? 'center' : 'flex-start',
    textAlign: center ? 'center' : 'left',
  }

  const columnStyle: CSSProperties = {
    width: '100%',
    maxWidth: t.contentMaxWidth,
    display: 'flex',
    flexDirection: 'column',
    alignItems: center ? 'center' : 'flex-start',
  }

  const textGroupStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: center ? 'center' : 'flex-start',
    gap: t.blockGap,
    width: '100%',
  }

  const ctaRowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: t.ctaGap,
    alignItems: 'center',
    justifyContent: center ? 'center' : 'flex-start',
  }

  const { primaryStyle, secondaryStyle } = buttonStyles(t, accent, onAccent)
  const secondaryUnderline = t.secondaryStyle === 'ghost-underline'

  const buttonBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: 'default',
    fontFamily: t.buttonFont,
  }

  return (
    <div className={className} style={rootStyle}>
      <Decoration tokens={t} accent={accent} />

      <div style={contentStyle}>
        <div style={columnStyle}>
          <div style={textGroupStyle}>
            {spec.eyebrow && (
              <Eyebrow tokens={t} accent={accent} center={center}>
                {spec.eyebrow}
              </Eyebrow>
            )}

            <div
              role="heading"
              aria-level={2}
              className={t.headingClassName}
              style={{
                margin: 0,
                fontFamily: t.headingFont,
                fontSize: t.headingSize,
                color: t.surfaceText,
                maxWidth: t.contentMaxWidth,
              }}
            >
              {spec.headline}
            </div>

            {spec.subhead && (
              <p
                className={t.bodyClassName}
                style={{
                  margin: 0,
                  fontFamily: t.bodyFont,
                  fontSize: t.subheadSize,
                  color: t.mutedText,
                  maxWidth: t.subheadMaxWidth,
                }}
              >
                {spec.subhead}
              </p>
            )}
          </div>

          <div style={ctaRowStyle}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className={t.buttonClassName}
              style={{ ...buttonBase, ...primaryStyle }}
            >
              {spec.primaryCta}
            </button>

            {spec.secondaryCta && (
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={t.secondaryButtonClassName}
                style={{ ...buttonBase, ...secondaryStyle }}
              >
                {spec.secondaryCta}
                {secondaryUnderline && (
                  <span style={{ marginLeft: '0.4em' }}>&rarr;</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Buttons — colors resolved from the composition switch (+ accent override).
// ---------------------------------------------------------------------------

function buttonStyles(
  t: PresetTokens,
  accent: string,
  onAccent: string,
): { primaryStyle: CSSProperties; secondaryStyle: CSSProperties } {
  let primaryStyle: CSSProperties
  switch (t.primaryStyle) {
    case 'fill-accent':
      primaryStyle = { background: accent, color: onAccent, border: 'none' }
      break
    case 'fill-ink':
      primaryStyle = {
        background: t.surfaceText,
        color: t.surfaceSolid,
        border: 'none',
      }
      break
    case 'outline':
      primaryStyle = {
        background: 'transparent',
        color: t.surfaceText,
        border: `1.5px solid ${t.surfaceText}`,
      }
      break
  }
  primaryStyle.borderRadius = t.radius

  let secondaryStyle: CSSProperties
  switch (t.secondaryStyle) {
    case 'outline-soft':
      secondaryStyle = {
        background: 'transparent',
        color: t.surfaceText,
        border: `1px solid ${alpha(t.surfaceText, 0.28)}`,
        borderRadius: t.radius,
      }
      break
    case 'pill-soft':
      secondaryStyle = {
        background: '#FFFFFF',
        color: t.surfaceText,
        border: `1px solid ${alpha(t.surfaceText, 0.08)}`,
        borderRadius: t.radius,
        boxShadow: '0 1px 2px rgba(20,16,40,.06), 0 8px 20px rgba(20,16,40,.08)',
      }
      break
    case 'hairline':
      secondaryStyle = {
        background: 'transparent',
        color: accent,
        border: `1px solid ${alpha(accent, 0.55)}`,
        borderRadius: t.radius,
      }
      break
    case 'ghost-underline':
      secondaryStyle = {
        background: 'transparent',
        color: accent,
        border: 'none',
        borderRadius: 0,
        paddingLeft: 0,
        paddingRight: 0,
        borderBottom: `1.5px solid ${alpha(accent, 0.45)}`,
      }
      break
  }

  return { primaryStyle, secondaryStyle }
}

// ---------------------------------------------------------------------------
// Eyebrow — four treatments (plain / chip / ruled / mono).
// ---------------------------------------------------------------------------

function Eyebrow({
  tokens: t,
  accent,
  center,
  children,
}: {
  tokens: PresetTokens
  accent: string
  center: boolean
  children: ReactNode
}) {
  const base: CSSProperties = {
    fontFamily: t.eyebrowFont,
    fontSize: t.eyebrowSize,
    color: accent,
  }

  switch (t.eyebrowVariant) {
    case 'chip':
      return (
        <span
          className={t.eyebrowClassName}
          style={{
            ...base,
            display: 'inline-block',
            background: alpha(accent, 0.13),
            padding: '6px 14px',
            borderRadius: '999px',
          }}
        >
          {children}
        </span>
      )
    case 'mono':
      return (
        <span className={t.eyebrowClassName} style={base}>
          <span style={{ color: t.mutedText }}>{'// '}</span>
          {children}
        </span>
      )
    case 'ruled':
      return (
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: center ? 'center' : 'flex-start',
            gap: '14px',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: '44px', height: '1px', background: accent }}
          />
          <span className={t.eyebrowClassName} style={base}>
            {children}
          </span>
        </span>
      )
    case 'plain':
    default:
      return (
        <span className={t.eyebrowClassName} style={base}>
          {children}
        </span>
      )
  }
}

// ---------------------------------------------------------------------------
// Decoration — static ambient layer (no looping animation, reduced-motion safe).
// ---------------------------------------------------------------------------

function Decoration({ tokens: t, accent }: { tokens: PresetTokens; accent: string }) {
  const layer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
  }

  switch (t.decoration) {
    case 'glow':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              top: '-25%',
              left: '-8%',
              width: '58%',
              height: '130%',
              background: `radial-gradient(circle at 32% 42%, ${alpha(accent, 0.24)}, transparent 62%)`,
              filter: 'blur(24px)',
            }}
          />
        </div>
      )
    case 'blob':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              top: '-22%',
              right: '-12%',
              width: '46%',
              height: '70%',
              background: `radial-gradient(circle, ${alpha(accent, 0.3)}, transparent 66%)`,
              filter: 'blur(28px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-26%',
              left: '-14%',
              width: '48%',
              height: '72%',
              background:
                'radial-gradient(circle, rgba(150,130,255,0.28), transparent 66%)',
              filter: 'blur(30px)',
            }}
          />
        </div>
      )
    case 'grid':
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.05)} 1px, transparent 1px)`,
            backgroundSize: '34px 34px',
            maskImage:
              'radial-gradient(120% 100% at 28% 26%, black 0%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(120% 100% at 28% 26%, black 0%, transparent 78%)',
          }}
        />
      )
    case 'frame':
      return (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 'clamp(16px, 3cqi, 30px)',
            zIndex: 0,
            pointerEvents: 'none',
            border: `1px solid ${alpha(accent, 0.42)}`,
            borderRadius: t.radius,
          }}
        />
      )
    case 'none':
    default:
      return null
  }
}
