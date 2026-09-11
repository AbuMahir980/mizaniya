/**
 * WHAT: Fails the build when `tokens.css` and `tokens.ts` disagree about any value.
 * WHY:  The tokens exist in two forms because two consumers need them — CSS for
 *       styling, typed data for charts, tests and the contrast audit. Two copies
 *       will drift; this is the thing that makes the drift loud instead of silent.
 * INTERVIEW: Where I could not avoid two representations of one fact, I wrote the
 *       test that fails when they disagree, rather than relying on discipline.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { colour, elevation, motion, radius, target, type Theme } from './tokens'

const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8')

/**
 * Custom properties, grouped by the selector they sit under.
 *
 * Written as a small parser rather than one regex because a value may wrap over
 * two lines — `elevation-card` does — and a regex that handles that as well as
 * nesting is harder to read than the twelve lines below.
 */
function propertiesBySelector(source: string): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>()
  let selector = ''
  let buffer = ''

  // Strip comment *blocks*, not comment lines. Skipping lines that begin with
  // `/*` leaves the continuation lines of a wrapped comment behind, and those
  // then get swallowed into the next declaration's value.
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')

  for (const rawLine of withoutComments.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.endsWith('{')) {
      const name = line.slice(0, -1).trim()
      // Ignore the @media wrapper itself; its inner selector is the one we want.
      if (!name.startsWith('@')) selector = name
      continue
    }

    if (!selector) continue

    buffer += buffer ? ` ${line}` : line
    if (!buffer.endsWith(';')) continue

    const declaration = buffer.slice(0, -1)
    buffer = ''
    const split = declaration.indexOf(':')
    if (split < 0) continue

    const property = declaration.slice(0, split).trim()
    if (!property.startsWith('--')) continue

    const value = declaration.slice(split + 1).replace(/\s+/g, ' ').trim()
    const bucket = out.get(selector) ?? new Map<string, string>()
    bucket.set(property.slice(2), value)
    out.set(selector, bucket)
  }
  return out
}

/** `#F7F3EA` equals `#f7f3ea`; `rgba(23,26,23,.46)` equals `rgba(23, 26, 23, 0.46)`. */
function normalise(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '').replace(/(^|[(,])0\./g, '$1.')
}

const parsed = propertiesBySelector(css)

/** The three blocks that carry colour: light, chosen dark, and system dark. */
const blocks: Array<[Theme, string]> = [
  ['light', ':root'],
  ['dark', ":root[data-theme='dark']"],
  ['dark', ":root:not([data-theme='light'])"],
]

function valuesFor(selector: string): Map<string, string> {
  const found = parsed.get(selector)
  if (!found) {
    throw new Error(
      `tokens.css has no "${selector}" block. Found: ${[...parsed.keys()].join(' · ')}`,
    )
  }
  return found
}

describe('design tokens', () => {
  it('tokens.css declares all three theme blocks', () => {
    for (const [, selector] of blocks) expect(() => valuesFor(selector)).not.toThrow()
  })

  it.each(blocks)('%s colours match tokens.ts (%s)', (theme, selector) => {
    const declared = valuesFor(selector)
    for (const [name, value] of Object.entries(colour[theme])) {
      const inCss = declared.get(name)
      expect(inCss, `--${name} is missing from ${selector}`).toBeDefined()
      expect(normalise(inCss as string), `--${name}`).toBe(normalise(value))
    }
  })

  it.each(blocks)('%s elevation matches tokens.ts (%s)', (theme, selector) => {
    const declared = valuesFor(selector)
    for (const key of ['card', 'lift'] as const) {
      const inCss = declared.get(`elevation-${key}`)
      expect(inCss, `--elevation-${key} is missing from ${selector}`).toBeDefined()
      expect(normalise(inCss as string), `--elevation-${key}`).toBe(
        normalise(elevation[theme][key]),
      )
    }
  })

  it('shape, motion and target match tokens.ts', () => {
    const declared = valuesFor(':root')
    for (const [name, value] of Object.entries(radius)) {
      expect(declared.get(`radius-${name}`), `--radius-${name}`).toBe(value)
    }
    expect(declared.get('motion-instant')).toBe(motion.instant)
    expect(declared.get('motion-fast')).toBe(motion.fast)
    expect(declared.get('motion-base')).toBe(motion.base)
    expect(declared.get('motion-sheet-in')).toBe(motion.sheetIn)
    expect(declared.get('motion-sheet-out')).toBe(motion.sheetOut)
    expect(normalise(declared.get('easing') as string)).toBe(normalise(motion.easing))
    expect(normalise(declared.get('easing-exit') as string)).toBe(
      normalise(motion.easingExit),
    )
    expect(declared.get('target-min')).toBe(target.min)
    expect(declared.get('target-gap')).toBe(target.gap)
  })

  it('every colour token exists in both themes', () => {
    expect(Object.keys(colour.dark).sort()).toEqual(Object.keys(colour.light).sort())
  })

  it('the chosen-dark and system-dark blocks agree', () => {
    const chosen = valuesFor(":root[data-theme='dark']")
    const system = valuesFor(":root:not([data-theme='light'])")
    for (const [name, value] of chosen) {
      expect(normalise(system.get(name) ?? ''), `--${name} in the system-dark block`).toBe(
        normalise(value),
      )
    }
  })

  it('money never animates', () => {
    expect(motion.instant).toBe('0ms')
  })
})
