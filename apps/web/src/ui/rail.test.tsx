/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Rail } from './rail'

afterEach(cleanup)

describe('the bar has a name aloud', () => {
  /**
   * The fault this test exists for: `label` reached `aria-valuetext` only, which is
   * the *value*. A progressbar with a value and no name is read as "62% of food"
   * with nothing saying what it is. `getByRole` with a name fails without the label.
   */
  it('takes its accessible name from the label, not only its value text', () => {
    render(<Rail value={0.62} label="Food and groceries" />)
    expect(screen.getByRole('progressbar', { name: 'Food and groceries' })).toBeDefined()
  })

  it('still carries the proportion as value text, for a reader that announces it', () => {
    render(<Rail value={0.62} label="Food and groceries" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe(
      '62% of Food and groceries',
    )
  })
})

describe('what it reports past its own ends', () => {
  it('reports the real proportion above 1, so overspending is not announced as full', () => {
    render(<Rail value={1.4} label="Health" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('140')
    expect(bar.getAttribute('aria-valuetext')).toBe('140% of Health')
  })

  it('treats a value that is not a number as nothing, rather than drawing NaN', () => {
    render(<Rail value={Number.NaN} label="Transport" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })

  it('never reports below zero', () => {
    render(<Rail value={-0.5} label="Transport" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })
})
