import { addMoney, clampToZero, perUnitFloor, proportionOf, subtractMoney } from '../money/money'
import type { Category, IsoDate, Kobo, PlanEntry, Snapshot, Transaction, TransactionType } from '../types'
import { addDays, cycleFor, cycleForTransaction, daysLeft, type Cycle } from '../cycle/cycle'

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
export function movementsIn(snapshot: Snapshot, cycle: Cycle): Transaction[] {
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
  const movements = movementsIn(snapshot, cycle)
  const inflow = sumWhere(movements, (t) => INFLOWS.includes(t.type))
  const outflow = sumWhere(movements, (t) => OUTFLOWS.includes(t.type))
  return subtractMoney(inflow, outflow)
}

/** What has actually been moved into a category this cycle. */
export function movedInto(
  snapshot: Snapshot,
  cycle: Cycle,
  categoryId: Category['id'],
): Kobo {
  const movements = movementsIn(snapshot, cycle).filter((t) => t.categoryId === categoryId)
  /**
   * `repaid` counts, and leaving it out was a real fault.
   *
   * A *Debt payment* category is funded by repaying the debt — that is the only
   * movement that can satisfy it. Counting only expense and savings meant such
   * a category could never be met, so `protectedRemaining` held its whole
   * planned amount for the entire cycle and safe-to-spend was permanently
   * understated by it. In the seeded scenario that is ₦1,500.00 a day, and the
   * figure looks perfectly reasonable — it is simply too careful, every day,
   * with nothing to say so.
   */
  const into = sumWhere(
    movements,
    (t) => t.type === 'expense' || t.type === 'savings-in' || t.type === 'repaid',
  )
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
          movedInto(snapshot, cycle, category.id),
        ),
      ),
    )
  return addMoney(...amounts)
}

/** Everything planned into categories the owner may actually spend from. */
export function plannedForSpending(snapshot: Snapshot, cycle: Cycle): Kobo {
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
  return perUnitFloor(plannedForSpending(snapshot, cycle), cycle.length)
}

/**
 * The amber threshold, in integer kobo, **dividing last**.
 *
 * `amberRatio` is a proportion like 0.6, and money is integer kobo, so the portionUsed
 * becomes a fraction and `proportionOf` multiplies before it divides:
 *
 *     26,000,000 × 600 ÷ (1000 × 30) = 520,000 kobo = ₦5,200.00
 *
 * Taking 60% of the *displayed* ₦8,666.66 would give ₦5,199.99 — a rounded
 * number rounded again. Never round a rounded number (page specs §3a).
 */
export function amberThreshold(snapshot: Snapshot, cycle: Cycle): Kobo {
  const portionUsed = snapshot.settings.amberRatio ?? 0.6
  const numerator = Math.round(portionUsed * 1000)
  return proportionOf(plannedForSpending(snapshot, cycle), numerator, 1000 * cycle.length)
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

export type CategoryStatus = 'ok' | 'low' | 'overspent'

export interface CategorySpending {
  categoryId: Category['id']
  name: string
  /** Planned plus anything carried in from last cycle. */
  allowance: Kobo
  spent: Kobo
  left: Kobo
  /** Spent over allowance. Above 1 when overspent; 0 when there is no allowance. */
  portionUsed: number
  status: CategoryStatus
  isProtected: boolean
}

/**
 * What is left in each category, worst first — the order Home shows it in, because the
 * row that needs attention should not be somewhere in the middle.
 */
export function spendingByCategory(
  snapshot: Snapshot,
  cycle: Cycle,
  carriedIn: (categoryId: Category['id']) => Kobo = () => 0 as Kobo,
): CategorySpending[] {
  return snapshot.categories
    .filter((category) => !category.archivedAt)
    .map((category) => {
      const allowance = addMoney(
        plannedFor(snapshot.plans, cycle, category.id),
        carriedIn(category.id),
      )
      const spent = movedInto(snapshot, cycle, category.id)
      const portionUsed = allowance > 0 ? spent / allowance : 0
      const status = statusOf(isProtected(category), allowance, spent, portionUsed)

      return {
        categoryId: category.id,
        name: category.name,
        allowance,
        spent,
        left: subtractMoney(allowance, spent),
        portionUsed,
        status,
        isProtected: isProtected(category),
      }
    })
    .sort(byAttentionNeeded)
}

/**
 * **Meeting the allowance means opposite things for the two kinds of category.**
 *
 * Spending all of a food budget is the last warning before overspending it.
 * Moving all of a rent contribution is the plan working — the money went where
 * it was promised. Rating a fully funded savings line "Low" would put an amber
 * badge on the one thing that went right, and (with the old sort) at the top of
 * the table.
 */
function statusOf(
  protectedCategory: boolean,
  allowance: Kobo,
  spent: Kobo,
  portionUsed: number,
): CategoryStatus {
  if (allowance <= 0) return 'ok'

  if (protectedCategory) {
    /**
     * A protected category carries no badge at all.
     *
     * None of the five statuses fits it. "Low" means *running out of what you
     * may spend*, which is not what a half-funded rent contribution is; and
     * moving more than planned into savings is not overspending, it is simply
     * generous. Under-funding is still visible — in the bar, and in the amount
     * still left to move — without a word that means something else.
     */
    return 'ok'
  }

  if (spent > allowance) return 'overspent'
  return portionUsed >= 0.8 ? 'low' : 'ok'
}

/**
 * Worst first — and "worst" is what needs attention, not what is fullest.
 *
 * Sorting on `portionUsed` alone floated a fully funded savings category above
 * a food budget at 87%, which is the table's whole purpose inverted.
 */
const RANK: Record<CategoryStatus, number> = { overspent: 0, low: 1, ok: 2 }

function byAttentionNeeded(a: CategorySpending, b: CategorySpending): number {
  const byStatus = RANK[a.status] - RANK[b.status]
  if (byStatus !== 0) return byStatus
  // Within a status, still the fullest first.
  return b.portionUsed - a.portionUsed
}

/** Actual movement of one kind this cycle — the figures behind Home's tiles. */
export function totalMoved(snapshot: Snapshot, cycle: Cycle, types: TransactionType[]): Kobo {
  return sumWhere(movementsIn(snapshot, cycle), (t) => types.includes(t.type))
}

/**
 * What was spent on each day of the cycle, one entry per day.
 *
 * **Every day appears, including the ones with nothing on them.** A chart drawn
 * only from days that had spending compresses a quiet week into a gap and makes
 * a cycle look busier than it was — and the day a bar is missing is exactly the
 * day the owner wants to see was quiet.
 *
 * Expenses only: money moved to savings or to a debt is not spending, it is
 * money going where the plan already promised it.
 */
export function spendingByDay(snapshot: Snapshot, cycle: Cycle): { date: IsoDate; spent: Kobo }[] {
  const byDate = new Map<string, Kobo>()
  for (const movement of movementsIn(snapshot, cycle)) {
    if (movement.type !== 'expense') continue
    byDate.set(movement.date, addMoney(byDate.get(movement.date) ?? (0 as Kobo), movement.amount))
  }

  const days: { date: IsoDate; spent: Kobo }[] = []
  for (let offset = 0; offset < cycle.length; offset += 1) {
    const date = addDays(cycle.start, offset)
    days.push({ date, spent: byDate.get(date) ?? (0 as Kobo) })
  }
  return days
}
