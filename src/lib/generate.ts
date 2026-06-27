// Client helper. POSTs to the serverless function; on any non-OK response or
// network error (e.g. `npm run dev` where the serverless fn isn't running, or
// offline) it falls back to the deterministic mock locally. This guarantees the
// UI works in dev and tests, and degrades gracefully in production.

import { isHeroSpec } from './contract'
import type { GenerateRequest, GenerateResult } from './contract'
import { mockGenerate } from './mockGenerate'

/** Thrown on HTTP 429 so the UI can show a friendly retry message. */
export class RateLimitError extends Error {
  constructor(message = 'Too many requests, try again in a moment.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

function localFallback(req: GenerateRequest): GenerateResult {
  return { spec: mockGenerate(req), source: 'mock' }
}

export async function generateHero(
  req: GenerateRequest,
): Promise<GenerateResult> {
  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    })

    // Rate limit is the one error the UI should surface to the user.
    if (resp.status === 429) {
      throw new RateLimitError()
    }

    // Any other non-OK (400, 500, …) → degrade to the local mock.
    if (!resp.ok) {
      return localFallback(req)
    }

    const data = (await resp.json()) as Partial<GenerateResult>
    if (data && isHeroSpec(data.spec)) {
      return { spec: data.spec, source: data.source === 'ai' ? 'ai' : 'mock' }
    }

    // Malformed payload → local mock.
    return localFallback(req)
  } catch (err) {
    // Re-throw the rate-limit signal; swallow everything else (network, offline,
    // dev without the serverless fn) and fall back to the local mock.
    if (err instanceof RateLimitError) throw err
    return localFallback(req)
  }
}
