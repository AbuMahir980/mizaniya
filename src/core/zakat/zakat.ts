import { addMoney, perUnitCeil, subtractMoney } from '../money/money'
import type { Category, IsoDate, Kobo, Snapshot, Transaction } from '../types'
import { compareDates } from '../cycle/cycle'
import { balanceOf, directionOf } from '../debt/debt'

/** Zakat is 2.5% — exactly one fortieth, so integer kobo divides cleanly. */
const ZAKAT_DIVISOR = 40

/**
 * Where the hawl start came from.
 *
 * The lunar year is **asked for, never assumed** (D6). When it has not been
 * answered the panel falls back to the first record and has to say so — which is
 * why the fallback is a different state and not just a date.
 */
export type HawlStart =
  | { kind: 'set'; date: IsoDate }
  | { kind: 'fallback'; date: IsoDate }
  | { kind: 'none' }

export function hawlStart(snapshot: Snapshot): HawlStart {
  const asked = snapshot.settings.zakat.hawlStart
  if (asked) return { kind: 'set', date: asked }

  const earliest = snapshot.transactions
    .map((t) => t.date)
    .sort((a, b) => compareDates(a, b))
    .at(0)

  if (!earliest) return { kind: 'none' }
  return { kind: 'fallback', date: earliest }
}

/** Savings categories — the wealth zakat is reckoned on. */
function savingsCategories(snapshot: Snapshot): Category[] {
  return snapshot.categories.filter((c) => c.type === 'savings')
}

/**
 * What the owner holds in savings right now.
 *
 * A **balance**, not the money put aside during the year: zakat is reckoned on
 * wealth held, and the hawl start says when the year began rather than which
 * movements count. Money saved before the hawl opened is still wealth today.
 */
export function zakatableSavings(snapshot: Snapshot): Kobo {
  const ids = new Set(savingsCategories(snapshot).map((c) => c.id))
  const movements = snapshot.transactions.filter(
    (t: Transaction) => t.categoryId !== undefined && ids.has(t.categoryId),
  )
  const inward = movements.filter((t) => t.type === 'savings-in').map((t) => t.amount)
  const outward = movements.filter((t) => t.type === 'savings-out').map((t) => t.amount)
  return subtractMoney(addMoney(...inward), addMoney(...outward))
}

/**
 * Money owed to the owner, and whether it counts.
 *
 * **Not asked is not the same as excluded.** `undefined` means the question has
 * never been put, and the panel must ask rather than quietly assume a position
 * the app is not entitled to take (D3).
 */
export type Receivables =
  | { kind: 'not-asked'; amount: Kobo }
  | { kind: 'included'; amount: Kobo }
  | { kind: 'excluded'; amount: Kobo }

export function receivables(snapshot: Snapshot): Receivables {
  const owedToOwner = snapshot.debts
    .map((debt) => balanceOf(snapshot, debt.id))
    .filter((balance) => directionOf(balance) === 'owed-to-you')
    .map((balance) => Math.abs(balance) as Kobo)

  const amount = addMoney(...owedToOwner)
  const answer = snapshot.settings.zakat.includeReceivables

  if (answer === undefined) return { kind: 'not-asked', amount }
  return answer ? { kind: 'included', amount } : { kind: 'excluded', amount }
}

/** Everything the panel shows alongside whichever outcome it reaches. */
interface Workings {
  savings: Kobo
  receivables: Receivables
  /** Savings, plus receivables only when the owner said to include them. */
  zakatable: Kobo
  hawl: HawlStart
}

/**
 * The outcome.
 *
 * `no-nisab` is deliberately **not** an estimate of ₦0.00. Zero is a figure, and
 * a figure that reads "nothing is due" when the truth is "we do not know" is the
 * app ruling on something it must never rule on (page specs §7.10).
 */
export type ZakatEstimate =
  | ({ kind: 'no-nisab' } & Workings)
  | ({ kind: 'below-nisab'; nisab: Kobo } & Workings)
  | ({ kind: 'due'; nisab: Kobo; estimate: Kobo } & Workings)

export function estimate(snapshot: Snapshot): ZakatEstimate {
  const savings = zakatableSavings(snapshot)
  const owed = receivables(snapshot)
  const zakatable = owed.kind === 'included' ? addMoney(savings, owed.amount) : savings
  const workings: Workings = {
    savings,
    receivables: owed,
    zakatable,
    hawl: hawlStart(snapshot),
  }

  const nisab = snapshot.settings.zakat.nisab
  // No nisab means the panel explains what is missing and where to look it up.
  // It never shows a figure, because there is no figure to show.
  if (nisab === undefined) return { kind: 'no-nisab', ...workings }

  if (zakatable < nisab) return { kind: 'below-nisab', nisab, ...workings }

  return { kind: 'due', nisab, estimate: zakatDue(zakatable), ...workings }
}

/**
 * 2.5% of an amount, **rounded up**.
 *
 * Up, not down, because this is an obligation. D3 makes the direction explicit:
 * understating zakat is "the opposite of the safe direction everywhere else in
 * the app", where spendable figures floor so nobody is told they may spend money
 * they do not have. Here the same instinct points the other way.
 */
export function zakatDue(zakatable: Kobo): Kobo {
  return perUnitCeil(zakatable, ZAKAT_DIVISOR)
}
