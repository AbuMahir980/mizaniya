import type { ReactNode } from 'react'
import { cx } from '@/ui/cx'

/**
 * One horizontal band of the page, owning the only two measurements that repeat.
 *
 * The boards are drawn at two widths and the gutters are not the app's: **24px
 * at 390, and 96px × 150px at 1440**, on a 1440 frame — so the content column
 * is 1140px, not a narrow centred measure. Building it per section is how the
 * first attempt ended up at a 1024px column with everything choked into the
 * middle of a desktop window.
 *
 * `tone` is the alternation the boards use to separate an argument from the
 * section before it; `card2` is the warmer paper.
 */
export interface LandingBandProps {
  children: ReactNode
  tone?: 'page' | 'raised'
  /** The hero and the footer carry their own rules rather than a background. */
  edge?: 'top' | 'none'
  labelledBy?: string
  className?: string
}

export function LandingBand({
  children,
  tone = 'page',
  edge = 'none',
  labelledBy,
  className,
}: LandingBandProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx(
        'px-24 py-44 desktop:px-150 desktop:py-96',
        tone === 'raised' ? 'bg-card2' : 'bg-bg',
        edge === 'top' ? 'border-t border-line' : '',
        className,
      )}
    >
      {children}
    </section>
  )
}
