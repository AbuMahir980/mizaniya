/**
 * WHAT: A button that opens the file chooser, with the input it drives kept out
 *       of sight.
 * WHY:  A bare `<input type="file">` cannot be styled to match anything, so the
 *       pattern everywhere is a visible button and a hidden input. That pattern
 *       belongs in one primitive rather than repeated on the welcome screen and
 *       again in Settings (F5, and E1 before the third copy appears).
 * INTERVIEW: I wrapped the hidden-input file pattern in a primitive, because
 *       the alternative is the same six lines of DOM plumbing on every screen
 *       that accepts a file.
 */

import { useRef, type ReactNode } from 'react'
import { Button, type ButtonVariant } from './button'

export interface FilePickerProps {
  children: ReactNode
  onFile: (file: File) => void
  /** e.g. `'application/json,.json'`. */
  accept?: string
  variant?: ButtonVariant
  loading?: boolean
  fullWidth?: boolean
  /**
   * What the chooser is for, for a screen reader. The button's own words are
   * usually enough; this exists for when they are not.
   */
  inputLabel?: string
}

export function FilePicker({
  children,
  onFile,
  accept,
  variant = 'secondary',
  loading,
  fullWidth,
  inputLabel,
}: FilePickerProps) {
  const input = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        variant={variant}
        loading={loading}
        fullWidth={fullWidth}
        onClick={() => input.current?.click()}
      >
        {children}
      </Button>

      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={inputLabel}
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Cleared first, so choosing the same file twice still fires a change
          // — the second attempt after a refusal is the common case here.
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </>
  )
}
