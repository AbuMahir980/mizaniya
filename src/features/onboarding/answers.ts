/**
 * WHAT: What onboarding collects, and the pure function that turns it into the
 *       app's first snapshot.
 * WHY:  **Opening balances become dated transactions, never stored totals**
 *       (D3, A3) — and the date is the whole decision. Dated today they would
 *       fall inside the running cycle and overstate this cycle's saving by
 *       everything the owner has ever saved. The figure would look entirely
 *       plausible and nothing would flag it.
 * INTERVIEW: I made the form's output a pure function of its answers, so the
 *       rule that matters is tested with plain values and no browser at all.
 */

import { addDays, cycleFor } from '@/core/cycle/cycle'
import type {
  Category,
  CategoryType,
  Debt,
  Goal,
  Id,
  Instant,
  IsoDate,
  Kobo,
  Settings,
  Snapshot,
  Transaction,
} from '@/core/types'

/** Which way a debt was entered. The balance derives from the movement (D9). */
export type DebtDirection = 'i-owe' | 'owed-to-me'

export interface DebtAnswer {
  counterpartyName: string
  direction: DebtDirection
  amount: Kobo
  /** The agreed repayment per cycle, if there is one. */
  scheduleAmount?: Kobo
}

export interface OnboardingAnswers {
  /** Step 1 — optional, and only used on the printed debt record. */
  ownerName?: string
  /** Step 2 — the only required step. */
  salaryDay: number
  takeHome: Kobo
  /** Step 3 — the starter list, as edited. */
  categories: Category[]
  /** Step 4 — per savings category, zero or absent means "nothing yet". */
  openingBalances: Record<string, Kobo>
  /** Step 5 — both directions in one step. */
  debts: DebtAnswer[]
  /** Step 6 — a goal needs a target; a due date is optional even here. */
  rent?: { target: Kobo; dueDate?: IsoDate }
}

/**
 * The starter categories, from `docs/seed-data.md`.
 *
 * Names and types only. **No amounts** — a plan is the owner's to write, and
 * pre-filling one would put figures on their screen they never chose.
 */
export const STARTER_CATEGORIES: { name: string; type: CategoryType; rollsOver: boolean }[] = [
  { name: 'Rent fund', type: 'savings', rollsOver: false },
  { name: 'Emergency fund', type: 'savings', rollsOver: false },
  { name: 'Personal savings', type: 'savings', rollsOver: false },
  { name: 'Food and groceries', type: 'expense', rollsOver: true },
  { name: 'Transport, data and airtime', type: 'expense', rollsOver: false },
  { name: 'Family support', type: 'expense', rollsOver: false },
  { name: 'Apartment setup', type: 'expense', rollsOver: false },
  { name: 'Miscellaneous', type: 'expense', rollsOver: false },
  { name: 'Utilities', type: 'expense', rollsOver: false },
  { name: 'Health', type: 'expense', rollsOver: false },
  { name: 'Sadaqah', type: 'expense', rollsOver: false },
]

export function starterCategories(makeId: () => string): Category[] {
  return STARTER_CATEGORIES.map((c, index) => ({
    id: makeId() as Id,
    name: c.name,
    type: c.type,
    rollsOver: c.rollsOver,
    sortOrder: index,
  }))
}

export function emptyAnswers(makeId: () => string): OnboardingAnswers {
  return {
    salaryDay: 25,
    takeHome: 0 as Kobo,
    categories: starterCategories(makeId),
    openingBalances: {},
    debts: [],
  }
}

/** The four debt movements, by the direction the owner entered (D9). */
const OPENING_DEBT_TYPE: Record<DebtDirection, Transaction['type']> = {
  'i-owe': 'borrowed',
  'owed-to-me': 'lent',
}

export interface BuildContext {
  /** Today, passed in — `core/` never reads the clock (ADR-003). */
  now: IsoDate
  at: Instant
  makeId: () => string
}

/**
 * Everything the owner entered, as the app's first snapshot.
 *
 * Pure: the same answers and the same date give the same snapshot, which is
 * what lets the dating rule below be tested without a form, a browser or a
 * database.
 */
export function buildSnapshot(answers: OnboardingAnswers, ctx: BuildContext): Snapshot {
  const settings: Settings = {
    ...(answers.ownerName ? { ownerName: answers.ownerName } : {}),
    salaryDay: answers.salaryDay,
    takeHome: answers.takeHome,
    amberRatio: 0.6,
    earlyIncomeWindowDays: 3,
    zakat: {},
  }

  /**
   * The day before the current cycle begins.
   *
   * This is the line the whole module exists for. An opening balance is money
   * the owner had *before* they started using the app, so it must sit outside
   * the running cycle — otherwise Home's Saved tile reads the lifetime total
   * and calls it this month's saving.
   */
  const openingDate = addDays(cycleFor(settings, ctx.now).start, -1)

  const transactions: Transaction[] = []

  for (const category of answers.categories) {
    const amount = answers.openingBalances[category.id]
    // Zero is not "nothing yet" recorded — it is nothing to record.
    if (!amount || amount <= 0) continue
    transactions.push({
      id: ctx.makeId() as Id,
      date: openingDate,
      type: 'savings-in',
      amount,
      categoryId: category.id,
      note: 'Opening balance',
      createdAt: ctx.at,
    })
  }

  const debts: Debt[] = []
  for (const answer of answers.debts) {
    const debtId = ctx.makeId() as Id
    debts.push({
      id: debtId,
      counterpartyName: answer.counterpartyName,
      openedOn: openingDate,
      ...(answer.scheduleAmount ? { scheduleAmount: answer.scheduleAmount } : {}),
      witnesses: [],
    })
    // The balance derives from this movement; no direction is stored (D9).
    transactions.push({
      id: ctx.makeId() as Id,
      date: openingDate,
      type: OPENING_DEBT_TYPE[answer.direction],
      amount: answer.amount,
      debtId,
      note: 'Opening balance',
      createdAt: ctx.at,
    })
  }

  const goals: Goal[] = []
  const rentCategory = answers.categories.find((c) => c.name === 'Rent fund')
  if (answers.rent && answers.rent.target > 0 && rentCategory) {
    goals.push({
      id: ctx.makeId() as Id,
      name: 'Annual rent',
      target: answers.rent.target,
      ...(answers.rent.dueDate ? { dueDate: answers.rent.dueDate } : {}),
      categoryId: rentCategory.id,
      createdOn: ctx.now,
    })
  }

  return { settings, categories: answers.categories, plans: [], transactions, debts, goals }
}
