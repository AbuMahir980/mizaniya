import { addMoney, subtractMoney } from '../money/money'
import type { Debt, Id, IsoDate, Kobo, Snapshot, Transaction } from '../types'
import { compareDates, nextCycleStart } from '../cycle/cycle'

/**
 * Movements that increase what the owner owes.
 *
 * The question for each is only ever *"does this increase what I owe?"* —
 * `borrowed` money arrived and is owed; `repayment-received` means they owe me
 * less, so the balance moves back up toward zero.
 */
const INCREASES_WHAT_I_OWE: readonly Transaction['type'][] = ['borrowed', 'repayment-received']

/**
 * Movements that decrease it.
 *
 * `lent` and `repaid` both take cash out of the account and mean opposite things
 * for the relationship — which is why cash left (`core/budget`) and this balance
 * are two separate calculations over the same facts.
 */
const DECREASES_WHAT_I_OWE: readonly Transaction['type'][] = ['repaid', 'lent']

/** Which way a debt points. Derived from the balance, never stored (D9). */
export type DebtDirection = 'you-owe' | 'owed-to-you' | 'settled'

/**
 * Why a debt has no payday projection, or how many it needs.
 *
 * A discriminated union rather than `number | undefined`, because there are
 * three different reasons for "no number" and a caller that cannot tell them
 * apart writes the wrong sentence on the card (G3).
 */
export type ClearProjection =
  | { kind: 'settled' }
  | { kind: 'owed-to-you' }
  | { kind: 'no-schedule' }
  | { kind: 'scheduled'; paydays: number; clearsOn: IsoDate }

/** Every movement naming this debt, oldest first. */
export function debtMovements(snapshot: Snapshot, debtId: Id): Transaction[] {
  return snapshot.transactions
    .filter((t) => t.debtId === debtId)
    .sort((a, b) => compareDates(a.date, b.date))
}

/**
 * What the debt is worth right now.
 *
 * **Positive means the owner owes.** Negative means it is owed to them. The sum
 * is taken over every movement, so a balance that crosses zero needs no special
 * case — it simply passes through (D9).
 */
export function balanceOf(snapshot: Snapshot, debtId: Id): Kobo {
  const movements = debtMovements(snapshot, debtId)
  const up = movements.filter((t) => INCREASES_WHAT_I_OWE.includes(t.type)).map((t) => t.amount)
  const down = movements.filter((t) => DECREASES_WHAT_I_OWE.includes(t.type)).map((t) => t.amount)
  return subtractMoney(addMoney(...up), addMoney(...down))
}

/**
 * Which side of the relationship the balance puts the owner on.
 *
 * Zero is **settled** — its own state, not "you owe ₦0". A settled debt is not a
 * debt of nothing; it is a finished relationship, and the screen says something
 * different about it.
 */
export function directionOf(balance: Kobo): DebtDirection {
  if (balance > 0) return 'you-owe'
  if (balance < 0) return 'owed-to-you'
  return 'settled'
}

/**
 * The balance as a figure to display, without its sign.
 *
 * Money is never shown with a bare minus sign; direction is a word — *owed to
 * you* — decided by `directionOf` (page specs §8).
 */
export function amountOwed(balance: Kobo): Kobo {
  return Math.abs(balance) as Kobo
}

/** The most recent movement on a debt, for the card's "last movement" line. */
export function lastMovement(snapshot: Snapshot, debtId: Id): Transaction | undefined {
  return debtMovements(snapshot, debtId).at(-1)
}

/**
 * How many paydays of the agreed schedule clear this debt, and the date it
 * lands on.
 *
 * Rounded **up**: this is money the owner must find, and three payments that
 * leave ₦5,000 outstanding have not cleared anything (page specs §3a).
 *
 * Paydays are cycle starts, so the clearing date is reached by walking forward
 * one cycle at a time rather than by adding months — the salary day clamps in a
 * short month and only `core/cycle` knows how (D4).
 */
export function paydaysToClear(snapshot: Snapshot, debt: Debt, now: IsoDate): ClearProjection {
  const balance = balanceOf(snapshot, debt.id)
  const direction = directionOf(balance)

  if (direction === 'settled') return { kind: 'settled' }
  // A schedule describes what the owner pays. Nothing here predicts when someone
  // else will pay them back, and the app never implies that it can (D3).
  if (direction === 'owed-to-you') return { kind: 'owed-to-you' }

  const schedule = debt.scheduleAmount
  if (schedule === undefined || schedule <= 0) return { kind: 'no-schedule' }

  const paydays = Math.ceil(balance / schedule)

  let clearsOn = now
  for (let i = 0; i < paydays; i += 1) {
    clearsOn = nextCycleStart(snapshot.settings, clearsOn)
  }

  return { kind: 'scheduled', paydays, clearsOn }
}

/** Everything a debt card shows, in one read (page specs §7.6). */
export interface DebtSummary {
  debt: Debt
  balance: Kobo
  direction: DebtDirection
  /** The figure to print — unsigned; `direction` carries the meaning. */
  owed: Kobo
  lastMovement: Transaction | undefined
  projection: ClearProjection
}

export function summarise(snapshot: Snapshot, debt: Debt, now: IsoDate): DebtSummary {
  const balance = balanceOf(snapshot, debt.id)
  return {
    debt,
    balance,
    direction: directionOf(balance),
    owed: amountOwed(balance),
    lastMovement: lastMovement(snapshot, debt.id),
    projection: paydaysToClear(snapshot, debt, now),
  }
}

/**
 * Every open debt, grouped by the **sign of the derived balance** (D9).
 *
 * An ajo counterparty is one record that moves between these groups as its
 * balance crosses zero. It is never split in two.
 */
export function debtsByDirection(
  snapshot: Snapshot,
  now: IsoDate,
): Record<DebtDirection, DebtSummary[]> {
  const groups: Record<DebtDirection, DebtSummary[]> = {
    'you-owe': [],
    'owed-to-you': [],
    settled: [],
  }
  for (const debt of snapshot.debts) {
    const summary = summarise(snapshot, debt, now)
    groups[summary.direction].push(summary)
  }
  return groups
}
