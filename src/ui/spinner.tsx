/**
 * WHAT: The loading mark.
 * WHY:  It keeps turning under `prefers-reduced-motion`, which is the one
 *       deliberate exception in the whole system — a still spinner conveys
 *       nothing, so stopping it would remove information rather than motion.
 * INTERVIEW: I honoured reduced-motion everywhere except the spinner, because
 *       the point of that setting is to remove decoration, not meaning.
 */

import { cx } from './cx'

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx('spinner animate-spin', className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
