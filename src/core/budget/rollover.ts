import { addMoney, clampToZero, subtractMoney } from '../money/money'
import type { Category, Kobo, Snapshot } from '../types'
import { addDays, cycleFor, type Cycle } from '../cycle/cycle'
import { movedInto, cashLeft, plannedFor, protectedRemaining } from './budget'

/**
 * How far back `carriedIn` will walk.
 *
 * A rolling category compounds: last cycle's allowance already included what
 * carried into *it*. That is correct for a food fund, but it makes the
 * calculation recursive, so it needs a floor. Two years of cycles is far beyond
 * any real history and terminates on a fresh install immediately.
 */
const MAX_CHAIN = 24

/** The cycle immediately before this one. */
export function previousCycle(snapshot: Snapshot, cycle: Cycle): Cycle {
  return cycleFor(snapshot.settings, addDays(cycle.start, -1))
}

/** Did the owner plan anything at all in this cycle? */
function hasPlan(snapshot: Snapshot, cycle: Cycle): boolean {
  return snapshot.plans.some((p) => p.cycleStart === cycle.start)
}

/**
 * What a rolling category carries into `cycle` from the one before it.
 *
 * `allowance − spent`, floored at zero. **Overspending does not carry a debt
 * forward**: that would be a second, invisible way to punish a bad month, and
 * the cycle where it happened already showed it as overspent.
 *
 * Returns zero for a category that does not roll over, and for the first cycle
 * of all — there is nothing behind it.
 */
export function carriedIn(snapshot: Snapshot, cycle: Cycle, category: Category): Kobo {
  if (!category.rollsOver) return 0 as Kobo
  return carriedFrom(snapshot, cycle, category, MAX_CHAIN)
}

function carriedFrom(
  snapshot: Snapshot,
  cycle: Cycle,
  category: Category,
  depth: number,
): Kobo {
  if (depth <= 0) return 0 as Kobo

  const earlier = previousCycle(snapshot, cycle)
  if (!hasPlan(snapshot, earlier)) return 0 as Kobo

  // The earlier cycle's allowance included whatever carried into it, which is
  // how a food fund accumulates across a frugal run.
  const allowance = addMoney(
    plannedFor(snapshot.plans, earlier, category.id),
    carriedFrom(snapshot, earlier, category, depth - 1),
  )
  return clampToZero(subtractMoney(allowance, movedInto(snapshot, earlier, category.id)))
}

/** The allowance a category actually has this cycle: planned plus carried. */
export function allowanceFor(snapshot: Snapshot, cycle: Cycle, category: Category): Kobo {
  return addMoney(
    plannedFor(snapshot.plans, cycle, category.id),
    carriedIn(snapshot, cycle, category),
  )
}

/**
 * A lookup shaped for `spendingByCategory`, which takes the carried amount as an
 * injected function so it need not know rollover exists.
 */
export function carriedInLookup(
  snapshot: Snapshot,
  cycle: Cycle,
): (categoryId: Category['id']) => Kobo {
  return (categoryId) => {
    const category = snapshot.categories.find((c) => c.id === categoryId)
    return category ? carriedIn(snapshot, cycle, category) : (0 as Kobo)
  }
}

/**
 * What a completed cycle left behind — spendable cash nobody spent.
 *
 * **A different thing from rollover.** Rollover is per category and carries an
 * allowance; this is whole-cycle cash, and it arrives on the next plan as
 * *unallocated* rather than as something already spendable (D16). They are kept
 * in separate functions so nobody merges them later on the grounds that both
 * "carry something forward".
 */
export function leftoverFrom(snapshot: Snapshot, cycle: Cycle): Kobo {
  return clampToZero(
    subtractMoney(cashLeft(snapshot, cycle), protectedRemaining(snapshot, cycle)),
  )
}
