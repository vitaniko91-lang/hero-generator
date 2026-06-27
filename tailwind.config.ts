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
        ink: { DEFAULT: '#18181B', soft: '#52525B', faint: '#A1A1AA' },
        indigo: { DEFAULT: '#5B4DF0', dim: '#EEEBFF' },
        coral: '#FF6B5C',
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
