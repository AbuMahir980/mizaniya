import type { ReactNode } from 'react'
import { cx } from './cx'

export interface FigureLinkProps {
  children: ReactNode
  onClick: () => void
  /**
   * What opens, for a screen reader — "₦220,000.00" alone does not say that
   * activating it goes anywhere.
   */
  label: string
  className?: string
}

export function FigureLink({ children, onClick, label, className }: FigureLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // A real button, so the global focus ring in index.css applies and the
      // keyboard reaches it without any work here (J5).
      className={cx(
        'inline underline decoration-line underline-offset-4',
        'hover:decoration-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
