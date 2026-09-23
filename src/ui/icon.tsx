/**
 * WHAT: The icon set — one geometric family on a 24px grid at 1.8–1.9px stroke.
 * WHY:  Taken from `docs/design/canvas/HomeLight.dc.html`, path for path, rather
 *       than drawn again or pulled from a library. A second set that is nearly
 *       the same is worse than no set: the eye reads the inconsistency long
 *       before it can name it.
 * INTERVIEW: I lifted the icon paths from the design canvas instead of adding an
 *       icon dependency, because the design already had a coherent set and the
 *       library would have been a second one.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

export type IconName =
  | 'home'
  | 'plan'
  | 'transactions'
  | 'debts'
  | 'months'
  | 'zakat'
  | 'settings'
  | 'more'
  | 'add'
  | 'target'
  | 'people'
  | 'shield-check'

/**
 * Every glyph, as the artboard draws it.
 *
 * `fill="none"` and `stroke="currentColor"` on the wrapper, so an icon takes
 * the colour of whatever it sits in — the active nav item, a pill, an emerald
 * button — without a variant per context.
 */
const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.4 12 3.5l9 6.9V20a1 1 0 0 1-1 1h-5.3v-6.3H9.3V21H4a1 1 0 0 1-1-1z" />,
  plan: (
    <>
      <path d="M4 15.5 8.5 9l4 4.5L20 5" />
      <path d="M20 5h-4.5M20 5v4.5" />
    </>
  ),
  transactions: <path d="M4 5h16M4 12h16M4 19h10" />,
  debts: (
    <>
      <path d="M16.5 20.5v-2a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4v2" />
      <circle cx="10" cy="7.6" r="3.6" />
      <path d="M20.5 20.5v-2a3.4 3.4 0 0 0-2.6-3.3M15.6 4.3a3.6 3.6 0 0 1 0 6.6" />
    </>
  ),
  months: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  zakat: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r=".9" />
    </>
  ),
  /**
   * The gear, from `docs/design/canvas/DSettingsLight.dc.html`.
   *
   * The first attempt at this one was drawn rather than found — a circle with
   * eight radiating lines — and it reads as a **sun**, so the owner saw a
   * dark-mode toggle in the sidebar. The design had the real glyph on the
   * desktop Settings artboard all along; only the *Home* artboard was checked,
   * and Home has no Settings item at 360px.
   */
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,

  /* The welcome screen's three promises. Same grid, same stroke, same family —
     lifted from WelcomeLight.dc.html rather than drawn again. */
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r=".9" />
    </>
  ),
  people: (
    <>
      <path d="M16.5 20.5v-2a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4v2" />
      <circle cx="10" cy="7.6" r="3.6" />
      <path d="M20.5 20.5v-2a3.4 3.4 0 0 0-2.6-3.3M15.6 4.3a3.6 3.6 0 0 1 0 6.6" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 3.4 20 6.2v5.9c0 4.4-3.2 7.6-8 8.7-4.8-1.1-8-4.3-8-8.7V6.2z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
}

export interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 21, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('block shrink-0', className)}
      // Always decorative: every icon in this app sits beside its own label, and
      // announcing it again would say the word twice.
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
