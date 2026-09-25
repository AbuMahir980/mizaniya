/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Button } from './button'

afterEach(cleanup)

describe('the lift', () => {
  it('is on every primary button, not the Add action alone', () => {
    render(<Button>Save the plan</Button>)
    expect(screen.getByRole('button').className).toContain('shadow-lift')
  })

  it('is not on secondary or quiet', () => {
    render(
      <>
        <Button variant="secondary">Copy last cycle</Button>
        <Button variant="quiet">I have an export to restore</Button>
      </>,
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).not.toContain('shadow-lift')
    }
  })

  it('is dropped when the button is disabled', () => {
    render(<Button disabled>Save</Button>)
    // The lift says "press this". Saying that of something which cannot be
    // pressed is worse than saying nothing.
    expect(screen.getByRole('button').className).toContain('disabled:shadow-none')
  })
})
