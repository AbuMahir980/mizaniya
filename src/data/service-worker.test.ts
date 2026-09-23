/**
 * WHAT: That the service worker precaches the **shell only**, and never the
 *       owner's records.
 * WHY:  Every figure in this app is derived from IndexedDB. A runtime cache
 *       would be a second copy of someone's money, with its own staleness and
 *       nothing able to say which copy was right — the silent disagreement the
 *       whole architecture is arranged against (ADR-007, ADR-001).
 * INTERVIEW: I tested that a cache does *not* exist, because the dangerous
 *       change here is one somebody adds later for a good-sounding reason.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The configuration is read as source.
 *
 * Less elegant than inspecting a resolved object, and it fails for the right
 * reason: the plugin does not expose its options outside a build, and anyone
 * adding a runtime cache has to edit the line this file reads.
 */
const CONFIG = readFileSync('vite.config.ts', 'utf8')

describe('the service worker caches the shell and nothing else', () => {
  it('declares no runtime caching at all', () => {
    expect(CONFIG).toContain('runtimeCaching: []')
  })

  it('names none of the handlers that would cache a response', () => {
    for (const handler of ['NetworkFirst', 'CacheFirst', 'StaleWhileRevalidate', 'NetworkOnly']) {
      expect(CONFIG, `${handler} would put records in a cache`).not.toContain(handler)
    }
  })

  it('precaches static shell files, and no data file', () => {
    const patterns = /globPatterns:\s*\[([^\]]*)\]/.exec(CONFIG)?.[1] ?? ''

    expect(patterns).toContain('woff2')
    // An exported dataset is a .json file. It must never be served from a cache.
    expect(patterns).not.toContain('json')
  })

  it('updates on a prompt, so a stale shell cannot become permanent', () => {
    expect(CONFIG).toContain("registerType: 'prompt'")
    expect(CONFIG).toContain('cleanupOutdatedCaches: true')
  })
})
