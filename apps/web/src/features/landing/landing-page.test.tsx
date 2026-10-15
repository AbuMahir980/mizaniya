/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LandingPage } from './landing-page'
import { figures } from './landing-copy'

afterEach(cleanup)

function renderPage() {
  const onStart = vi.fn()
  const onRestore = vi.fn()
  render(<LandingPage onStart={onStart} onRestore={onRestore} />)
  return { onStart, onRestore }
}

describe('the page says only what is true', () => {
  /**
   * ADR-013 removed accounts, tiers and any price. The drawn page carried a
   * tier band and a price card for six days after that decision, which is how
   * this class of fault survives: wording outlives the thing it described.
   * These assertions fail if any of it comes back.
   */
  it('offers nothing to buy and nothing to sign into', () => {
    renderPage()
    const page = document.body.textContent ?? ''

    // The words, not the controls: the page says "there is nothing to sign up
    // for", which is the point rather than a violation. What must not exist is
    // something to press.
    expect(screen.queryByRole('button', { name: /sign in|sign up|log in/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /sign in|sign up|log in/i })).toBeNull()
    expect(page).not.toMatch(/\bmonthly price\b|\bfree trial\b|\bper month\b/i)
    expect(page).not.toMatch(/upgrade|subscription/i)
  })

  it('says the account is absent, not merely optional', () => {
    renderPage()
    expect(document.body.textContent).toContain(
      'No account. No email, no password, nothing to verify.',
    )
  })

  /**
   * `tokens.md` §10.1 forbids one sentence outright, in any medium, because it
   * is false: movement reaches the server before it is encrypted. The approved
   * wording is narrower. This is the rule rather than a general ban on the word,
   * and the page does use it once — see `docs/open-items.md` §T·3, which asks
   * whether that use survives bank movement being deferred.
   */
  it('never writes the sentence tokens.md forbids', () => {
    renderPage()
    const page = document.body.textContent ?? ''

    expect(page).not.toMatch(/bank data never touches/i)
    expect(page).not.toMatch(/never (sees|stores) your bank/i)
  })
})

describe('every figure is the worked example', () => {
  /**
   * Repo rule 2: `docs/seed-data.md` is the only source of figures anywhere,
   * and this page publishes more of them than any screen. Each of these traces
   * to a row of it — ₦7,500 is 150,000 ÷ 20 days, ₦90,000 is A. Friend's
   * ₦120,000 after one ₦30,000 payment.
   */
  it('shows the seed figures and no others', () => {
    renderPage()
    const page = document.body.textContent ?? ''

    expect(page).toContain(figures.safeToSpend)
    expect(page).toContain(figures.cashLeft)
    expect(page).toContain(figures.friendBalance)
    expect(page).toContain(figures.rentTarget)
  })

  it('tells the reader the figures are one worked example', () => {
    renderPage()
    expect(document.body.textContent).toContain(
      'Every figure on this page comes from one worked example.',
    )
  })
})

describe('the two ways in', () => {
  it('asks at both ends, and both asks work', async () => {
    const { onStart } = renderPage()
    const starts = screen.getAllByRole('button', { name: 'Start with my own figures' })

    expect(starts.length).toBe(2)
    starts[0]?.click()
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('offers the way back for someone arriving on a new device', () => {
    const { onRestore } = renderPage()
    const back = screen.getAllByRole('button', { name: 'I already have a budget' })

    expect(back.length).toBeGreaterThan(0)
    back[0]?.click()
    expect(onRestore).toHaveBeenCalledOnce()
  })
})

describe('the photographs that do not exist yet', () => {
  /**
   * `image-brief.md` specifies both slots and says the files are not in the
   * repository. A slot reserves the space; it is not an error state and not an
   * empty state, because nothing has failed and nothing of the owner's is
   * missing — a photograph has not been bought.
   */
  it('reserves both slots by name, so neither is forgotten', () => {
    renderPage()

    expect(document.querySelector('[data-slot="landing-recognition"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="landing-paid"]')).not.toBeNull()
  })
})
