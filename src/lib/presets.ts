// Hero Lab preset token system.
//
// Six curated mini design systems — these are the *output* styles a generated
// hero can wear, NOT the tool's own chrome. Each one is a deliberate, tasteful,
// DISTINCT direction so the showcase proves real range:
//
//   minimal   cool-white, airy, monochrome, quiet outline CTA            (Swiss)
//   bold      warm-black, HUGE geometric type, hot vermillion fill        (startup)
//   playful   soft peach→lavender wash, rounded pills, vivid pink, blobs   (friendly)
//   editorial warm paper, Georgia serif, terracotta, left/asymmetric rule  (magazine)
//   techy     dark navy, mono eyebrow, electric cyan, faint grid, sharp    (developer)
//   elegant   deep emerald, fine wide-tracked sans, muted gold, hairline   (couture)
//
// Portability: colors and font-family stacks are plain CSS values applied via
// inline `style` in the renderer, so a preset (and the code it later generates)
// is self-contained. Fonts are limited to families already loaded by the app
// (Space Grotesk / Plus Jakarta Sans / JetBrains Mono — see index.html) plus
// fully web-safe stacks (system-ui, Georgia), so generated heroes render
// correctly with no extra font installs.

import type { Preset } from './contract'

// ---------------------------------------------------------------------------
// Color helpers — exported so the renderer keeps accent overrides robust.
// ---------------------------------------------------------------------------

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** WCAG relative luminance (0 = black … 1 = white). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const lin = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/**
 * Pick dark or light text that reads on top of an arbitrary `hex` fill (e.g. a
 * filled-accent button). Threshold tuned so mid-tones like gold/cyan resolve to
 * dark text and saturated reds/blues resolve to white — keeps a user-supplied
 * accent legible without hand-tuning each one.
 */
export function readableOn(
  hex: string,
  dark = '#0B0B0E',
  light = '#FFFFFF',
): string {
  return luminance(hex) > 0.4 ? dark : light
}

/** `#rgb`/`#rrggbb` → `rgba()` with alpha. Non-hex (gradients) pass through. */
export function alpha(color: string, a: number): string {
  if (!color.startsWith('#')) return color
  const { r, g, b } = hexToRgb(color)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// ---------------------------------------------------------------------------
// Font stacks (portable — loaded families + web-safe fallbacks).
// ---------------------------------------------------------------------------

const SYS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, system-ui, sans-serif"
const GROTESK = `'Space Grotesk', ${SYS}`
const JAKARTA = `'Plus Jakarta Sans', ${SYS}`
const GEORGIA = "Georgia, 'Times New Roman', Times, serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

// ---------------------------------------------------------------------------
// Token shape.
// ---------------------------------------------------------------------------

/** How the primary CTA is filled. Colors are resolved (with accent override). */
export type PrimaryStyle = 'fill-accent' | 'fill-ink' | 'outline'

/** How the secondary CTA reads. */
export type SecondaryStyle =
  | 'outline-soft'
  | 'pill-soft'
  | 'ghost-underline'
  | 'hairline'

/** Eyebrow treatment. */
export type EyebrowVariant = 'plain' | 'chip' | 'ruled' | 'mono'

/** Ambient decoration drawn behind the content. */
export type Decoration = 'none' | 'glow' | 'blob' | 'grid' | 'frame'

export interface PresetTokens {
  label: string

  /** CSS `background` (solid hex OR a gradient) for the hero surface. */
  bg: string
  /** A solid color version of `bg` (used as text color on `fill-ink` buttons). */
  surfaceSolid: string
  /** Headline / primary text. */
  surfaceText: string
  /** Subhead / muted text. */
  mutedText: string
  /** Default accent (overridable per-spec). */
  accent: string
  /** Default text color on top of the accent fill. */
  accentText: string

  /** CSS font-family stack for the headline. */
  headingFont: string
  /** CSS font-family stack for body / subhead. */
  bodyFont: string
  /** CSS font-family stack for the eyebrow (e.g. mono for techy). */
  eyebrowFont: string
  /** CSS font-family stack for the CTA labels. */
  buttonFont: string

  /** Tailwind structural classes (weight / tracking / leading — never color). */
  headingClassName: string
  bodyClassName: string
  eyebrowClassName: string
  buttonClassName: string
  secondaryButtonClassName: string

  /** Fluid type sizes — `clamp()` with `cqi` so they scale to the preview width. */
  headingSize: string
  subheadSize: string
  eyebrowSize: string

  /** Layout. */
  align: 'left' | 'center'
  /** Border-radius for buttons (and accent shapes). */
  radius: string
  /** `clamp()` padding string for the hero band (controls density). */
  sectionPadding: string
  /** `clamp()` min-height so the band reads like a hero at any width. */
  minHeight: string
  /** Max width of the content column. */
  contentMaxWidth: string
  /** Max width of the subhead (kept narrower for readable measure). */
  subheadMaxWidth: string
  /** Gap between eyebrow → heading → subhead. */
  blockGap: string
  /** Extra space above the CTA row. */
  ctaGap: string

  /** Composition switches. */
  primaryStyle: PrimaryStyle
  secondaryStyle: SecondaryStyle
  eyebrowVariant: EyebrowVariant
  decoration: Decoration
}

// ---------------------------------------------------------------------------
// The six systems.
// ---------------------------------------------------------------------------

export const PRESET_TOKENS: Record<Preset, PresetTokens> = {
  // 1 — MINIMAL. Cool clinical white, monochrome, generous air. The one accent
  // (a quiet indigo eyebrow) is the only color on the page; the primary CTA is a
  // crisp dark outline, not a fill. Restraint executed with precise spacing.
  minimal: {
    label: 'Minimal',
    bg: '#FFFFFF',
    surfaceSolid: '#FFFFFF',
    surfaceText: '#18181B',
    mutedText: '#71717A',
    accent: '#4F46E5',
    accentText: '#FFFFFF',
    headingFont: SYS,
    bodyFont: SYS,
    eyebrowFont: SYS,
    buttonFont: SYS,
    headingClassName: 'font-medium tracking-[-0.02em] leading-[1.12]',
    bodyClassName: 'font-normal leading-[1.6]',
    eyebrowClassName: 'font-semibold uppercase tracking-[0.2em]',
    buttonClassName: 'px-6 py-3 text-[15px] font-medium',
    secondaryButtonClassName: 'py-3 text-[15px] font-medium',
    headingSize: 'clamp(1.875rem, 5cqi, 2.75rem)',
    subheadSize: 'clamp(1rem, 2cqi, 1.1875rem)',
    eyebrowSize: 'clamp(0.6875rem, 1.4cqi, 0.8125rem)',
    align: 'center',
    radius: '8px',
    sectionPadding: 'clamp(56px, 11cqi, 104px) clamp(32px, 8cqi, 80px)',
    minHeight: 'clamp(360px, 46cqi, 500px)',
    contentMaxWidth: '40rem',
    subheadMaxWidth: '34rem',
    blockGap: 'clamp(16px, 2.4cqi, 22px)',
    ctaGap: 'clamp(28px, 4cqi, 40px)',
    primaryStyle: 'outline',
    secondaryStyle: 'ghost-underline',
    eyebrowVariant: 'plain',
    decoration: 'none',
  },

  // 2 — BOLD. Warm near-black, an enormous Space Grotesk headline tuned tight,
  // and one hot vermillion fill. Left-aligned for confidence; a soft accent glow
  // gives the type some atmosphere without competing with it.
  bold: {
    label: 'Bold',
    bg: '#0C0A09',
    surfaceSolid: '#0C0A09',
    surfaceText: '#FAFAF7',
    mutedText: '#A6A29B',
    accent: '#FF5A36',
    accentText: '#0B0B0E',
    headingFont: GROTESK,
    bodyFont: JAKARTA,
    eyebrowFont: GROTESK,
    buttonFont: GROTESK,
    headingClassName: 'font-bold tracking-[-0.03em] leading-[0.98]',
    bodyClassName: 'font-normal leading-[1.5]',
    eyebrowClassName: 'font-semibold uppercase tracking-[0.22em]',
    buttonClassName: 'px-8 py-4 text-[16px] font-bold',
    secondaryButtonClassName: 'px-7 py-4 text-[16px] font-semibold',
    headingSize: 'clamp(2.75rem, 8.6cqi, 4.75rem)',
    subheadSize: 'clamp(1.0625rem, 2.3cqi, 1.3125rem)',
    eyebrowSize: 'clamp(0.6875rem, 1.4cqi, 0.8125rem)',
    align: 'left',
    radius: '8px',
    sectionPadding: 'clamp(48px, 9cqi, 88px) clamp(36px, 7.5cqi, 72px)',
    minHeight: 'clamp(380px, 50cqi, 540px)',
    contentMaxWidth: '46rem',
    subheadMaxWidth: '34rem',
    blockGap: 'clamp(18px, 2.6cqi, 26px)',
    ctaGap: 'clamp(28px, 4cqi, 40px)',
    primaryStyle: 'fill-accent',
    secondaryStyle: 'outline-soft',
    eyebrowVariant: 'plain',
    decoration: 'glow',
  },

  // 3 — PLAYFUL. A soft peach→lavender gradient wash, everything rounded, a vivid
  // pink accent, pill CTAs, and two blurred ambient blobs. Warm rounded Jakarta.
  // Friendly and bouncy — but disciplined (one bright accent, the rest soft).
  playful: {
    label: 'Playful',
    bg: 'linear-gradient(150deg, #FFF1EC 0%, #FBEFFB 52%, #EEF0FF 100%)',
    surfaceSolid: '#FFF1EC',
    surfaceText: '#2A2342',
    mutedText: '#6C6488',
    accent: '#FF4F7E',
    accentText: '#FFFFFF',
    headingFont: JAKARTA,
    bodyFont: JAKARTA,
    eyebrowFont: JAKARTA,
    buttonFont: JAKARTA,
    headingClassName: 'font-extrabold tracking-[-0.02em] leading-[1.04]',
    bodyClassName: 'font-medium leading-[1.55]',
    eyebrowClassName: 'font-bold uppercase tracking-[0.12em]',
    buttonClassName: 'px-7 py-3.5 text-[15px] font-bold',
    secondaryButtonClassName: 'px-7 py-3.5 text-[15px] font-bold',
    headingSize: 'clamp(2.25rem, 6.4cqi, 3.5rem)',
    subheadSize: 'clamp(1.0625rem, 2.2cqi, 1.25rem)',
    eyebrowSize: 'clamp(0.6875rem, 1.3cqi, 0.8125rem)',
    align: 'center',
    radius: '999px',
    sectionPadding: 'clamp(48px, 9.5cqi, 92px) clamp(32px, 7cqi, 68px)',
    minHeight: 'clamp(360px, 46cqi, 500px)',
    contentMaxWidth: '42rem',
    subheadMaxWidth: '34rem',
    blockGap: 'clamp(16px, 2.4cqi, 22px)',
    ctaGap: 'clamp(28px, 4cqi, 40px)',
    primaryStyle: 'fill-accent',
    secondaryStyle: 'pill-soft',
    eyebrowVariant: 'chip',
    decoration: 'blob',
  },

  // 4 — EDITORIAL. Warm paper, a Georgia serif headline at normal weight, a clean
  // sans deck, and a quiet terracotta accent. Left-aligned and asymmetric with a
  // short hairline rule above the eyebrow. Print-grade calm.
  editorial: {
    label: 'Editorial',
    bg: '#F4EFE3',
    surfaceSolid: '#F4EFE3',
    surfaceText: '#211C16',
    mutedText: '#6B6256',
    accent: '#B65A33',
    accentText: '#FFFFFF',
    headingFont: GEORGIA,
    bodyFont: SYS,
    eyebrowFont: SYS,
    buttonFont: SYS,
    headingClassName: 'font-normal tracking-[-0.01em] leading-[1.08]',
    bodyClassName: 'font-normal leading-[1.6]',
    eyebrowClassName: 'font-semibold uppercase tracking-[0.18em]',
    buttonClassName: 'px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.08em]',
    secondaryButtonClassName: 'py-3 text-[13px] font-semibold uppercase tracking-[0.08em]',
    headingSize: 'clamp(2.125rem, 5.8cqi, 3.25rem)',
    subheadSize: 'clamp(1.0625rem, 2.2cqi, 1.25rem)',
    eyebrowSize: 'clamp(0.6875rem, 1.3cqi, 0.75rem)',
    align: 'left',
    radius: '2px',
    sectionPadding: 'clamp(52px, 10cqi, 96px) clamp(36px, 7.5cqi, 72px)',
    minHeight: 'clamp(360px, 46cqi, 500px)',
    contentMaxWidth: '44rem',
    subheadMaxWidth: '32rem',
    blockGap: 'clamp(16px, 2.4cqi, 22px)',
    ctaGap: 'clamp(28px, 4cqi, 38px)',
    primaryStyle: 'fill-ink',
    secondaryStyle: 'ghost-underline',
    eyebrowVariant: 'ruled',
    decoration: 'none',
  },

  // 5 — TECHY. Cool dark navy with a faint grid, a JetBrains-mono eyebrow with a
  // cyan comment prefix, a crisp Space Grotesk headline, and electric-cyan
  // accents on sharp 4px corners. Developer-console adjacent.
  techy: {
    label: 'Techy',
    bg: '#0B1220',
    surfaceSolid: '#0B1220',
    surfaceText: '#E7EDF7',
    mutedText: '#8C99AE',
    accent: '#27E0D6',
    accentText: '#06121A',
    headingFont: GROTESK,
    bodyFont: SYS,
    eyebrowFont: MONO,
    buttonFont: GROTESK,
    headingClassName: 'font-semibold tracking-[-0.02em] leading-[1.05]',
    bodyClassName: 'font-normal leading-[1.55]',
    eyebrowClassName: 'font-medium tracking-[0.02em]',
    buttonClassName: 'px-6 py-3 text-[14px] font-semibold tracking-[0.01em]',
    secondaryButtonClassName: 'px-6 py-3 text-[14px] font-semibold tracking-[0.01em]',
    headingSize: 'clamp(1.875rem, 5.2cqi, 3rem)',
    subheadSize: 'clamp(0.9375rem, 1.9cqi, 1.0625rem)',
    eyebrowSize: 'clamp(0.6875rem, 1.4cqi, 0.8125rem)',
    align: 'left',
    radius: '4px',
    sectionPadding: 'clamp(44px, 8.5cqi, 80px) clamp(32px, 7cqi, 64px)',
    minHeight: 'clamp(340px, 44cqi, 480px)',
    contentMaxWidth: '44rem',
    subheadMaxWidth: '34rem',
    blockGap: 'clamp(14px, 2.2cqi, 20px)',
    ctaGap: 'clamp(26px, 3.6cqi, 36px)',
    primaryStyle: 'fill-accent',
    secondaryStyle: 'hairline',
    eyebrowVariant: 'mono',
    decoration: 'grid',
  },

  // 6 — ELEGANT. Deep emerald, a fine wide-tracked light sans, muted gold accents,
  // a thin inset gold hairline frame, and centered, generous space. Couture calm —
  // nothing shouts; the restraint is the luxury.
  elegant: {
    label: 'Elegant',
    bg: '#0E2A24',
    surfaceSolid: '#0E2A24',
    surfaceText: '#F3EEE2',
    mutedText: '#B6AD98',
    accent: '#C9A86A',
    accentText: '#1A140A',
    headingFont: SYS,
    bodyFont: SYS,
    eyebrowFont: SYS,
    buttonFont: SYS,
    headingClassName: 'font-light tracking-[0.01em] leading-[1.12]',
    bodyClassName: 'font-normal leading-[1.65] tracking-[0.01em]',
    eyebrowClassName: 'font-semibold uppercase tracking-[0.34em]',
    buttonClassName: 'px-9 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em]',
    secondaryButtonClassName: 'px-9 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em]',
    headingSize: 'clamp(2rem, 5.6cqi, 3.25rem)',
    subheadSize: 'clamp(1rem, 2cqi, 1.1875rem)',
    eyebrowSize: 'clamp(0.625rem, 1.2cqi, 0.75rem)',
    align: 'center',
    radius: '2px',
    sectionPadding: 'clamp(60px, 12cqi, 116px) clamp(36px, 8cqi, 80px)',
    minHeight: 'clamp(380px, 50cqi, 540px)',
    contentMaxWidth: '42rem',
    subheadMaxWidth: '32rem',
    blockGap: 'clamp(18px, 2.8cqi, 26px)',
    ctaGap: 'clamp(30px, 4.2cqi, 44px)',
    primaryStyle: 'fill-accent',
    secondaryStyle: 'hairline',
    eyebrowVariant: 'plain',
    decoration: 'frame',
  },
}
