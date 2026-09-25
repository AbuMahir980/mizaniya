import type { ReactNode } from 'react'
import { cx } from './cx'

export type BannerTone = 'neutral' | 'action' | 'danger'

const tones: Record<BannerTone, string> = {
  neutral: 'border-line bg-card text-ink',
  action: 'border-line bg-em2 text-ink',
  danger: 'border-line bg-ro2 text-ink',
}

export interface BannerProps {
  tone?: BannerTone
  children: ReactNode
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
  className?: string
}

export function Banner({ tone = 'neutral', children, action, onDismiss, className }: BannerProps) {
  return (
    <div
      className={cx(
        'flex min-h-target items-center gap-12 rounded-md border px-12 py-8',
        'font-structural text-body',
        tones[tone],
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="min-h-target min-w-target shrink-0 px-8 font-semibold text-emerald"
        >
          {action.label}
        </button>
      ) : null}

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex h-target w-target shrink-0 items-center justify-center text-soft"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

/**
 * Offline is not an error (L4). There is no network in v1, so this exists to say
 * *your data is on this device*, not to report a failure — which is why it is
 * neutral, dismissible, and worded without alarm.
 */
export function OfflineNote({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <Banner tone="neutral" onDismiss={onDismiss}>
      <span className="text-small">
        You&rsquo;re offline. Mizaniya works the same — your data is on this device.
      </span>
    </Banner>
  )
}
