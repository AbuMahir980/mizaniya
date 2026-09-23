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

function heightOf(latin: number): number {
  const { container } = render(<WordmarkArabic latin={latin} />)
  return Number(container.querySelector('svg')?.getAttribute('height'))
}

describe('the Arabic wordmark', () => {
  it('takes 0.62 of the Latin it sits under, per brand/README', () => {
    // Welcome at 360 sets the Latin at 42, so the Arabic is 26.04 — and the
    // outline is 1.76 em of that.
    expect(heightOf(42)).toBeCloseTo(42 * 0.62 * 1.76, 1)
    expect(heightOf(52)).toBeCloseTo(52 * 0.62 * 1.76, 1)
  })

  it('is never rendered at the size it is given', () => {
    // Two conversions sit between the two numbers — 0.62 of the Latin, then
    // 1.76 em of outline. Passing one for the other is the bug that shipped
    // twice, and the numbers are far enough apart to say so.
    for (const latin of [24, 31, 42, 52]) {
      expect(heightOf(latin)).not.toBe(latin)
    }
  })

  it('is hidden from the reader, because the Latin beside it says the name', () => {
    const { container } = render(<WordmarkArabic latin={42} />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
