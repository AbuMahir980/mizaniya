import { cx } from './cx'

const SIZE = 200
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CENTRE = SIZE / 2
/** Half a circle: π·r, swept from west to east. */
const ARC = Math.PI * RADIUS

function arcPath(): string {
  return `M ${STROKE / 2} ${CENTRE} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE - STROKE / 2} ${CENTRE}`
}

/** Where a value sits on the semicircle, as a point on its edge. */
function pointAt(fraction: number): { x: number; y: number } {
  const angle = Math.PI * (1 - Math.min(Math.max(fraction, 0), 1))
  return { x: CENTRE + RADIUS * Math.cos(angle), y: CENTRE - RADIUS * Math.sin(angle) }
}

export type GaugeTone = 'positive' | 'warning' | 'danger'

const STROKES: Record<GaugeTone, string> = {
  positive: 'stroke-emerald',
  warning: 'stroke-ochre',
  danger: 'stroke-rose',
}

export interface GaugeProps {
  /** Today's figure, and the allowance it is measured against. */
  value: number
  max: number
  /** Marked as an ochre tick. Omitted when there is no plan to derive it from. */
  threshold?: number
  tone?: GaugeTone
  /** The figure, already formatted. Sits in the opening. */
  children: React.ReactNode
  /** Said aloud in place of the drawing. */
  label: string
  className?: string
}

export function Gauge({
  value,
  max,
  threshold,
  tone = 'positive',
  children,
  label,
  className,
}: GaugeProps) {
  // A negative figure fills nothing: the arc cannot show less than empty, and
  // the colour and the number both already say it is negative.
  const fraction = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const tick = threshold !== undefined && max > 0 ? pointAt(threshold / max) : undefined

  return (
    <div className={cx('relative inline-flex flex-col items-center', className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${CENTRE + STROKE}`}
        className="w-full max-w-[260px]"
        role="img"
        aria-label={label}
      >
        <path
          d={arcPath()}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-track"
        />
        <path
          d={arcPath()}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className={STROKES[tone]}
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - fraction)}
        />

        {/* The amber threshold, as a tick across the bed (tokens.md §6). */}
        {tick ? (
          <circle cx={tick.x} cy={tick.y} r={3} className="fill-ochre" aria-hidden="true" />
        ) : null}
      </svg>

      {/* In the opening, never over the arc. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4">
        {children}
      </div>
    </div>
  )
}
