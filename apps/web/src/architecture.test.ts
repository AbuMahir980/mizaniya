import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'

const PROBE = '__boundary_probe__'

/**
 * Where each layer actually lives since the workspace extraction.
 *
 * `core` is in its own package and the rest are in the web app, so a single
 * `src/<layer>` prefix no longer finds them. Listed explicitly: a probe written
 * to a path that does not exist lints clean, and a boundary test that passes
 * because it tested nothing is worse than no boundary test.
 */
const LAYER_DIR: Record<string, string> = {
  app: 'apps/web/src/app',
  ui: 'apps/web/src/ui',
  store: 'apps/web/src/store',
  data: 'apps/web/src/data',
  design: 'apps/web/src/design',
  core: 'packages/core/src',
}

/**
 * Writes a throwaway file into a layer and returns ESLint's complaints.
 *
 * A real file on disk rather than a mocked linter: the thing under test is the
 * configuration, and a mock would only prove the mock agrees with itself.
 */
function lintProbe(layer: string, contents: string): string {
  const base = LAYER_DIR[layer]
  if (!base) throw new Error(`No directory known for layer "${layer}" — add it to LAYER_DIR`)
  const dir = `${base}/${PROBE}`
  mkdirSync(dir, { recursive: true })
  const file = `${dir}/probe.ts`
  writeFileSync(file, contents)

  try {
    execFileSync('npx', ['eslint', file], { encoding: 'utf8', stdio: 'pipe' })
    return ''
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string }
    return `${e.stdout ?? ''}${e.stderr ?? ''}`
  }
}

function cleanup() {
  for (const base of Object.values(LAYER_DIR)) {
    rmSync(`${base}/${PROBE}`, { recursive: true, force: true })
  }
}

afterEach(cleanup)

describe('dependencies point inward (A2), and the rule says so', () => {
  it('ui may not import store', () => {
    const out = lintProbe(
      'ui',
      "import { createSnapshotStore } from '@/store/snapshot-store'\nexport const probe = createSnapshotStore\n",
    )
    expect(out).toContain('boundaries/dependencies')
    expect(out).toContain('ui may not import store')
  })

  it('ui may not import data', () => {
    const out = lintProbe(
      'ui',
      "import { createDexieRepository } from '@/data/dexie-repository'\nexport const probe = createDexieRepository\n",
    )
    expect(out).toContain('ui may not import data')
  })

  it('data may not import store', () => {
    const out = lintProbe(
      'data',
      "import { createSnapshotStore } from '@/store/snapshot-store'\nexport const probe = createSnapshotStore\n",
    )
    expect(out).toContain('data may not import store')
  })

  it('app may not import data — the violation this fix found', () => {
    const out = lintProbe(
      'app',
      "import { createDexieRepository } from '@/data/dexie-repository'\nexport const probe = createDexieRepository\n",
    )
    expect(out).toContain('app may not import data')
  })

  /**
   * Since the workspace extraction this is a stronger guarantee than it was.
   *
   * It used to be a boundaries rule: core and store were sibling folders, so the
   * probe reached store by a relative path and `boundaries` rejected it by type.
   * Core is now its own package, so a relative path out of it does not resolve at
   * all — and the guarantee is no longer "core may not import store" but **core
   * may not reach into the app**, for any reason, by the only route left to it.
   */
  it('core may not reach into the app at all', () => {
    const out = lintProbe(
      'core',
      "import { createSnapshotStore } from '@/store/snapshot-store'\nexport const probe = createSnapshotStore\n",
    )
    expect(out).toContain('must not reach into the app')
  })
})

describe('the permitted directions still pass', () => {
  it('store may import data', () => {
    const out = lintProbe(
      'store',
      "import { createDexieRepository } from '@/data/dexie-repository'\nexport const probe = createDexieRepository\n",
    )
    // A rule that forbids everything is as useless as one that forbids nothing.
    expect(out).not.toContain('boundaries/dependencies')
  })

  it('ui may import core', () => {
    const out = lintProbe(
      'ui',
      "import { formatMoney } from '@mizaniya/core/money/money'\nexport const probe = formatMoney\n",
    )
    expect(out).not.toContain('boundaries/dependencies')
  })
})

describe('core/ is framework-free (A3)', () => {
  it('core may not import react', () => {
    const out = lintProbe('core', "import 'react'\nexport const probe = 1\n")
    expect(out).toContain('core/ is framework-free')
  })

  it('core may not read the clock (ADR-003)', () => {
    const out = lintProbe('core', 'export const probe = Date.now()\n')
    expect(out).toContain('no-restricted-syntax')
  })
})
