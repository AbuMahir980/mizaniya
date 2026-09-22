/**
 * WHAT: How much a goal has saved, what it will have by its due date, and what
 *       rate would close the gap.
 * WHY:  The projection counts **paydays**, not elapsed time — money arrives in
 *       lumps on payday, and pro-rating a part cycle models a flow that does not
 *       exist and counts a contribution not yet made (D5).
 * INTERVIEW: I projected against paydays rather than days, because the smooth
 *       version raises a false alarm in the one case the feature exists for.
 */

import { addMoney, clampToZero, perUnitCeil, subtractMoney } from '../money/money'
import type { Goal, IsoDate, Kobo, Snapshot, Transaction } from '../types'
import { compareDates, paydaysBetween } from '../cycle/cycle'
import { cycleAt, plannedFor } from '../budget/budget'

/** Movements that fund this goal, over all time — a goal accumulates across cycles. */
function fundingMovements(snapshot: Snapshot, goal: Goal): Transaction[] {
  return snapshot.transactions.filter((t) => t.categoryId === goal.categoryId)
}

/**
 * What the goal holds now.
 *
 * Unlike cash left, this is a **balance rather than a flow**: it is every
 * movement ever made into the funding category, not this cycle's. Derived from
 * transactions and stored nowhere, so an opening balance has to arrive as a
 * dated opening movement like everything else (B3).
 */
export function saved(snapshot: Snapshot, goal: Goal): Kobo {
  const movements = fundingMovements(snapshot, goal)
  const inward = movements.filter((t) => t.type === 'savings-in').map((t) => t.amount)
  const outward = movements.filter((t) => t.type === 'savings-out').map((t) => t.amount)
  return subtractMoney(addMoney(...inward), addMoney(...outward))
}

/** What the current plan puts into this goal each cycle. */
export function plannedContribution(snapshot: Snapshot, goal: Goal, now: IsoDate): Kobo {
  return plannedFor(snapshot.plans, cycleAt(snapshot, now), goal.categoryId)
}

/**
 * How many paydays fall **on or before** the due date.
 *
 * On or before matters: in the seeded case the payday of 25 February lands
 * before a 1 March deadline, and dropping it would invent a shortfall that is
 * not there. False alarms are cheap once and corrosive twice (D5).
 */
export function paydaysRemaining(snapshot: Snapshot, goal: Goal, now: IsoDate): number {
  if (!goal.dueDate) return 0
  return paydaysBetween(snapshot.settings, now, goal.dueDate)
}

/** What every goal card draws, deadline or not. */
interface GoalProgress {
  saved: Kobo
  target: Kobo
  /**
   * Target minus saved, never negative. On **every** variant, because every goal
   * card draws a progress bar whether or not it has a deadline.
   */
  remaining: Kobo
}

/**
 * Where a goal stands.
 *
 * Four outcomes, not a figure and a flag. A goal with no due date carries **no
 * badge at all** — there is nothing to be on track *for* — and that is a
 * different thing from being on track, which a nullable number could not say
 * (G3, page specs §7.6).
 */
export type GoalProjection =
  | ({ kind: 'no-deadline' } & GoalProgress)
  | ({ kind: 'overdue' } & GoalProgress)
  | ({
      kind: 'projected'
      status: 'on-track' | 'short'
      paydays: number
      contribution: Kobo
      projected: Kobo
      /** Zero when on track. Never negative — a surplus is not a gap. */
      gap: Kobo
      /** What each remaining payday must carry to close it. Rounded up. */
      rateToClose: Kobo
    } & GoalProgress)

export function projectedGap(snapshot: Snapshot, goal: Goal, now: IsoDate): GoalProjection {
  const current = saved(snapshot, goal)
  const remaining = clampToZero(subtractMoney(goal.target, current))

  // No due date means progress only: no gap, no status badge (page specs §7.6).
  if (!goal.dueDate) {
    return { kind: 'no-deadline', saved: current, target: goal.target, remaining }
  }

  // A passed due date stops the projection rather than projecting into the past.
  // Whether it was met is the screen's question; this one is simply over.
  if (compareDates(goal.dueDate, now) < 0) {
    return { kind: 'overdue', saved: current, target: goal.target, remaining }
  }

  const paydays = paydaysRemaining(snapshot, goal, now)
  const contribution = plannedContribution(snapshot, goal, now)
  const projected = addMoney(current, (paydays * contribution) as Kobo)
  const gap = clampToZero(subtractMoney(goal.target, projected))

  return {
    kind: 'projected',
    status: gap > 0 ? 'short' : 'on-track',
    saved: current,
    target: goal.target,
    remaining,
    paydays,
    contribution,
    projected,
    gap,
    rateToClose: rateToClose(snapshot, goal, now),
  }
}

/**
 * The per-payday rate that reaches the target in time.
 *
 * Rounded **up**, because this is money the owner must find and a rate that
 * leaves a naira outstanding has closed nothing (page specs §3a).
 *
 * Zero when the target is already reached, and zero when no payday remains —
 * there is no rate that fixes a deadline with nothing left before it, and
 * inventing one would be worse than saying nothing.
 */
export function rateToClose(snapshot: Snapshot, goal: Goal, now: IsoDate): Kobo {
  const remaining = clampToZero(subtractMoney(goal.target, saved(snapshot, goal)))
  if (remaining === 0) return 0 as Kobo

  const paydays = paydaysRemaining(snapshot, goal, now)
  if (paydays <= 0) return 0 as Kobo

  return perUnitCeil(remaining, paydays)
}
