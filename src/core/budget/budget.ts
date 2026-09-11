/**
 * WHAT: The figures Home is built on — cash left, what is already promised, and
 *       how much of the rest is safe to spend today.
 * WHY:  All of it is computed on read and stored nowhere, so a figure on screen
 *       cannot quietly disagree with the transactions that produced it.
 * INTERVIEW: I derived every headline figure from the transaction list rather than
 *       storing running totals, because a stored total drifts and nothing in the
 *       system can detect that it has.
 */

import { addMoney, clampToZero, perUnitFloor, proportionOf, subtractMoney } from '../money/money'
import type { Category, Kobo, PlanEntry, Snapshot, Transaction, TransactionType } from '../types'
import { cycleFor, cycleForTransaction, daysLeft, type Cycle } from '../cycle/cycle'

/** Movements that put money into the account. */
const INFLOWS: readonly TransactionType[] = [
  'income',
  'savings-out',
  'borrowed',
  'repayment-received',
]

/**
 * Movements that take money out.
 *
 * `lent` is an outflow. The money genuinely left the account, even though it is
 * owed back — which is why money owed to the owner counts toward nothing until
 * it actually arrives (D3).
 */
const OUTFLOWS: readonly TransactionType[] = ['expense', 'savings-in', 'repaid', 'lent']

/**
 * A category is **protected** when money planned into it is not spendable —
 * it is already promised to rent, savings or a debt.
 *
 * Derived from the category's type; the per-category override beats it (D1).
 */
export function isProtected(category: Category): boolean {
  return category.protectedOverride ?? category.type !== 'expense'
}

/** The movements belonging to a cycle, with the early-income window applied. */
export function transactionsIn(snapshot: Snapshot, cycle: Cycle): Transaction[] {
  return snapshot.transactions.filter(
    (t) => cycleForTransaction(snapshot.settings, t.date, t.type).start === cycle.start,
  )
}

export function cycleAt(snapshot: Snapshot, now: string): Cycle {
  return cycleFor(snapshot.settings, now as Transaction['date'])
}

function sumWhere(transactions: Transaction[], predicate: (t: Transaction) => boolean): Kobo {
  return addMoney(...transactions.filter(predicate).map((t) => t.amount))
}

/**
 * Money in minus money out, **for this cycle only** — never a running bank
 * balance (D16).
 *
 * A leftover from last cycle does not raise what the hero says is safe today; it
 * arrives on the next plan as unallocated, so the owner decides what it is for
 * rather than spending it without noticing.
 */
export function cashLeft(snapshot: Snapshot, cycle: Cycle): Kobo {
  const movements = transactionsIn(snapshot, cycle)
  const inflow = sumWhere(movements, (t) => INFLOWS.includes(t.type))
  const outflow = sumWhere(movements, (t) => OUTFLOWS.includes(t.type))
  return subtractMoney(inflow, outflow)
}

/** What has actually been moved into a category this cycle. */
export function actualFor(
  snapshot: Snapshot,
  cycle: Cycle,
  categoryId: Category['id'],
): Kobo {
  const movements = transactionsIn(snapshot, cycle).filter((t) => t.categoryId === categoryId)
  const into = sumWhere(movements, (t) => t.type === 'expense' || t.type === 'savings-in')
  const outOf = sumWhere(movements, (t) => t.type === 'savings-out')
  return subtractMoney(into, outOf)
}

export function plannedFor(
  plans: PlanEntry[],
  cycle: Cycle,
  categoryId: Category['id'],
): Kobo {
  const entry = plans.find((p) => p.cycleStart === cycle.start && p.categoryId === categoryId)
  return (entry?.planned ?? 0) as Kobo
}

/**
 * Money already promised but **not yet moved**: `Σ max(planned − actual, 0)`.
 *
 * Planned *minus actual* is the whole point. The ₦75,000.00 already transferred
 * to the rent fund has left the account and is no longer in cash left —
 * subtracting the full plan again would count it twice and report a
 * safe-to-spend that is too low (D1).
 *
 * Floored per category, so overshooting one does not create protection that is
 * not there.
 */
export function protectedRemaining(snapshot: Snapshot, cycle: Cycle): Kobo {
  const amounts = snapshot.categories
    .filter((category) => isProtected(category) && !category.archivedAt)
    .map((category) =>
      clampToZero(
        subtractMoney(
          plannedFor(snapshot.plans, cycle, category.id),
          actualFor(snapshot, cycle, category.id),
        ),
      ),
    )
  return addMoney(...amounts)
}

/** Everything planned into categories the owner may actually spend from. */
export function spendablePlanned(snapshot: Snapshot, cycle: Cycle): Kobo {
  const amounts = snapshot.categories
    .filter((category) => !isProtected(category) && !category.archivedAt)
    .map((category) => plannedFor(snapshot.plans, cycle, category.id))
  return addMoney(...amounts)
}

/**
 * The rate the plan implies — spendable total over the whole cycle.
 *
 * Floored: it is money that may be spent, and overstating it licenses
 * overspending.
 */
export function plannedDailyAllowance(snapshot: Snapshot, cycle: Cycle): Kobo {
  return perUnitFloor(spendablePlanned(snapshot, cycle), cycle.length)
}

/**
 * The amber threshold, in integer kobo, **dividing last**.
 *
 * `amberRatio` is a proportion like 0.6, and money is integer kobo, so the ratio
 * becomes a fraction and `proportionOf` multiplies before it divides:
 *
 *     26,000,000 × 600 ÷ (1000 × 30) = 520,000 kobo = ₦5,200.00
 *
 * Taking 60% of the *displayed* ₦8,666.66 would give ₦5,199.99 — a rounded
 * number rounded again. Never round a rounded number (page specs §3a).
 */
export function amberThreshold(snapshot: Snapshot, cycle: Cycle): Kobo {
  const ratio = snapshot.settings.amberRatio ?? 0.6
  const numerator = Math.round(ratio * 1000)
  return proportionOf(spendablePlanned(snapshot, cycle), numerator, 1000 * cycle.length)
}

/**
 * The headline figure, and its state.
 *
 * A discriminated union rather than a figure plus two booleans (**G3**), so
 * "amber with no plan" cannot be represented at all — it is not merely unlikely.
 */
export type SafeToSpend =
  | { level: 'red'; perDay: Kobo; total: Kobo; daysLeft: number; hasPlan: boolean }
  | { level: 'amber'; perDay: Kobo; total: Kobo; daysLeft: number; threshold: Kobo; hasPlan: true }
  | { level: 'green'; perDay: Kobo; total: Kobo; daysLeft: number; hasPlan: boolean }

export function safeToSpend(snapshot: Snapshot, now: string): SafeToSpend {
  const cycle = cycleAt(snapshot, now)
  const total = subtractMoney(cashLeft(snapshot, cycle), protectedRemaining(snapshot, cycle))
  // T1 guarantees this is at least 1, so nothing here divides by zero.
  const days = daysLeft(snapshot.settings, now as Transaction['date'])
  const perDay = perUnitFloor(total, days) as Kobo

  const allowance = plannedDailyAllowance(snapshot, cycle)
  const hasPlan = allowance > 0

  // Red first: negative is negative whether or not a plan exists. Overspending
  // without a plan is still overspending.
  if (perDay < 0) return { level: 'red', perDay, total, daysLeft: days, hasPlan }

  if (hasPlan) {
    const threshold = amberThreshold(snapshot, cycle)
    // `<`, so exactly zero is amber rather than red. Red means already overspent.
    if (perDay < threshold) {
      return { level: 'amber', perDay, total, daysLeft: days, threshold, hasPlan: true }
    }
  }

  return { level: 'green', perDay, total, daysLeft: days, hasPlan }
}

/**
 * What is left to give a job.
 *
 * Take-home plus anything carried from last cycle, minus everything allocated.
 * The carried amount counts towards the total to allocate, so the plan is only
 * finished when this reaches zero (D16).
 */
export function unallocated(snapshot: Snapshot, cycle: Cycle, carried: Kobo = 0 as Kobo): Kobo {
  const allocated = addMoney(
    ...snapshot.plans.filter((p) => p.cycleStart === cycle.start).map((p) => p.planned),
  )
  return subtractMoney(addMoney(snapshot.settings.takeHome, carried), allocated)
}

export type CategoryStatus = 'under' | 'low' | 'overspent'

export interface CategoryVariance {
  categoryId: Category['id']
  name: string
  /** Planned plus anything carried in from last cycle. */
  allowance: Kobo
  spent: Kobo
  remaining: Kobo
  /** Spent over allowance. Above 1 when overspent; 0 when there is no allowance. */
  ratio: number
  status: CategoryStatus
  isProtected: boolean
}

/**
 * Per-category variance, worst first — the order Home shows it in, because the
 * row that needs attention should not be somewhere in the middle.
 */
export function categoryVariance(
  snapshot: Snapshot,
  cycle: Cycle,
  carriedIn: (categoryId: Category['id']) => Kobo = () => 0 as Kobo,
): CategoryVariance[] {
  return snapshot.categories
    .filter((category) => !category.archivedAt)
    .map((category) => {
      const allowance = addMoney(
        plannedFor(snapshot.plans, cycle, category.id),
        carriedIn(category.id),
      )
      const spent = actualFor(snapshot, cycle, category.id)
      const ratio = allowance > 0 ? spent / allowance : 0
      const status: CategoryStatus =
        allowance > 0 && spent > allowance ? 'overspent' : ratio >= 0.8 ? 'low' : 'under'

      return {
        categoryId: category.id,
        name: category.name,
        allowance,
        spent,
        remaining: subtractMoney(allowance, spent),
        ratio,
        status,
        isProtected: isProtected(category),
      }
    })
    .sort((a, b) => b.ratio - a.ratio)
}

/** Actual movement of one kind this cycle — the figures behind Home's tiles. */
export function actualByType(snapshot: Snapshot, cycle: Cycle, types: TransactionType[]): Kobo {
  return sumWhere(transactionsIn(snapshot, cycle), (t) => types.includes(t.type))
}
