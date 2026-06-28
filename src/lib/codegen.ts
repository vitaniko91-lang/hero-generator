// Hero Lab code generators.
//
// `toReact(spec)` and `toHtml(spec)` turn a HeroSpec into clean, copy-paste,
// self-contained code that FAITHFULLY reproduces what <HeroPreview /> renders for
// the same spec.
//
// Approach — INLINE STYLES (not Tailwind utility classes).
// HeroPreview itself styles the hero almost entirely via inline `style`: dynamic
// colors, gradient backgrounds, font stacks, `clamp()` sizes in `cqi` units,
// `container-type`, and radial-gradient decoration layers. None of those map
// cleanly to portable Tailwind classes, and the structural look depends on them.
// Emitting the same inline styles guarantees the exported code is (a) pixel-faithful
// to the preview and (b) self-contained — it needs no Tailwind config, no extra CSS,
// and pastes anywhere. The few structural Tailwind tokens HeroPreview leans on
// (font-weight / tracking / leading / button padding) are translated to inline CSS
// by `twToStyle`, so nothing silently breaks outside a Tailwind project.
//
// Differences from the in-tool preview, by design: the exported hero uses a real
// <h1> (it IS the page's hero) and real <a href="#"> CTAs (instead of the inert,
// aria-hidden artifacts HeroPreview renders to stay out of the tool's a11y tree).

import { PRESET_TOKENS, readableOn, alpha } from './presets'
import type { PresetTokens } from './presets'
import type { HeroSpec } from './contract'

// ---------------------------------------------------------------------------
// Style model — a plain CSS object map shared by both serializers.
// ---------------------------------------------------------------------------

type Style = Record<string, string | number>

const FONT_WEIGHTS: Record<string, number> = {
  'font-thin': 100,
  'font-extralight': 200,
  'font-light': 300,
  'font-normal': 400,
  'font-medium': 500,
  'font-semibold': 600,
  'font-bold': 700,
  'font-extrabold': 800,
  'font-black': 900,
}

/** Tailwind spacing unit → rem string (1 unit = 0.25rem). */
function rem(units: number): string {
  return `${+(units * 0.25).toFixed(4)}rem`
}

/**
 * Translate the small, known set of structural Tailwind utilities that the preset
 * tokens use (weight / tracking / leading / transform / button size + padding)
 * into inline CSS, so the exported code carries the same look without Tailwind.
 */
function twToStyle(classes: string): Style {
  const style: Style = {}
  for (const token of classes.split(/\s+/).filter(Boolean)) {
    if (token in FONT_WEIGHTS) {
      style.fontWeight = FONT_WEIGHTS[token]
      continue
    }
    if (token === 'uppercase') {
      style.textTransform = 'uppercase'
      continue
    }
    let m: RegExpMatchArray | null
    if ((m = token.match(/^tracking-\[(.+)\]$/))) style.letterSpacing = m[1]
    else if ((m = token.match(/^leading-\[(.+)\]$/))) style.lineHeight = Number(m[1])
    else if ((m = token.match(/^text-\[(.+)\]$/))) style.fontSize = m[1]
    else if ((m = token.match(/^px-([\d.]+)$/))) {
      const v = rem(Number(m[1]))
      style.paddingLeft = v
      style.paddingRight = v
    } else if ((m = token.match(/^py-([\d.]+)$/))) {
      const v = rem(Number(m[1]))
      style.paddingTop = v
      style.paddingBottom = v
    } else if ((m = token.match(/^p-([\d.]+)$/))) {
      style.padding = rem(Number(m[1]))
    }
  }
  return style
}

// ---------------------------------------------------------------------------
// Button color resolution — mirrors HeroPreview.buttonStyles exactly.
// ---------------------------------------------------------------------------

function primaryColor(t: PresetTokens, accent: string, onAccent: string): Style {
  let s: Style
  switch (t.primaryStyle) {
    case 'fill-accent':
      s = { background: accent, color: onAccent, border: 'none' }
      break
    case 'fill-ink':
      s = { background: t.surfaceText, color: t.surfaceSolid, border: 'none' }
      break
    case 'outline':
      s = {
        background: 'transparent',
        color: t.surfaceText,
        border: `1.5px solid ${t.surfaceText}`,
      }
      break
  }
  s.borderRadius = t.radius
  return s
}

function secondaryColor(t: PresetTokens, accent: string): Style {
  switch (t.secondaryStyle) {
    case 'outline-soft':
      return {
        background: 'transparent',
        color: t.surfaceText,
        border: `1px solid ${alpha(t.surfaceText, 0.28)}`,
        borderRadius: t.radius,
      }
    case 'pill-soft':
      return {
        background: '#FFFFFF',
        color: t.surfaceText,
        border: `1px solid ${alpha(t.surfaceText, 0.08)}`,
        borderRadius: t.radius,
        boxShadow: '0 1px 2px rgba(20,16,40,.06), 0 8px 20px rgba(20,16,40,.08)',
      }
    case 'hairline':
      return {
        background: 'transparent',
        color: accent,
        border: `1px solid ${alpha(accent, 0.55)}`,
        borderRadius: t.radius,
      }
    case 'ghost-underline':
      return {
        background: 'transparent',
        color: accent,
        border: 'none',
        borderRadius: 0,
        paddingLeft: 0,
        paddingRight: 0,
        borderBottom: `1.5px solid ${alpha(accent, 0.45)}`,
      }
  }
}

// ---------------------------------------------------------------------------
// Decoration layers — flattened to absolutely-positioned leaf divs (z-index 0,
// behind the z-index-1 content), reproducing HeroPreview.Decoration faithfully.
// ---------------------------------------------------------------------------

function decorationLayers(t: PresetTokens, accent: string): Style[] {
  const base: Style = { position: 'absolute', zIndex: 0, pointerEvents: 'none' }
  switch (t.decoration) {
    case 'glow':
      return [
        {
          ...base,
          top: '-25%',
          left: '-8%',
          width: '58%',
          height: '130%',
          background: `radial-gradient(circle at 32% 42%, ${alpha(accent, 0.24)}, transparent 62%)`,
          filter: 'blur(24px)',
        },
      ]
    case 'blob':
      return [
        {
          ...base,
          top: '-22%',
          right: '-12%',
          width: '46%',
          height: '70%',
          background: `radial-gradient(circle, ${alpha(accent, 0.3)}, transparent 66%)`,
          filter: 'blur(28px)',
        },
        {
          ...base,
          bottom: '-26%',
          left: '-14%',
          width: '48%',
          height: '72%',
          background: 'radial-gradient(circle, rgba(150,130,255,0.28), transparent 66%)',
          filter: 'blur(30px)',
        },
      ]
    case 'grid':
      return [
        {
          ...base,
          inset: 0,
          backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.05)} 1px, transparent 1px)`,
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(120% 100% at 28% 26%, black 0%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(120% 100% at 28% 26%, black 0%, transparent 78%)',
        },
      ]
    case 'frame':
      return [
        {
          ...base,
          inset: 'clamp(16px, 3cqi, 30px)',
          border: `1px solid ${alpha(accent, 0.42)}`,
          borderRadius: t.radius,
        },
      ]
    case 'none':
    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// Resolved hero model.
// ---------------------------------------------------------------------------

type EyebrowModel =
  | { kind: 'plain' | 'chip'; text: string; style: Style }
  | { kind: 'mono'; text: string; style: Style; prefixStyle: Style }
  | {
      kind: 'ruled'
      text: string
      style: Style
      wrapStyle: Style
      ruleStyle: Style
    }

interface HeroModel {
  root: Style
  decorations: Style[]
  content: Style
  column: Style
  textGroup: Style
  eyebrow: EyebrowModel | null
  heading: { text: string; style: Style }
  subhead: { text: string; style: Style } | null
  ctaRow: Style
  primary: { text: string; style: Style }
  secondary: { text: string; style: Style; underline: boolean } | null
}

function buildHero(spec: HeroSpec): HeroModel {
  const t = PRESET_TOKENS[spec.preset]
  const accent = spec.accent ?? t.accent
  const onAccent = spec.accent ? readableOn(spec.accent) : t.accentText
  const center = t.align === 'center'
  const alignItems = center ? 'center' : 'flex-start'

  const root: Style = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    background: t.bg,
    color: t.surfaceText,
    containerType: 'inline-size',
    isolation: 'isolate',
  }

  const content: Style = {
    position: 'relative',
    zIndex: 1,
    minHeight: t.minHeight,
    padding: t.sectionPadding,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems,
    textAlign: center ? 'center' : 'left',
  }

  const column: Style = {
    width: '100%',
    maxWidth: t.contentMaxWidth,
    display: 'flex',
    flexDirection: 'column',
    alignItems,
  }

  const textGroup: Style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    gap: t.blockGap,
    width: '100%',
  }

  const ctaRow: Style = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: t.ctaGap,
    alignItems: 'center',
    justifyContent: center ? 'center' : 'flex-start',
  }

  const heading = {
    text: spec.headline,
    style: {
      ...twToStyle(t.headingClassName),
      margin: 0,
      fontFamily: t.headingFont,
      fontSize: t.headingSize,
      color: t.surfaceText,
      maxWidth: t.contentMaxWidth,
    } as Style,
  }

  const subhead = spec.subhead
    ? {
        text: spec.subhead,
        style: {
          ...twToStyle(t.bodyClassName),
          margin: 0,
          fontFamily: t.bodyFont,
          fontSize: t.subheadSize,
          color: t.mutedText,
          maxWidth: t.subheadMaxWidth,
        } as Style,
      }
    : null

  const buttonBase: Style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: t.buttonFont,
  }

  const primary = {
    text: spec.primaryCta,
    style: {
      ...buttonBase,
      ...twToStyle(t.buttonClassName),
      ...primaryColor(t, accent, onAccent),
    } as Style,
  }

  const secondary = spec.secondaryCta
    ? {
        text: spec.secondaryCta,
        underline: t.secondaryStyle === 'ghost-underline',
        style: {
          ...buttonBase,
          ...twToStyle(t.secondaryButtonClassName),
          ...secondaryColor(t, accent),
        } as Style,
      }
    : null

  const eyebrow = spec.eyebrow
    ? buildEyebrow(t, accent, alignItems, spec.eyebrow)
    : null

  return {
    root,
    decorations: decorationLayers(t, accent),
    content,
    column,
    textGroup,
    eyebrow,
    heading,
    subhead,
    ctaRow,
    primary,
    secondary,
  }
}

function buildEyebrow(
  t: PresetTokens,
  accent: string,
  alignItems: string,
  text: string,
): EyebrowModel {
  const labelStyle: Style = {
    ...twToStyle(t.eyebrowClassName),
    fontFamily: t.eyebrowFont,
    fontSize: t.eyebrowSize,
    color: accent,
  }

  switch (t.eyebrowVariant) {
    case 'chip':
      return {
        kind: 'chip',
        text,
        style: {
          ...labelStyle,
          display: 'inline-block',
          background: alpha(accent, 0.13),
          padding: '6px 14px',
          borderRadius: '999px',
        },
      }
    case 'mono':
      return {
        kind: 'mono',
        text,
        style: labelStyle,
        prefixStyle: { color: t.mutedText },
      }
    case 'ruled':
      return {
        kind: 'ruled',
        text,
        style: labelStyle,
        wrapStyle: {
          display: 'flex',
          flexDirection: 'column',
          alignItems,
          gap: '14px',
        },
        ruleStyle: { width: '44px', height: '1px', background: accent },
      }
    case 'plain':
    default:
      return { kind: 'plain', text, style: labelStyle }
  }
}

// ---------------------------------------------------------------------------
// Text escaping.
// ---------------------------------------------------------------------------

/** Escape user copy for JSX text: &, <, >, and the JSX expression braces { }. */
function escJsx(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

/** Escape user copy for HTML text content: &, <, >. */
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ---------------------------------------------------------------------------
// Style serializers.
// ---------------------------------------------------------------------------

function jsxValue(v: string | number): string {
  return typeof v === 'number' ? String(v) : JSON.stringify(v)
}

/** A JSX `style={{ ... }}` literal, multi-line, indented to `pad`. */
function jsxStyle(style: Style, pad: string): string {
  const lines = Object.entries(style)
    .map(([k, v]) => `${pad}  ${k}: ${jsxValue(v)},`)
    .join('\n')
  return `{{\n${lines}\n${pad}}}`
}

function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

/** An inline `style="..."` value string for HTML. */
function cssText(style: Style): string {
  return Object.entries(style)
    .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
    .join(' ')
}

// ---------------------------------------------------------------------------
// React serializer.
// ---------------------------------------------------------------------------

export function toReact(spec: HeroSpec): string {
  const h = buildHero(spec)

  const deco = h.decorations
    .map((d) => `      <div aria-hidden="true" style=${jsxStyle(d, '      ')} />`)
    .join('\n')

  const eyebrow = h.eyebrow ? jsxEyebrow(h.eyebrow) : ''

  const subhead = h.subhead
    ? `            <p style=${jsxStyle(h.subhead.style, '            ')}>\n              ${escJsx(h.subhead.text)}\n            </p>`
    : ''

  const secondary = h.secondary
    ? `            <a href="#" style=${jsxStyle(h.secondary.style, '            ')}>\n              ${escJsx(h.secondary.text)}${h.secondary.underline ? ' <span style={{ marginLeft: "0.4em" }}>→</span>' : ''}\n            </a>`
    : ''

  const textChildren = [
    eyebrow,
    `            <h1 style=${jsxStyle(h.heading.style, '            ')}>\n              ${escJsx(h.heading.text)}\n            </h1>`,
    subhead,
  ]
    .filter(Boolean)
    .join('\n')

  const ctaChildren = [
    `            <a href="#" style=${jsxStyle(h.primary.style, '            ')}>\n              ${escJsx(h.primary.text)}\n            </a>`,
    secondary,
  ]
    .filter(Boolean)
    .join('\n')

  return `// Hero section generated by Hero Lab.
// Self-contained — no Tailwind or extra CSS required. For the intended fonts, load
// 'Space Grotesk', 'Plus Jakarta Sans', and 'JetBrains Mono' from Google Fonts;
// it falls back to system fonts otherwise.
export default function Hero() {
  return (
    <section style=${jsxStyle(h.root, '    ')}>
${deco ? deco + '\n' : ''}      <div style=${jsxStyle(h.content, '      ')}>
        <div style=${jsxStyle(h.column, '        ')}>
          <div style=${jsxStyle(h.textGroup, '          ')}>
${textChildren}
          </div>
          <div style=${jsxStyle(h.ctaRow, '          ')}>
${ctaChildren}
          </div>
        </div>
      </div>
    </section>
  )
}
`
}

function jsxEyebrow(e: EyebrowModel): string {
  const p = '            '
  switch (e.kind) {
    case 'plain':
    case 'chip':
      return `${p}<span style=${jsxStyle(e.style, p)}>\n${p}  ${escJsx(e.text)}\n${p}</span>`
    case 'mono':
      return `${p}<span style=${jsxStyle(e.style, p)}>\n${p}  <span style=${jsxStyle(e.prefixStyle, p + '  ')}>{"// "}</span>${escJsx(e.text)}\n${p}</span>`
    case 'ruled':
      return `${p}<span style=${jsxStyle(e.wrapStyle, p)}>\n${p}  <span aria-hidden="true" style=${jsxStyle(e.ruleStyle, p + '  ')} />\n${p}  <span style=${jsxStyle(e.style, p + '  ')}>${escJsx(e.text)}</span>\n${p}</span>`
  }
}

// ---------------------------------------------------------------------------
// HTML serializer.
// ---------------------------------------------------------------------------

export function toHtml(spec: HeroSpec): string {
  const h = buildHero(spec)

  const deco = h.decorations
    .map((d) => `  <div aria-hidden="true" style="${cssText(d)}"></div>`)
    .join('\n')

  const eyebrow = h.eyebrow ? htmlEyebrow(h.eyebrow) : ''

  const subhead = h.subhead
    ? `        <p style="${cssText(h.subhead.style)}">${escHtml(h.subhead.text)}</p>`
    : ''

  const secondary = h.secondary
    ? `        <a href="#" style="${cssText(h.secondary.style)}">${escHtml(h.secondary.text)}${h.secondary.underline ? ' <span style="margin-left: 0.4em;">&rarr;</span>' : ''}</a>`
    : ''

  const textChildren = [
    eyebrow,
    `        <h1 style="${cssText(h.heading.style)}">${escHtml(h.heading.text)}</h1>`,
    subhead,
  ]
    .filter(Boolean)
    .join('\n')

  const ctaChildren = [
    `        <a href="#" style="${cssText(h.primary.style)}">${escHtml(h.primary.text)}</a>`,
    secondary,
  ]
    .filter(Boolean)
    .join('\n')

  return `<!-- Hero section generated by Hero Lab. Self-contained — paste anywhere. -->
<!-- For the intended fonts, load 'Space Grotesk', 'Plus Jakarta Sans', and -->
<!-- 'JetBrains Mono' from Google Fonts; it falls back to system fonts otherwise. -->
<section style="${cssText(h.root)}">
${deco ? deco + '\n' : ''}  <div style="${cssText(h.content)}">
    <div style="${cssText(h.column)}">
      <div style="${cssText(h.textGroup)}">
${textChildren}
      </div>
      <div style="${cssText(h.ctaRow)}">
${ctaChildren}
      </div>
    </div>
  </div>
</section>
`
}

function htmlEyebrow(e: EyebrowModel): string {
  switch (e.kind) {
    case 'plain':
    case 'chip':
      return `        <span style="${cssText(e.style)}">${escHtml(e.text)}</span>`
    case 'mono':
      return `        <span style="${cssText(e.style)}"><span style="${cssText(e.prefixStyle)}">// </span>${escHtml(e.text)}</span>`
    case 'ruled':
      return `        <span style="${cssText(e.wrapStyle)}"><span aria-hidden="true" style="${cssText(e.ruleStyle)}"></span><span style="${cssText(e.style)}">${escHtml(e.text)}</span></span>`
  }
}
