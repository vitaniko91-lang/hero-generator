import type { Config } from 'tailwindcss'

// Playful Maker art direction — source of truth:
// docs/portfolio/hero-generator/art-direction.md
// Light + colorful + rounded + springy. Indigo primary, coral/sunshine delight sparks.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { base: '#FAFAFC', panel: '#FFFFFF', sunk: '#F2F2F7' },
        // ink.faint darkened from #A1A1AA (~2.5:1, fails AA) to #6B6B76 so meta
        // text — counters, captions, the code-lang label, footer notes — clears
        // 4.5:1 on base/panel/sunk. Still visibly lighter than ink.soft (#52525B).
        ink: { DEFAULT: '#18181B', soft: '#52525B', faint: '#6B6B76' },
        indigo: { DEFAULT: '#5B4DF0', dim: '#EEEBFF' },
        // coral.DEFAULT (#FF6B5C ~2.8:1) stays for large/icon/decorative use;
        // coral.ink (#C2402F ~5.2:1 on white) is the AA-safe shade for small text.
        coral: { DEFAULT: '#FF6B5C', ink: '#C2402F' },
        sunshine: '#FFC44D',
        line: '#E8E8EF',
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24,24,40,.06), 0 8px 24px rgba(24,24,40,.08)',
        lift: '0 2px 4px rgba(24,24,40,.06), 0 16px 40px rgba(24,24,40,.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config
