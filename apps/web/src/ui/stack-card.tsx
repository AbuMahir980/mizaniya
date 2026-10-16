import type { ReactNode } from 'react'

export interface StackCardProps {
  /** What the card is, for a reader who cannot see the pile. */
  label: string
  /** Where it sits in the pile right now, so the stack reorders without the
   *  markup moving: a screen reader reads the cards in one fixed order. */
  zIndex: number
  /** Bring this card to the front. */
  onBringForward: () => void
  className?: string
  children: ReactNode
}

/**
 * A card in a cascade, which comes to the front when it is pressed or focused.
 *
 * It is a button because it does something — on a phone the board's own
 * instruction is *"Tap a card to lift it off the pile"*, and a tap that does
 * nothing is worse than a pile that never moved. Focus brings it forward too,
 * so the keyboard reaches every card without a pointer, which is `motion.md`
 * §6: hover is never the only signal.
 *
 * The lift itself is CSS, in `tokens.css` under `.stack` — `transform` and
 * `box-shadow` only, dropped under `prefers-reduced-motion`.
 */
export function StackCard({ label, zIndex, onBringForward, className, children }: StackCardProps) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{ zIndex }}
      onClick={onBringForward}
      onFocus={onBringForward}
      className={`block cursor-default text-left ${className ?? ''}`}
    >
      {children}
    </button>
  )
}
