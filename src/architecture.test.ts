/**
 * WHAT: Proof that the architecture boundaries actually fail the build, by
 *       injecting a violation into each layer and requiring ESLint to report it.
 * WHY:  The rule was configured for two weeks and enforced nothing — the
 *       elements classified no files and no import target resolved, so every
 *       dependency was "unknown" and silently permitted. A green lint said
 *       nothing about whether the boundaries held.
 * INTERVIEW: I wrote a test that breaks the lint rules on purpose, because a
 *       rule that has only ever passed is indistinguishable from one that is
 *       switched off.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'

const PROBE_DIR = 'src/__boundary_probe__'

/**
 * Writes a throwaway file into a layer and returns ESLint's complaints.
 *
 * A real file on disk rather than a mocked linter: the thing under test is the
 * configuration, and a mock would only prove the mock agrees with itself.
 */
function lintProbe(layer: string, contents: string): string {
  const dir = `src/${layer}/${PROBE_DIR.split('/').pop()}`
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
  for (const layer of ['app', 'ui', 'store', 'data', 'core', 'design']) {
    rmSync(`src/${layer}/${PROBE_DIR.split('/').pop()}`, { recursive: true, force: true })
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

  it('core may not import store', () => {
    const out = lintProbe(
      'core',
      "import { createSnapshotStore } from '../../store/snapshot-store'\nexport const probe = createSnapshotStore\n",
    )
    expect(out).toContain('core may not import store')
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
      "import { formatMoney } from '@/core/money/money'\nexport const probe = formatMoney\n",
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
