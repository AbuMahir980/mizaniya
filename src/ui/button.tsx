/**
 * WHAT: The three buttons — primary, secondary, quiet — each with every state.
 * WHY:  There is deliberately **no danger variant**. Deleting a transaction is an
 *       ordinary action, and the addendum reserves the danger colour for money
 *       going wrong; a red Delete button would spend that signal on a routine tap.
 * INTERVIEW: I left the destructive-button variant out on purpose, because the
 *       warning colour only works if it means one thing.
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from './cx'
import { Spinner } from './spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'

const base = cx(
  'inline-flex items-center justify-center gap-8',
  'min-h-target px-16 rounded-md',
  'text-body font-structural font-semibold',
  'transition-colors duration-fast',
  'disabled:cursor-not-allowed',
)

const variants: Record<ButtonVariant, string> = {
  primary: cx(
    'bg-emerald text-onEmerald shadow-lift',
    'active:opacity-90',
    // A disabled button is `track` on `faint` and must not glow: the lift says
    // "press this", and saying it of something that cannot be pressed is worse
    // than saying nothing.
    'disabled:bg-track disabled:text-faint disabled:shadow-none',
  ),
  secondary: cx(
    'bg-card text-ink border border-line',
    'active:bg-bg',
    'disabled:text-faint disabled:bg-card',
  ),
  quiet: cx('bg-transparent text-soft', 'active:text-ink', 'disabled:text-faint'),
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Keeps the button's width while it works, so the layout does not jump. */
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      // A loading button is not disabled — a disabled control loses focus, and
      // losing focus mid-action is disorienting for a keyboard user.
      aria-busy={loading || undefined}
      aria-disabled={loading || rest.disabled || undefined}
      className={cx(
        base,
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
      onClick={loading ? undefined : rest.onClick}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
})
