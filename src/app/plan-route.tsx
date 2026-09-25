import { cycleAt, plannedFor } from '@/core/budget/budget'
import { previousCycle } from '@/core/budget/rollover'
import { stamp, stampAll } from '@/core/sync/stamp'
import type { Category, Id, Kobo, PlanEntry, Unstamped } from '@/core/types'
import { PlanScreen } from '@/features/plan/plan-screen'
import { useAnnounce } from '@/ui/announce'
import { useSnapshotActions, useSnapshotState } from './store-context'
import { useToday } from './today-context'

export function PlanRoute({ makeId }: { makeId?: () => string } = {}) {
  const state = useSnapshotState()
  const actions = useSnapshotActions()
  const { announce } = useAnnounce()
  const { now: today, at: instant } = useToday()

  if (state.status !== 'ready') return null

  const newId = makeId ?? (() => crypto.randomUUID())

  async function saveRow(categoryId: Category['id'], planned: Kobo): Promise<string | undefined> {
    if (state.status !== 'ready') return 'Nothing is loaded yet.'
    const cycle = cycleAt(state.snapshot, today)

    const existing = state.snapshot.plans.find(
      (p) => p.cycleStart === cycle.start && p.categoryId === categoryId,
    )
    // Unstamped: the repository sets `updatedAt`. Spreading `existing` carries
    // its old timestamp in, and the repository replaces it — which is exactly the
    // mistake `Unstamped` exists to make impossible to get wrong.
    const entry: Unstamped<PlanEntry> = existing
      ? { ...existing, planned }
      : { id: newId() as Id, cycleStart: cycle.start, categoryId, planned }

    // The same `(row, instant)` pair produces both the stored row and the one
    // memory gets, so the two cannot differ.
    const saved = stamp<PlanEntry>(entry, instant)

    const result = await actions.write(
      (repository) => repository.plans.put(entry, instant),
      (snapshot) => ({
        ...snapshot,
        plans: existing
          ? snapshot.plans.map((p) => (p.id === saved.id ? saved : p))
          : [...snapshot.plans, saved],
      }),
    )

    // Says what happened and what to do next (L2). The row keeps its figure and
    // unallocated has not moved, because memory was never touched.
    return result.ok ? undefined : `Couldn't save that. (${result.message})`
  }

  async function copyLastCycle(): Promise<string | undefined> {
    if (state.status !== 'ready') return 'Nothing is loaded yet.'
    const cycle = cycleAt(state.snapshot, today)
    const previous = previousCycle(state.snapshot, cycle)

    /**
     * Only categories with nothing planned this cycle are filled in.
     *
     * Copying over a figure the owner has already typed would undo deliberate
     * work with one tap, and there is no undo on this screen.
     */
    const entries: Unstamped<PlanEntry>[] = state.snapshot.categories
      .filter((category) => !category.archivedAt)
      .filter((category) => plannedFor(state.snapshot.plans, cycle, category.id) === 0)
      .map((category) => ({
        category,
        amount: plannedFor(state.snapshot.plans, previous, category.id),
      }))
      .filter(({ amount }) => amount > 0)
      .map(({ category, amount }) => ({
        id: newId() as Id,
        cycleStart: cycle.start,
        categoryId: category.id,
        planned: amount,
      }))

    if (entries.length === 0) return 'Last cycle had nothing to copy.'

    const saved = stampAll<PlanEntry>(entries, instant)

    const result = await actions.write(
      (repository) => repository.plans.bulkPut(entries, instant),
      (snapshot) => ({ ...snapshot, plans: [...snapshot.plans, ...saved] }),
    )

    if (!result.ok) return `Couldn't copy that. (${result.message})`

    announce({
      toast: 'Copied.',
      spoken: `Copied ${entries.length} ${entries.length === 1 ? 'amount' : 'amounts'} from last cycle.`,
    })
    return undefined
  }

  return (
    <PlanScreen
      snapshot={state.snapshot}
      now={today}
      onSaveRow={saveRow}
      onCopyLastCycle={copyLastCycle}
    />
  )
}
