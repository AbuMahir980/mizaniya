/**
 * WHAT: The status marks — On track · Low · Short · Overdue · Overspent — and the
 *       neutral pills that label a movement type.
 * WHY:  The word is the signal and the colour is the reinforcement, never the
 *       other way round. A colourblind owner reading "Overspent" loses nothing,
 *       which is what "colour is never alone" means in practice (J, 1.4.1).
 * INTERVIEW: I built the status component around its text, so the colour is a
 *       second channel rather than the only one.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

/**
 * `danger` is money going wrong and nothing else. `neutral` is what a movement
 * type, a filter or a count uses — see `hueMeaning` in the tokens module.
 */
export type PillTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'quiet'

const tones: Record<PillTone, string> = {
  neutral: 'bg-sl2 text-slate',
  positive: 'bg-em2 text-emerald',
  warning: 'bg-oc2 text-ochre',
  danger: 'bg-ro2 text-rose',
  quiet: 'bg-track text-soft',
}

export interface PillProps {
  tone?: PillTone
  children: ReactNode
  className?: string
}

export function Pill({ tone = 'neutral', children, className }: PillProps) {
  return (
    <span
      className={cx(
        'inline-flex h-[25px] items-center rounded-sm px-8',
        'font-structural text-lab uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** The five statuses, so a screen cannot invent a sixth or mis-tone one. */
export const STATUS = {
  onTrack: { label: 'On track', tone: 'positive' },
  low: { label: 'Low', tone: 'warning' },
  short: { label: 'Short', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  overspent: { label: 'Overspent', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: PillTone }>

export type StatusKey = keyof typeof STATUS

export function StatusPill({ status, className }: { status: StatusKey; className?: string }) {
  const { label, tone } = STATUS[status]
  return (
    <Pill tone={tone} className={className}>
      {label}
    </Pill>
  )
}

/** A 38px tinted square carrying one icon, for a row that needs an identity. */
export function IconTile({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: PillTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
