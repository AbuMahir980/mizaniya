/**
 * WHAT: The text field and the amount field, with label, helper text and error.
 * WHY:  An error here is styled **neutrally**, not in the danger colour. Typing a
 *       letter into an amount box is not money going wrong; it is an ordinary
 *       correction, and the message carries the consequence (tokens.md §2).
 * INTERVIEW: I kept validation styling neutral so the danger colour still means
 *       something when a real figure goes wrong.
 */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx'

const control = cx(
  'w-full min-h-target px-3 rounded-md',
  'bg-card text-ink border border-line',
  'text-body font-structural',
  'placeholder:text-faint',
  'transition-[border-color,box-shadow] duration-fast',
  // A 3px halo rather than the outline ring, per tokens.md §5.
  'focus:outline-none focus:border-emerald focus:ring-[3px] focus:ring-em2',
  'disabled:bg-track disabled:text-faint disabled:cursor-not-allowed',
)

interface FieldShellProps {
  label: string
  /** Hidden visually but always present — every input has a name (J2). */
  hideLabel?: boolean
  helper?: ReactNode
  error?: string
  required?: boolean
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode
}

function FieldShell({ label, hideLabel, helper, error, required, children }: FieldShellProps) {
  const inputId = useId()
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`
  const describedBy = cx(helper ? helperId : '', error ? errorId : '').trim() || undefined

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className={cx('text-small font-structural text-soft', hideLabel && 'sr-only')}
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {children({ inputId, describedBy })}

      {helper && !error ? (
        <p id={helperId} className="text-small text-faint">
          {helper}
        </p>
      ) : null}

      {/* Announced the moment it appears, so a keyboard user is not told only
          by a colour they may not be looking at. */}
      {error ? (
        <p id={errorId} role="alert" className="text-small text-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-describedby'> {
  label: string
  hideLabel?: boolean
  helper?: ReactNode
  error?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hideLabel, helper, error, className, required, ...rest },
  ref,
) {
  return (
    <FieldShell
      label={label}
      hideLabel={hideLabel}
      helper={helper}
      error={error}
      required={required}
    >
      {({ inputId, describedBy }) => (
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          required={required}
          className={cx(control, error && 'border-ink', className)}
          {...rest}
        />
      )}
    </FieldShell>
  )
})

export interface AmountInputProps extends Omit<FieldProps, 'type' | 'inputMode'> {
  /** Naira, as typed. The caller converts to kobo through `core/money`. */
  value: string
  onValueChange: (next: string) => void
}

/**
 * The amount field.
 *
 * Numeric keypad on a phone, and a leading ₦ that is part of the field rather
 * than a separate column — the naira sign belongs to the figure (tokens.md §4).
 * It never parses or rounds: that is `core/money`'s job (H3).
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    { label, hideLabel, helper, error, value, onValueChange, className, required, ...rest },
    ref,
  ) {
    return (
      <FieldShell
        label={label}
        hideLabel={hideLabel}
        helper={helper}
        error={error}
        required={required}
      >
        {({ inputId, describedBy }) => (
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-soft"
            >
              ₦
            </span>
            <input
              ref={ref}
              id={inputId}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              required={required}
              className={cx(
                control,
                'pl-7 text-right [font-variant-numeric:tabular-nums]',
                error && 'border-ink',
                className,
              )}
              {...rest}
            />
          </div>
        )}
      </FieldShell>
    )
  },
)
