/**
 * WHAT: The launch screen — the mark, the name, and one line of reassurance.
 * WHY:  **It is the moment the app is reading IndexedDB**, not a timed splash.
 *       The artboards draw it as the left panel of `01-welcome-*`, before the
 *       screen with the content on it, and the app already had that moment: it
 *       was rendering a spinner in a row. No artificial delay is added — if the
 *       read is instant the screen is instant, because a splash that exists to
 *       be looked at is a cost with nothing behind it.
 * INTERVIEW: I mapped the designed launch screen onto the real moment the app
 *       spends opening its database, rather than inventing a timed splash to
 *       justify showing it.
 */

import { Mark } from '@/ui/mark'
import { WordmarkArabic } from '@/ui/wordmark-arabic'

export function LaunchScreen() {
  return (
    <div
      // `status`, not a spinner. The artboard draws no spinner, and a screen
      // reader must still be told the app is working rather than finished.
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen flex-col items-center justify-center gap-[22px] px-6"
    >
      {/* The bare mark here, not the app-icon tile: the tile belongs to the
          welcome screen, which is where the installed identity is established. */}
      <Mark size={74} className="text-emerald" />

      <div className="text-center">
        <div className="font-voice text-title font-semibold text-ink">Mizaniya</div>
        {/* Under the Latin, never above it, and never carrying a figure. */}
        <WordmarkArabic fontSize={19} className="mx-auto text-soft" />
      </div>

      <p className="absolute inset-x-0 bottom-[34px] text-center font-structural text-small text-faint">
        Everything stays on this device
      </p>

      <span className="sr-only">Opening your records…</span>
    </div>
  )
}
