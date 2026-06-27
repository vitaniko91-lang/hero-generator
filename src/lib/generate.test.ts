import { describe, it, expect, afterEach, vi } from 'vitest'
import { generateHero, RateLimitError } from './generate'
import { isHeroSpec } from './contract'
import type { GenerateRequest, HeroSpec } from './contract'

const req: GenerateRequest = {
  description: 'an AI tool that generates landing page heroes',
  preset: 'playful',
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generateHero', () => {
  it('falls back to the local mock when fetch rejects (network/offline/dev)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down'))),
    )

    const result = await generateHero(req)
    expect(result.source).toBe('mock')
    expect(isHeroSpec(result.spec)).toBe(true)
  })

  it('returns the AI spec when the server responds OK with source "ai"', async () => {
    const spec: HeroSpec = {
      headline: 'Heroes, generated',
      subhead: 'Describe your product and get a polished hero instantly.',
      primaryCta: 'Get started',
      preset: 'playful',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(200, { spec, source: 'ai' }))),
    )

    const result = await generateHero(req)
    expect(result.source).toBe('ai')
    expect(result.spec).toEqual(spec)
  })

  it('throws RateLimitError on HTTP 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(429, { error: 'slow down' }))),
    )

    await expect(generateHero(req)).rejects.toBeInstanceOf(RateLimitError)
  })

  it('falls back to the local mock on a non-OK server error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(500, { error: 'boom' }))),
    )

    const result = await generateHero(req)
    expect(result.source).toBe('mock')
    expect(isHeroSpec(result.spec)).toBe(true)
  })

  it('falls back to the local mock when the payload is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(jsonResponse(200, { spec: { headline: '' }, source: 'ai' })),
      ),
    )

    const result = await generateHero(req)
    expect(result.source).toBe('mock')
    expect(isHeroSpec(result.spec)).toBe(true)
  })

  it('posts to /api/generate with the request body', async () => {
    const fetchMock = vi.fn((_url: string, _init: RequestInit) =>
      Promise.reject(new Error('network')),
    )
    vi.stubGlobal('fetch', fetchMock)

    await generateHero(req)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/generate')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual(req)
  })
})
