/**
 * WHAT: Where the whole cycle's take-home went — a gapped segmented rail with a
 *       mono key beneath it.
 * WHY:  **Every diagram carries a text key** (tokens.md §6). The rail is a
 *       summary, not the record: a segment two pixels wide is unreadable, and
 *       the row beside it says the figure in words and numbers.
 * INTERVIEW: I gave every diagram a text key, because a chart that is the only
 *       way to read a figure excludes anyone who cannot see it.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

export type SegmentTone = 'spent' | 'saved' | 'debt' | 'protected' | 'free'

/** The five tones, in the order tokens.md §6 sets them. */
const FILLS: Record<SegmentTone, string> = {
  spent: 'bg-emerald',
  saved: 'bg-slate',
  debt: 'bg-ochre',
  protected: 'bg-faint',
  free: 'bg-track',
}

export interface Segment {
  tone: SegmentTone
  label: string
  /** In kobo. */
  amount: number
  /** Already formatted, so this component never touches money maths (H3). */
  formatted: ReactNode
}

export interface MoneyBreakdownProps {
  segments: Segment[]
  /** The whole take-home the segments divide. */
  total: number
  /** Closes the key, ending in the hero figure. */
  footer?: { label: string; formatted: ReactNode }
  caption: string
  className?: string
}

export function MoneyBreakdown({
  segments,
  total,
  footer,
  caption,
  className,
}: MoneyBreakdownProps) {
  const shown = segments.filter((s) => s.amount > 0)

  return (
    <div className={cx('flex flex-col gap-12', className)}>
      {/* Gapped, so two adjacent segments of the same weight stay countable. */}
      <div className="flex h-12 gap-4 overflow-hidden rounded-full" role="img" aria-label={caption}>
        {shown.map((segment) => (
          <span
            key={segment.tone}
            className={cx('rounded-full', FILLS[segment.tone])}
            style={{ width: `${total > 0 ? (segment.amount / total) * 100 : 0}%` }}
          />
        ))}
        {shown.length === 0 ? <span className="w-full rounded-full bg-track" /> : null}
      </div>

      <dl className="flex flex-col gap-4">
        {shown.map((segment) => (
          <div key={segment.tone} className="flex items-baseline justify-between gap-12">
            <dt className="flex items-center gap-8 font-data text-mlab uppercase text-soft">
              <span
                aria-hidden="true"
                className={cx('h-8 w-8 shrink-0 rounded-full', FILLS[segment.tone])}
              />
              {segment.label}
            </dt>
            <dd className="font-data text-small text-ink">{segment.formatted}</dd>
          </div>
        ))}

        {footer ? (
          <div className="mt-4 flex items-baseline justify-between gap-12 border-t border-line pt-8">
            <dt className="font-data text-mlab uppercase text-soft">{footer.label}</dt>
            <dd className="font-data text-small font-semibold text-ink">{footer.formatted}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
