/**
 * WHAT: A row in a list — a transaction, a category, a setting — tappable or not.
 * WHY:  When it is tappable it renders a real `<button>`, not a div with a click
 *       handler. That is the whole of keyboard support, focus and the correct
 *       announcement, for free, and it is the thing most often got wrong.
 * INTERVIEW: I made interactive rows real buttons rather than clickable divs, so
 *       keyboard and screen-reader behaviour came from the platform.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

export interface ListRowProps {
  /** The identity mark on the left — an icon tile, or nothing. */
  leading?: ReactNode
  title: ReactNode
  /** The line under the title: a note, a carried amount, a schedule. */
  sub?: ReactNode
  /** The right-hand side — usually a figure, right-aligned and tabular. */
  trailing?: ReactNode
  /** Below both, full width — a rail, a bar showing what is left. */
  footer?: ReactNode
  onClick?: () => void
  /** What the row is called aloud, when the visible title is not enough alone. */
  accessibleName?: string
  disabled?: boolean
  className?: string
}

export function ListRow({
  leading,
  title,
  sub,
  trailing,
  footer,
  onClick,
  accessibleName,
  disabled,
  className,
}: ListRowProps) {
  const body = (
    <>
      <div className="flex w-full items-center gap-3">
        {leading}
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate font-structural text-body text-ink">{title}</div>
          {sub ? <div className="truncate text-small text-soft">{sub}</div> : null}
        </div>
        {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
      </div>
      {footer ? <div className="mt-2 w-full">{footer}</div> : null}
    </>
  )

  const shell = cx(
    'flex min-h-target w-full flex-col justify-center',
    'border-b border-hair py-3 last:border-b-0',
    className,
  )

  if (!onClick) {
    return <div className={shell}>{body}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={accessibleName}
      className={cx(
        shell,
        'text-left transition-colors duration-fast',
        'hover:bg-bg active:bg-bg',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {body}
    </button>
  )
}

export function ListGroup({
  children,
  label,
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) {
  return (
    <section className={cx('flex flex-col', className)} aria-label={label}>
      {children}
    </section>
  )
}
