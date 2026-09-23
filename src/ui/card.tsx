/**
 * WHAT: The card surface, and the states every list and panel needs — loading,
 *       empty and error.
 * WHY:  L1 says every async surface handles loading, empty and error explicitly.
 *       Shipping them as part of the card is what stops a screen quietly
 *       rendering nothing and calling it an empty state.
 * INTERVIEW: I made the three awkward states part of the container component, so
 *       a screen has to pass something for each rather than forgetting one.
 */

import type { ReactNode } from 'react'
import { Button } from './button'
import { cx } from './cx'
import { Spinner } from './spinner'

export interface CardProps {
  children: ReactNode
  /** A card that is itself a target — a tile that opens its records. */
  as?: 'div' | 'section' | 'article'
  className?: string
}

export function Card({ children, as: Tag = 'div', className }: CardProps) {
  return (
    <Tag
      className={cx(
        'rounded-lg border border-line bg-card p-16 shadow-card',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx('font-structural text-h2 text-ink', className)}>{children}</h2>
}

export function CardLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('font-structural text-lab uppercase text-faint', className)}>{children}</p>
  )
}

/** A skeleton block. Never a spinner for content — a spinner says "something is
 *  happening", a skeleton says "something of this shape is coming". */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('animate-pulse rounded-sm bg-track', className)}
    />
  )
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-12" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-[52px] w-full" />
      ))}
    </div>
  )
}

export interface EmptyStateProps {
  /** What this is. */
  title: string
  /** Why it is empty, and what to do next — the whole job of an empty state. */
  body: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-start gap-12 py-26', className)}>
      {/* The app's own voice, on the `statement` rung — not Inter at body size.
          Every empty state in the design says its sentence this way. */}
      <p className="font-voice text-statement text-ink">{title}</p>
      <p className="text-small text-soft">{body}</p>
      {action ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

export interface ErrorStateProps {
  /** What happened, then what to do next (L2). */
  title: string
  body: string
  onRetry?: () => void
  className?: string
}

/**
 * Deliberately **not** danger-coloured. A load that failed is not money going
 * wrong, and spending the danger colour here is how it stops meaning anything.
 */
export function ErrorState({ title, body, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cx('flex flex-col items-start gap-12 py-26', className)}>
      {/* The app's own voice, on the `statement` rung — not Inter at body size.
          Every empty state in the design says its sentence this way. */}
      <p className="font-voice text-statement text-ink">{title}</p>
      <p className="text-small text-soft">{body}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function InlineLoading({ label = 'Working' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-8 text-small text-soft" role="status">
      <Spinner />
      {label}
    </span>
  )
}
