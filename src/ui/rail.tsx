/**
 * WHAT: The progress rail — a category against its allowance, a goal against its
 *       target — always beside a figure, never alone.
 * WHY:  A bar is a comparison you can misread by a few percent. The percentage
 *       sits next to it because the bar is the impression and the number is the
 *       fact, and on a money screen the fact has to be available.
 * INTERVIEW: I never let a chart be the only way to read a value — every bar
 *       ships with its number, which is also what makes it screen-readable.
 */

import { cx } from './cx'

export type RailTone = 'positive' | 'warning' | 'danger' | 'neutral'

const fills: Record<RailTone, string> = {
  positive: 'bg-emerald',
  warning: 'bg-ochre',
  danger: 'bg-rose',
  neutral: 'bg-slate',
}

export interface RailProps {
  /** 0–1. Values above 1 are clamped for the bar and reported in the label. */
  value: number
  tone?: RailTone
  /** What the bar is measuring — required, because the bar needs a name aloud. */
  label: string
  className?: string
}

export function Rail({ value, tone = 'positive', label, className }: RailProps) {
  const safe = Number.isFinite(value) ? Math.max(value, 0) : 0
  const width = Math.min(safe, 1) * 100
  const percent = Math.round(safe * 100)

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}% of ${label}`}
      className={cx('h-[6px] w-full overflow-hidden rounded-sm bg-track', className)}
    >
      <div
        className={cx('h-full rounded-sm transition-[width] duration-base', fills[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

/**
 * The rail with its percentage beside it, which is how it appears in a table.
 * `over` is what happens past 100% — the bar fills and the figure states the
 * excess, rather than a bar that silently stops growing.
 */
export function RailWithValue({
  value,
  tone = 'positive',
  label,
  className,
}: RailProps) {
  const percent = Math.round(Math.max(value, 0) * 100)
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <Rail value={value} tone={tone} label={label} className="flex-1" />
      <span
        aria-hidden="true"
        className="w-[44px] shrink-0 text-right font-data text-mlab text-soft"
      >
        {percent}%
      </span>
    </div>
  )
}
