/**
 * WHAT: The eight movements in the owner's words, and the derivations the
 *       Transactions list is built from — filtering, day grouping, subtotals.
 * WHY:  **The labels live here, not in the screen that first needed them.**
 *       Quick Add owned the only copy until Transactions needed the same eight;
 *       a second screen copying them would have made any future drift permanent
 *       and invisible. Vocabulary the whole app speaks is domain.
 * INTERVIEW: I moved the movement labels into core the moment a second screen
 *       needed them, because two copies of a vocabulary always end up
 *       disagreeing and nothing fails when they do.
 */

import { addMoney } from '../money/money'
import { movementsIn } from '../budget/budget'
import type { Cycle } from '../cycle/cycle'
import type {
  Id,
  IsoDate,
  Kobo,
  SavingsDestination,
  Snapshot,
  Transaction,
  TransactionType,
} from '../types'

/**
 * **Everyday speech, not accounting (D7, O4).**
 *
 * *Spent* and *Received*, not *Expense* and *Income*: the owner is describing
 * something they did, and the past tense is how they would say it out loud.
 * Page specs §7.4 and the type filter in `TransactionsLight.dc.html` were
 * written with the formal pair and are the documents that were corrected —
 * the plain set is the stated intent, recorded in CONTEXT.md.
 *
 * Note the debt four already read this way: *I lent*, *They repaid me*. The
 * whole set is one voice, which is the point.
 */
export const MOVEMENT_LABELS: Record<TransactionType, string> = {
  income: 'Received',
  expense: 'Spent',
  'savings-in': 'Moved to savings',
  'savings-out': 'Took from savings',
  borrowed: 'I borrowed',
  repaid: 'I repaid',
  lent: 'I lent',
  'repayment-received': 'They repaid me',
}

/**
 * Filter order, from the design's type panel — **order is the design's call,
 * the wording is the owner's**, and the two are separable.
 */
export const MOVEMENT_TYPES: TransactionType[] = [
  'income',
  'expense',
  'savings-in',
  'savings-out',
  'borrowed',
  'repaid',
  'lent',
  'repayment-received',
]

/** Where savings are kept, in the owner's words. */
export const DESTINATION_LABELS: Record<SavingsDestination, string> = {
  'bank-vault': 'Bank vault',
  cowrywise: 'Cowrywise',
  piggyvest: 'PiggyVest',
  'cash-at-home': 'Cash at home',
  ajo: 'Ajo',
}

/**
 * What the owner has narrowed the list to.
 *
 * An absent field means "everything", and an **empty** `types` array means the
 * same rather than "nothing": a filter panel with every box cleared is someone
 * who has not chosen yet, not someone asking for an empty list.
 */
export interface MovementFilter {
  categoryId?: Id
  types?: TransactionType[]
}

export function matchesFilter(movement: Transaction, filter: MovementFilter): boolean {
  if (filter.categoryId && movement.categoryId !== filter.categoryId) return false
  if (filter.types && filter.types.length > 0 && !filter.types.includes(movement.type)) {
    return false
  }
  return true
}

/** The cycle's movements, narrowed by the filter. */
export function movementsMatching(
  snapshot: Snapshot,
  cycle: Cycle,
  filter: MovementFilter = {},
): Transaction[] {
  return movementsIn(snapshot, cycle).filter((movement) => matchesFilter(movement, filter))
}

export interface DayGroup {
  date: IsoDate
  movements: Transaction[]
  /** Expenses only — see `spentIn`. */
  spent: Kobo
}

/**
 * The movements grouped into days, newest day first.
 *
 * **Only days that have something on them.** This is the opposite of
 * `spendingByDay`, deliberately: a chart needs the quiet days so a gap reads as
 * quiet rather than missing, and a list needs them gone so the owner is not
 * scrolling past thirty empty headers to find one purchase.
 */
export function groupByDay(movements: Transaction[]): DayGroup[] {
  const byDate = new Map<IsoDate, Transaction[]>()

  for (const movement of movements) {
    const day = byDate.get(movement.date)
    if (day) day.push(movement)
    else byDate.set(movement.date, [movement])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, day]) => ({
      date,
      // Within a day, most recently recorded first: the movement someone just
      // entered is the one they are most likely to be correcting.
      movements: [...day].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      spent: spentIn(day),
    }))
}

/**
 * How much of this list was spending.
 *
 * **Expenses only, and never a net figure.** Amounts are always positive and
 * direction comes from the type (H5), so adding income to expense would produce
 * a number that means nothing and reads like a total. Money moved to savings or
 * to a debt is not spending either — it is money going where the plan already
 * promised it, which is the same rule `spendingByDay` follows.
 */
export function spentIn(movements: Transaction[]): Kobo {
  return movements.reduce(
    (total, movement) => (movement.type === 'expense' ? addMoney(total, movement.amount) : total),
    0 as Kobo,
  )
}

export interface DestinationTotal {
  destination: SavingsDestination
  total: Kobo
}

/**
 * Savings movements totalled per destination — the whole of "savings by
 * destination", which needs no screen of its own (page specs §7.4).
 *
 * **It totals what it is given rather than netting in against out.** Filtered
 * to *Move to savings* it answers "what went into each"; filtered to *Take from
 * savings*, "what came out of each". Netting would make those two questions
 * share one number that answers neither, and could go negative — which H5 has
 * no way to display honestly.
 */
export function savingsByDestination(movements: Transaction[]): DestinationTotal[] {
  const byDestination = new Map<SavingsDestination, Kobo>()

  for (const movement of movements) {
    if (!movement.savingsDestination) continue
    const running = byDestination.get(movement.savingsDestination) ?? (0 as Kobo)
    byDestination.set(movement.savingsDestination, addMoney(running, movement.amount))
  }

  // Largest first: the destination holding the most is the one being asked about.
  return [...byDestination.entries()]
    .map(([destination, total]) => ({ destination, total }))
    .sort((a, b) => b.total - a.total)
}
