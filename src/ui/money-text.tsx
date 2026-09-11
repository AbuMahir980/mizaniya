/**
 * WHAT: Renders an amount — naira at full size, kobo smaller and lighter — and
 *       attaches the words a screen reader says instead.
 * WHY:  The only component that formats money (H2), so `₦7,500.00` cannot be
 *       assembled by hand anywhere else and drift. The two spans exist because
 *       the hero's width problem is typographic, not numeric.
 * INTERVIEW: I made one component the sole renderer of money, so the display
 *       rule and the spoken rule are defined once and cannot disagree.
 */

import { formatMoney, speakMoney, splitMoney } from '../core/money/money'
import type { Kobo } from '../core/types'
import { cx } from './cx'

export type MoneyTone = 'default' | 'muted' | 'positive' | 'warning' | 'danger'

const toneClass: Record<MoneyTone, string> = {
  default: 'text-ink',
  muted: 'text-soft',
  positive: 'text-emerald',
  warning: 'text-ochre',
  danger: 'text-rose',
}

export interface MoneyTextProps {
  amount: Kobo
  /**
   * Shows the amount as an overspend: `₦2,300.00 over`, spoken the same way.
   * **A bare minus sign is never rendered** — direction is a word (page specs §8).
   */
  over?: boolean
  tone?: MoneyTone
  /** Inside a chart or the money breakdown, money is set in the data face. */
  face?: 'structural' | 'data'
  className?: string
}

export function MoneyText({
  amount,
  over = false,
  tone = 'default',
  face = 'structural',
  className,
}: MoneyTextProps) {
  const showAsOver = over || amount < 0
  const magnitude = (showAsOver ? Math.abs(amount) : amount) as Kobo
  const parts = splitMoney(magnitude)

  return (
    <span
      className={cx(
        'money',
        face === 'data' ? 'font-data' : 'font-structural',
        toneClass[tone],
        className,
      )}
    >
      {/* One accessible string, so the reader never hears "point zero zero". */}
      <span aria-hidden="true">
        <span className="money-naira">{parts.naira}</span>
        <span className="money-kobo">{parts.kobo}</span>
        {showAsOver ? ' over' : null}
      </span>
      <span className="sr-only">{speakMoney(magnitude, { over: showAsOver })}</span>
    </span>
  )
}

/** For a `title` attribute or a plain-text context. Same formatter, no markup. */
export function moneyString(amount: Kobo): string {
  return formatMoney(amount)
}
