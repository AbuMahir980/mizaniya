import type { ReactNode } from 'react'
import { cx } from '@/ui/cx'

/**
 * One horizontal band of the page, and **the only place its gutters are
 * written down.**
 *
 * The boards are drawn at two widths with gutters that are not the app's: 24px
 * at 390, and 96px × 150px on a 1440 frame, so the content column is 1140px.
 * Writing that per section is how the page ended up with half its bands on the
 * board's measure and half on none — the owner saw it immediately, down the
 * whole right edge.
 *
 * `tone` is the alternation the boards use to set an argument apart from what
 * came before it. `card2` is the warmer paper.
 */
/**
 * The gutters, written once. The hero lays itself out differently from every
 * other band but sits on the same measure, so it reads this rather than
 * repeating it — which is the whole fault this component exists to end.
 */
export const GUTTER = 'px-24 desktop:px-150'

export interface LandingBandProps {
  children: ReactNode
  tone?: 'page' | 'raised'
  /** A rule above the band, where the boards draw one. */
  edge?: boolean
  labelledBy?: string
  /** Layout *inside* the band. Never padding — that is this component's job. */
  className?: string
}

export function LandingBand({
  children,
  tone = 'page',
  edge = false,
  labelledBy,
  className,
}: LandingBandProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx(
        GUTTER,
        'py-44 desktop:py-96',
        tone === 'raised' ? 'bg-card2' : 'bg-bg',
        edge ? 'border-t border-line' : '',
      )}
    >
      {className === undefined ? children : <div className={className}>{children}</div>}
    </section>
  )
}
