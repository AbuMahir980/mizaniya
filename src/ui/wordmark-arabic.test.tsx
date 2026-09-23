/**
 * @vitest-environment jsdom
 *
 * WHAT: That the Arabic wordmark renders at the size the artboards ask for.
 * WHY:  The word ships as **outlines, not text**, and its outline spans 1.76 em
 *       — 1.124 above the baseline for the dots and the alif, 0.636 below for
 *       the tail of the yāʾ. So an SVG height is not a font size, and passing
 *       one for the other draws the word at 57% of its drawn size. **That was
 *       shipped twice**, which is why the prop is now a font size and why this
 *       pins the conversion.
 * INTERVIEW: I made the component take the font size the design specifies
 *           rather than a pixel height, because the two are not the same for an
 *           outlined glyph and the difference had already shipped twice.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { WordmarkArabic } from './wordmark-arabic'

afterEach(cleanup)

function heightOf(fontSize: number): number {
  const { container } = render(<WordmarkArabic fontSize={fontSize} />)
  return Number(container.querySelector('svg')?.getAttribute('height'))
}

describe('the Arabic wordmark', () => {
  it('scales the outline to the font size the artboards write', () => {
    // WelcomeLight.dc.html: `font-size: 25px`. WelcomeDLight: `font-size: 30px`.
    expect(heightOf(25)).toBeCloseTo(44, 1)
    expect(heightOf(30)).toBeCloseTo(52.8, 1)
  })

  it('never renders at the font size itself', () => {
    // The bug, stated as a test: height === fontSize is the thing that shipped.
    for (const size of [16, 25, 30]) {
      expect(heightOf(size)).not.toBe(size)
    }
  })

  it('is hidden from the reader, because the Latin beside it says the name', () => {
    const { container } = render(<WordmarkArabic fontSize={25} />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
