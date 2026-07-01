# Hero Lab

**A playful AI tool that turns a sentence into a landing-page hero — with copy-paste React + Tailwind code.**

Describe your product, pick a vibe, and get a polished hero section (headline, subhead, CTAs, styled) you can preview live and copy as code. Built as a portfolio piece + a free tool.

🔗 **Live:** _(deploying to Vercel)_
🎨 **Concept tool by [Vitalina Nikulina](https://vitaniko91-lang.github.io/)** — a designer who ships production code.

---

## What it does

1. Describe your startup/product (or click an example).
2. Pick a **style** (Minimal · Bold · Playful · Editorial · Techy · Elegant), **tone**, and an optional **accent color** — or let the AI pick.
3. **Generate** → a live hero preview renders in a browser frame.
4. **Copy** the faithful **React + Tailwind** (or **HTML**) code — self-contained, pastes anywhere.

The six presets are curated mini design systems, so every generated hero looks good — the AI fills the copy and picks within a safe design system.

## Art direction — "Playful Maker"

Light, colorful, rounded, springy — deliberately distinct from the other portfolio cases. Cool off-white chrome + electric indigo, with coral/sunshine delight accents, so the colorful generated previews stay the star. Type: Space Grotesk + Plus Jakarta Sans + JetBrains Mono.

## How generation works

- The frontend calls a **Vercel serverless function** (`api/generate.ts`) that proxies **Claude Haiku** and returns structured JSON (`HeroSpec`), which the app renders into a preview + code.
- The API key lives only in a Vercel env var (`ANTHROPIC_API_KEY`) — never in the browser.
- Guards: Haiku (cheap) + `max_tokens` cap + per-IP rate limit + input length cap.
- **No key set?** The function returns a deterministic, tasteful **mock** (and the UI shows a "Demo output" badge) — so the tool works for previews and local dev without a key.

## Tech

React + TypeScript · Vite · Tailwind CSS · `motion` (springy animation) · Claude Haiku via a Vercel serverless function. Accessible (WCAG AA, full keyboard, reduced-motion) and responsive.

## Run locally

```bash
npm install
npm run dev      # UI works with the deterministic mock (no key needed)
npm run test     # vitest
npm run build
```

To run real AI locally, use `vercel dev` with `ANTHROPIC_API_KEY` set (the static dev server falls back to the mock).

## Deploy (Vercel)

Import the repo on vercel.com (auto-detects Vite), add an `ANTHROPIC_API_KEY` env var, deploy. The `api/` function ships automatically.

---

_Hero Lab is a free concept tool — designed & built by Vitalina Nikulina._
