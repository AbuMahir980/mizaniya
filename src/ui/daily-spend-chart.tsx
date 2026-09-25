import { cx } from './cx'

export interface DayBar {
  date: string
  /** Spent that day, in kobo. */
  amount: number
  isToday: boolean
}

export interface DailySpendChartProps {
  days: DayBar[]
  /** The planned daily allowance, drawn as a dashed line. */
  allowance: number
  /** Said aloud in place of the drawing; the table beneath is the real key. */
  label: string
  className?: string
}

export function DailySpendChart({ days, allowance, label, className }: DailySpendChartProps) {
  // The tallest thing on the chart is either the biggest day or the allowance,
  // so the line is always visible even in a cycle where nothing was spent.
  const ceiling = Math.max(allowance, ...days.map((d) => d.amount), 1)
  const linePercent = (allowance / ceiling) * 100

  return (
    <div className={cx('relative w-full', className)} role="img" aria-label={label}>
      <div className="relative flex h-[96px] items-end gap-[2px]">
        {days.map((day) => {
          const height = (day.amount / ceiling) * 100
          const over = day.amount > allowance
          return (
            <span
              key={day.date}
              className={cx(
                'min-w-[2px] flex-1 rounded-sm',
                day.isToday ? 'bg-emerald' : over ? 'bg-ochre' : 'bg-faint/[0.38]',
              )}
              style={{ height: `${Math.max(height, day.amount > 0 ? 2 : 0)}%` }}
            />
          )
        })}

        {/* The allowance line sits over the bars, so a day that clears it reads
            as clearing it rather than as touching it. */}
        {allowance > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate"
            style={{ bottom: `${linePercent}%` }}
          />
        ) : null}
      </div>
    </div>
  )
}
