/**
 * WHAT: The mizan beam — a set of scales, drawn a notch off level.
 * WHY:  Inlined rather than an `<img>`, because the strokes are `currentColor`:
 *       the component takes the colour of whatever it sits in, so one file
 *       serves the sidebar, the welcome screen and the printed record without
 *       three exports that can drift apart.
 * INTERVIEW: I inlined the logo as an SVG component so it inherits its colour,
 *       which is what let the same mark work on paper, on emerald and in dark
 *       mode from one source.
 */

import { cx } from './cx'

export interface MarkProps {
  /** Rendered square. Below 16px the pans close up — use the app icon instead. */
  size?: number
  /**
   * Given to a decorative mark beside a wordmark that already says "Mizaniya".
   * Announcing it twice is worse than not announcing it at all.
   */
  title?: string
  className?: string
}

export function Mark({ size = 24, title, className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cx('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {/* The tilt is the idea: the app says whether today is in balance, and
          most days it is not quite. Never level the beam. */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={3.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 9v30" />
        <path d="M15 39h18" />
        <circle cx="24" cy="7" r="2.6" fill="currentColor" stroke="none" />
        <path d="M9 15h30" transform="rotate(-9 24 15)" />
        <path d="M9.6 16.4 5 26a5.6 5.6 0 0 0 9.2 0z" />
        <path d="M38.4 12.6 34.6 20.4a4.6 4.6 0 0 0 7.6 0z" />
      </g>
    </svg>
  )
}
