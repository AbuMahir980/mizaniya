/**
 * WHAT: Proves the grid guard actually fails on an off-grid value.
 * WHY:  It will spend its whole life finding nothing, which is the shape of a
 *       check that has quietly stopped working. So it is pointed at a planted
 *       file and required to refuse.
 * INTERVIEW: I tested the guard by breaking the rule on purpose, because a
 *           check that has only ever passed is indistinguishable from one that
 *           is switched off.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const GUARD = resolve('scripts/check-spacing.mjs')
const made = []

afterEach(() => {
  while (made.length > 0) rmSync(made.pop(), { recursive: true, force: true })
})

function run(source) {
  const dir = mkdtempSync(join(tmpdir(), 'mizaniya-grid-'))
  made.push(dir)
  writeFileSync(join(dir, 'screen.tsx'), source)
  const result = spawnSync('node', [GUARD, dir], { encoding: 'utf8' })
  return { code: result.status, output: `${result.stdout}${result.stderr}` }
}

describe('the 2px grid', () => {
  it('refuses an odd arbitrary spacing value', () => {
    const { code, output } = run('export const a = <div className="pt-[23px]" />\n')
    expect(code).toBe(1)
    expect(output).toContain('pt-[23px]')
  })

  it('allows an even one', () => {
    expect(run('export const a = <div className="pt-[22px]" />\n').code).toBe(0)
  })

  it('allows 1–4px, which is optical rather than spacing', () => {
    // A hairline offset or a glyph nudge belongs to the component (§5).
    expect(run('export const a = <div className="mt-[1px] ml-[3px]" />\n').code).toBe(0)
  })

  it('leaves sizes alone — a 25px mark is brand geometry, not spacing', () => {
    expect(run('export const a = <div className="h-[25px] w-[31px]" />\n').code).toBe(0)
  })
})

describe('fraction offsets', () => {
  it('refuses one that is not a real utility', () => {
    // The exact breakage the grid migration caused: `left-1/2` was rewritten
    // to `left-4/2`, which Tailwind emits nothing for — so the desktop dialog
    // stopped centring and nothing said so.
    const { code, output } = run('export const a = <div className="left-4/2" />\n')
    expect(code).toBe(1)
    expect(output).toContain('emits nothing')
  })

  it('allows the ones that are', () => {
    const source = 'export const a = <div className="left-1/2 -translate-y-1/2 top-3/4" />\n'
    expect(run(source).code).toBe(0)
  })
})
