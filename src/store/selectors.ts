/**
 * WHAT: The derived figures, memoised on the snapshot they were computed from.
 * WHY:  **Nothing derived is stored** (B3). Every figure is recomputed from the
 *       snapshot, so a displayed number cannot be stale — and memoising on the
 *       snapshot's identity means recording one expense does not recompute the
 *       screens it did not touch (ADR-001).
 * INTERVIEW: I derived every figure on read and memoised by snapshot identity,
 *       so a stale number is structurally impossible rather than a bug class to
 *       watch for.
 */

import type { IsoDate, Snapshot } from '@/core/types'
import { cycleAt, safeToSpend, cashLeft, spendingByCategory } from '@/core/budget/budget'
import { debtsByDirection } from '@/core/debt/debt'
import { projectedGap } from '@/core/goal/goal'
import { estimate } from '@/core/zakat/zakat'

/**
 * Caches the last result per selector, keyed by **snapshot identity** and the
 * date asked about.
 *
 * Identity, not deep equality: the store replaces the snapshot object on every
 * write, so a new object means something genuinely changed, and comparing the
 * whole dataset field by field would cost more than the recompute it saves.
 */
function memoise<A extends unknown[], R>(compute: (snapshot: Snapshot, ...args: A) => R) {
  let lastSnapshot: Snapshot | undefined
  let lastKey: string | undefined
  let lastResult: R

  return (snapshot: Snapshot, ...args: A): R => {
    const key = JSON.stringify(args)
    if (snapshot === lastSnapshot && key === lastKey) return lastResult

    lastSnapshot = snapshot
    lastKey = key
    lastResult = compute(snapshot, ...args)
    return lastResult
  }
}

/** Counts every call that actually recomputed, so a test can prove memoisation. */
export const recomputes = { count: 0 }

function counted<A extends unknown[], R>(compute: (snapshot: Snapshot, ...args: A) => R) {
  return memoise((snapshot: Snapshot, ...args: A) => {
    recomputes.count += 1
    return compute(snapshot, ...args)
  })
}

export const selectCycle = counted((snapshot: Snapshot, now: IsoDate) => cycleAt(snapshot, now))

export const selectSafeToSpend = counted((snapshot: Snapshot, now: IsoDate) =>
  safeToSpend(snapshot, now),
)

export const selectCashLeft = counted((snapshot: Snapshot, now: IsoDate) =>
  cashLeft(snapshot, cycleAt(snapshot, now)),
)

export const selectSpendingByCategory = counted((snapshot: Snapshot, now: IsoDate) =>
  spendingByCategory(snapshot, cycleAt(snapshot, now)),
)

export const selectDebts = counted((snapshot: Snapshot, now: IsoDate) =>
  debtsByDirection(snapshot, now),
)

export const selectGoals = counted((snapshot: Snapshot, now: IsoDate) =>
  snapshot.goals.map((goal) => ({ goal, projection: projectedGap(snapshot, goal, now) })),
)

export const selectZakat = counted((snapshot: Snapshot) => estimate(snapshot))
