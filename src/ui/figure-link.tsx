/**
 * WHAT: A figure that opens the records behind it, set inline in a sentence.
 * WHY:  **No figure is a dead end** — every number on a screen can be traced to
 *       the movements that produced it. That makes an inline, text-weight
 *       control a recurring need, and a `Button` is the wrong shape for it: a
 *       button in the middle of a sentence breaks the line.
 * INTERVIEW: I made "open the records behind this number" a primitive, because
 *       it appears on every screen and a styled div would have lost the
 *       keyboard for all of them.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

export interface FigureLinkProps {
  children: ReactNode
  onClick: () => void
  /**
   * What opens, for a screen reader — "₦220,000.00" alone does not say that
   * activating it goes anywhere.
   */
  label: string
  className?: string
}

export function FigureLink({ children, onClick, label, className }: FigureLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // A real button, so the global focus ring in index.css applies and the
      // keyboard reaches it without any work here (J5).
      className={cx(
        'inline underline decoration-line underline-offset-4',
        'hover:decoration-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
