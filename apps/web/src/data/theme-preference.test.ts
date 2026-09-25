/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyThemeChoice,
  readThemeChoice,
  writeThemeChoice,
  type ThemeChoice,
} from './theme-preference'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('the stored choice', () => {
  it('follows the device until the owner says otherwise', () => {
    expect(readThemeChoice()).toBe('system')
  })

  it('remembers light and dark', () => {
    for (const choice of ['light', 'dark'] as ThemeChoice[]) {
      writeThemeChoice(choice)
      expect(readThemeChoice()).toBe(choice)
    }
  })

  it('can be returned to Auto, which is the point of three states', () => {
    writeThemeChoice('dark')
    writeThemeChoice('system')

    expect(readThemeChoice()).toBe('system')
    // Nothing left behind: "system" is the absence of an override.
    expect(localStorage.getItem('mizaniya.theme')).toBeNull()
  })

  it('ignores a value it does not recognise rather than trusting it', () => {
    localStorage.setItem('mizaniya.theme', 'solarised')
    expect(readThemeChoice()).toBe('system')
  })
})

describe('what it does to the document', () => {
  it('sets data-theme for an explicit choice', () => {
    applyThemeChoice('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    applyThemeChoice('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('removes the attribute for Auto, so the media query decides again', () => {
    applyThemeChoice('dark')
    applyThemeChoice('system')

    // tokens.css guards its prefers-color-scheme block with
    // `:root:not([data-theme='light'])`, so removing the attribute is what
    // hands the decision back to the device — no JavaScript needs to know
    // what the device said.
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})

describe('tokens.css is written for this', () => {
  it('lets an explicit choice win over the device', async () => {
    // Anchored to the repo root, where the root vitest config runs from.
    // Not `import.meta.url` (not a file URL under jsdom) and not `?raw` (vitest
    // stubs CSS to empty, which would make this assertion pass vacuously).
    const { readFileSync } = await import('node:fs')
    const css = readFileSync('apps/web/src/design/tokens.css', 'utf8')

    // Both halves are needed: the override, and the guard that lets it win.
    expect(css).toContain(":root[data-theme='dark']")
    expect(css).toContain(":root:not([data-theme='light'])")
  })
})
