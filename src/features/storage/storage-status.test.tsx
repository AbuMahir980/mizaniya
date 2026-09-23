/**
 * @vitest-environment jsdom
 *
 * WHAT: The storage panel in every state it can be in — pending, granted,
 *       refused, and a browser that will not say.
 * WHY:  The pending state is the one worth testing hardest. A panel that shows
 *       "Protected" for a moment before the answer arrives has told the owner
 *       something false about their financial history, and it is exactly the
 *       kind of flash nobody catches by hand.
 * INTERVIEW: I tested the moment before the answer arrives, because that is
 *       where an optimistic default does its damage.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { StorageStatus, describeUsage } from './storage-status'
import type { StorageReport } from '@/store/storage'

afterEach(cleanup)

function reportOf(report: StorageReport) {
  return async () => report
}

describe('it never guesses', () => {
  it('says Checking… before the answer arrives', () => {
    // A promise that has not settled: exactly the first frame.
    render(<StorageStatus read={() => new Promise<StorageReport>(() => {})} />)

    expect(screen.getAllByText('Checking…').length).toBeGreaterThan(0)
    expect(screen.queryByText(/Protected\./)).toBeNull()
    expect(screen.queryByText(/Not protected/)).toBeNull()
  })

  it('marks itself busy while it is still asking', () => {
    render(<StorageStatus read={() => new Promise<StorageReport>(() => {})} />)
    const live = screen.getAllByText('Checking…')[0]!
    expect(live.getAttribute('aria-busy')).toBe('true')
  })
})

describe('the three answers', () => {
  it('reports granted', async () => {
    render(
      <StorageStatus
        read={reportOf({ persistence: 'granted', usage: { usage: 2_200_000, quota: undefined } })}
      />,
    )
    expect(await screen.findByText(/^Protected\./)).toBeDefined()
    expect(screen.getByText('2.1 MB')).toBeDefined()
  })

  it('reports refused, and says what to do about it (L2)', async () => {
    render(
      <StorageStatus
        read={reportOf({ persistence: 'refused', usage: { usage: 1024, quota: undefined } })}
      />,
    )
    const line = await screen.findByText(/Not protected/)
    expect(line.textContent).toContain('Install the app and export regularly')
  })

  it('does not call an unsupported browser a refusal', async () => {
    render(
      <StorageStatus
        read={reportOf({
          persistence: 'unsupported',
          usage: { usage: undefined, quota: undefined },
        })}
      />,
    )
    const line = await screen.findByText(/won’t say whether/)
    // "Refused" would be inventing a rejection the browser never made.
    expect(line.textContent).not.toContain('Not protected')
  })

  it('announces the outcome politely when it resolves', async () => {
    const { container } = render(
      <StorageStatus
        read={reportOf({ persistence: 'granted', usage: { usage: 0, quota: undefined } })}
      />,
    )
    await screen.findByText(/^Protected\./)
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    await waitFor(() => expect(live?.getAttribute('aria-busy')).toBeNull())
  })
})

describe('space used', () => {
  it('is “Not known” rather than zero when the browser will not say', () => {
    // "0 bytes used" is a claim about someone's records, and it would be false.
    expect(describeUsage({ usage: undefined, quota: undefined })).toBe('Not known')
  })

  it('reports a genuinely tiny figure as under 0.1 MB, not as nothing', () => {
    expect(describeUsage({ usage: 4096, quota: undefined })).toBe('Under 0.1 MB')
  })

  it('rounds to one decimal place', () => {
    expect(describeUsage({ usage: 5 * 1024 * 1024, quota: undefined })).toBe('5.0 MB')
  })
})
