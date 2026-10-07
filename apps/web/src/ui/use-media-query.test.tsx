/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { DESKTOP, useMediaQuery } from './use-media-query'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/**
 * jsdom has no `matchMedia`, so a fake stands in. It is deliberately a real
 * event target rather than a stub with a recorded listener: the hook's whole job
 * is to answer the current width and to re-answer when it changes, and a stub that
 * never fires would let a hook that ignores the event pass.
 */
function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>()
  const list = {
    matches: initial,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) =>
      void listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) =>
      void listeners.delete(listener),
  }
  const change = (matches: boolean) => {
    list.matches = matches
    for (const listener of listeners) listener({ matches })
  }
  return { list, change, listenerCount: () => listeners.size }
}

function Probe({ query = DESKTOP }: { query?: string }) {
  return <output>{useMediaQuery(query) ? 'wide' : 'narrow'}</output>
}

describe('it answers the width it is asked about', () => {
  it('answers from the first render, with no frame showing the wrong layout', () => {
    const { list } = fakeMatchMedia(true)
    vi.stubGlobal('matchMedia', () => list)
    render(<Probe />)
    expect(screen.getByRole('status').textContent).toBe('wide')
  })

  it('answers narrow when the query does not match', () => {
    const { list } = fakeMatchMedia(false)
    vi.stubGlobal('matchMedia', () => list)
    render(<Probe />)
    expect(screen.getByRole('status').textContent).toBe('narrow')
  })

  /**
   * Without `matchMedia` it answers `true`. That is jsdom rather than a browser, and
   * the wide layout is the one with more to assert against — which is what every
   * other test in this suite relies on.
   */
  it('answers wide where matchMedia does not exist at all', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(<Probe />)
    expect(screen.getByRole('status').textContent).toBe('wide')
  })
})

describe('it re-answers when the width changes', () => {
  it('follows a change event rather than keeping its first answer', () => {
    const { list, change } = fakeMatchMedia(false)
    vi.stubGlobal('matchMedia', () => list)
    render(<Probe />)
    expect(screen.getByRole('status').textContent).toBe('narrow')

    act(() => change(true))
    expect(screen.getByRole('status').textContent).toBe('wide')

    act(() => change(false))
    expect(screen.getByRole('status').textContent).toBe('narrow')
  })

  /** PERF-06: what is started is stopped. A listener left behind leaks per mount. */
  it('removes its listener when the component goes away', () => {
    const { list, listenerCount } = fakeMatchMedia(true)
    vi.stubGlobal('matchMedia', () => list)
    const view = render(<Probe />)
    expect(listenerCount()).toBe(1)
    view.unmount()
    expect(listenerCount()).toBe(0)
  })
})
