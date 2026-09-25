import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The configuration is read as source.
 *
 * Less elegant than inspecting a resolved object, and it fails for the right
 * reason: the plugin does not expose its options outside a build, and anyone
 * adding a runtime cache has to edit the line this file reads.
 */
const CONFIG = readFileSync(
  fileURLToPath(new URL('../../vite.config.ts', import.meta.url)),
  'utf8',
)

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
