/**
 * WHAT: The toast, and the single live region every screen announces through.
 * WHY:  Two channels for one fact (page specs §6). A toast is silent to a screen
 *       reader; a live region leaves a sighted owner unsure the save landed. Each
 *       channel has someone who only has that one, so both ship together.
 * INTERVIEW: I paired the visible confirmation with one polite live region per
 *       screen, and announced only the figure the user came for rather than every
 *       number that changed.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'

interface Announcement {
  /** What the toast shows: "Saved." */
  toast: string
  /**
   * What the live region says. A save changes a dozen figures; this is the one
   * the owner came for — "Saved. Safe to spend today, 7,500 naira."
   */
  spoken?: string
  tone?: 'neutral' | 'alert'
}

interface AnnounceApi {
  announce: (announcement: Announcement) => void
}

const AnnounceContext = createContext<AnnounceApi | null>(null)

const TOAST_MS = 4000

export function AnnounceProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Announcement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback((announcement: Announcement) => {
    if (timer.current) clearTimeout(timer.current)
    setCurrent(announcement)
    timer.current = setTimeout(() => setCurrent(null), TOAST_MS)
  }, [])

  const api = useMemo(() => ({ announce }), [announce])

  return (
    <AnnounceContext.Provider value={api}>
      {children}

      {/* One region per screen, always mounted. Mounting it with the message
          would mean some readers never see the change and stay silent. */}
      <div
        role={current?.tone === 'alert' ? 'alert' : 'status'}
        aria-live={current?.tone === 'alert' ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="sr-only"
      >
        {current ? (current.spoken ?? current.toast) : ''}
      </div>

      {current ? (
        <div
          // Spoken by the region above, so the visible copy is hidden from
          // readers — otherwise the same sentence is announced twice.
          aria-hidden="true"
          className={cx(
            'pointer-events-none fixed inset-x-0 z-50 flex justify-center',
            // Clear of the bottom bar, and of the home indicator below it.
            'bottom-[calc(72px+env(safe-area-inset-bottom))]',
          )}
        >
          <div
            className={cx(
              'rounded-md border border-line bg-card px-16 py-12 shadow-card',
              'font-structural text-body text-ink',
            )}
          >
            {current.toast}
          </div>
        </div>
      ) : null}
    </AnnounceContext.Provider>
  )
}

export function useAnnounce(): AnnounceApi {
  const context = useContext(AnnounceContext)
  if (!context) {
    throw new Error('useAnnounce must be used inside an AnnounceProvider')
  }
  return context
}
