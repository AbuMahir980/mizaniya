/**
 * WHAT: The overlay — a bottom sheet on a phone, a centred dialog at 1440.
 * WHY:  Built on Radix Dialog rather than hand-rolled, because focus trapping,
 *       Escape, `aria-modal`, scroll locking and returning focus to the trigger
 *       are five things that are easy to half-do and invisible when you do.
 * INTERVIEW: I used a headless primitive for the modal so the accessibility
 *       behaviour came from a library that has already got it right.
 */

import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { cx } from './cx'

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Always present, even when the design shows no visible heading. */
  title: string
  hideTitle?: boolean
  description?: string
  children: ReactNode
  /** Pinned below the content — Save, Cancel. */
  footer?: ReactNode
  className?: string
}

export function Sheet({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  children,
  footer,
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          className={cx(
            'fixed z-50 flex flex-col bg-card',
            // Phone: a bottom sheet that does not cover the whole screen, so the
            // owner keeps their place in what is behind it.
            'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t border-line',
            // Desktop: a centred dialog.
            'desktop:inset-auto desktop:left-1/2 desktop:top-1/2 desktop:w-[480px]',
            'desktop:-translate-x-1/2 desktop:-translate-y-1/2',
            'desktop:rounded-xl desktop:border',
            'shadow-card',
            className,
          )}
        >
          <div className="flex items-center justify-between gap-12 px-16 pt-16">
            <Dialog.Title
              className={cx('font-voice text-title text-ink', hideTitle && 'sr-only')}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex h-target w-target items-center justify-center rounded-md text-soft"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </div>

          {description ? (
            <Dialog.Description className="px-16 pt-4 text-small text-soft">
              {description}
            </Dialog.Description>
          ) : null}

          <div className="flex-1 overflow-y-auto px-16 py-16">{children}</div>

          {footer ? (
            <div className="border-t border-hair px-16 py-12 pb-[max(12px,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * A confirmation. Deliberately **neutral**, never danger-coloured — deleting a
 * transaction you typed twice is an ordinary action, and the label carries the
 * consequence: "Delete this ₦3,500.00 expense? This can't be undone."
 */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={body}
      footer={
        <div className="flex gap-12">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-target flex-1 rounded-md border border-line bg-card text-body font-semibold text-ink"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-target flex-1 rounded-md border border-line bg-card text-body font-semibold text-ink"
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <span className="sr-only">{body}</span>
    </Sheet>
  )
}
