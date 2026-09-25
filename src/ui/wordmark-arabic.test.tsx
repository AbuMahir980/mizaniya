/**
 * @vitest-environment jsdom
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
