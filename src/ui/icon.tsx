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
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
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
