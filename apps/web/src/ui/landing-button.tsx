import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

/**
 * `.lbtn` from the landing boards, which is **not** the app's `Button`.
 *
 * The canvas gives it its own numbers — 52px tall, 14px radius, 15.5px at 600,
 * 26px of side padding — against the app button's 48/13/14.5. A marketing
 * surface read at arm's length on a laptop takes a larger control than a screen
 * read on a phone, and the boards are consistent about it.
 *
 * Mapped once here rather than approximated at each call site, which is
 * `CLAUDE.md` §7 rule 3. `docs/open-items.md` §T·4 asks the designer whether
 * these should be published in `tokens.md`; until then the values are named in
 * `tokens.css` and read from there.
 */
export type LandingButtonVariant = 'primary' | 'secondary' | 'quiet'

const VARIANT: Record<LandingButtonVariant, string> = {
  primary: 'bg-emerald text-onEmerald shadow-lift',
  secondary: 'bg-card text-ink border-line',
  quiet: 'bg-transparent text-soft px-8',
}

export interface LandingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LandingButtonVariant
  /** The header's button, which the boards set two steps smaller. */
  small?: boolean
}

export function LandingButton({
  variant = 'primary',
  small,
  className,
  children,
  ...rest
}: LandingButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-10 whitespace-nowrap rounded-land border border-transparent font-structural',
        small ? 'min-h-[46px] px-20 text-land-label' : 'min-h-[52px] px-26 text-land-button',
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
