/**
 * WHAT: Quick Add, joined to the store and the live region.
 * WHY:  **A save confirms twice** (§6): a toast for someone looking at the
 *       screen, and one polite announcement for someone who is not — carrying
 *       the figure they came for rather than the dozen that changed.
 * INTERVIEW: I announced the one number the owner came for rather than every
 *       figure a save touches, because announcing everything says nothing.
 */

import { safeToSpend } from '@/core/budget/budget'
import { speakMoney } from '@/core/money/money'
import type { Transaction } from '@/core/types'
import { QuickAdd } from '@/features/quick-add/quick-add'
import { useAnnounce } from '@/ui/announce'
import { useSnapshotActions, useSnapshotState } from './store-context'
import { useToday } from './today-context'

export interface QuickAddRouteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddRoute({ open, onOpenChange }: QuickAddRouteProps) {
  const state = useSnapshotState()
  const actions = useSnapshotActions()
  const { announce } = useAnnounce()
  const { now: today, at: instant } = useToday()

  if (state.status !== 'ready') return null


  return (
    <QuickAdd
      open={open}
      onOpenChange={onOpenChange}
      snapshot={state.snapshot}
      now={today}
      at={instant}
      onSave={async (transaction: Transaction) => {
        const result = await actions.write(
          (repository) => repository.transactions.put(transaction),
          (snapshot) => ({ ...snapshot, transactions: [...snapshot.transactions, transaction] }),
        )

        if (!result.ok) {
          // Says what happened and what to do next (L2). The sheet stays open.
          return `Couldn't save that. Your entry is still here — try again. (${result.message})`
        }

        // Read after the write, so the figure announced is the one that now
        // exists rather than the one that did a moment ago.
        const latest = actions.state
        const spoken =
          latest.status === 'ready'
            ? `Saved. Safe to spend today, ${speakMoney(safeToSpend(latest.snapshot, today).perDay)}.`
            : 'Saved.'

        announce({ toast: 'Saved.', spoken })
        return undefined
      }}
    />
  )
}
