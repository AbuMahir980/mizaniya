import { addDays, cycleFor } from '@/core/cycle/cycle'
import { stampAll } from '@/core/sync/stamp'
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
  Unstamped,
} from '@/core/types'

/** Which way a debt was entered. The balance derives from the movement (D9). */
export type DebtDirection = 'i-owe' | 'owed-to-me'

export interface DebtAnswer {
  counterpartyName: string
  direction: DebtDirection
  amount: Kobo
  /**
   * When the debt began, if the owner said.
   *
   * **Not the same as the opening movement's date, and deliberately so.**
   * `openedOn` is a fact about the relationship and may be months back; the
   * movement is dated the day before the cycle so the balance never counts as
   * this cycle's activity. Collapsing the two would either put a March debt
   * into March's figures or claim every debt started on the 24th.
   */
  openedOn?: IsoDate
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
  categories: Unstamped<Category>[]
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

export function starterCategories(makeId: () => string): Unstamped<Category>[] {
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
    // Stamped inline rather than at the return, because `cycleFor` below takes a
    // complete `Settings` and this is the instant it was created at anyway.
    updatedAt: ctx.at,
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

  const transactions: Unstamped<Transaction>[] = []

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

  const debts: Unstamped<Debt>[] = []
  for (const answer of answers.debts) {
    const debtId = ctx.makeId() as Id
    debts.push({
      id: debtId,
      counterpartyName: answer.counterpartyName,
      openedOn: answer.openedOn ?? openingDate,
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

  const goals: Unstamped<Goal>[] = []
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

  /**
   * Stamped with `ctx.at` — the instant, not `ctx.now`, which is a calendar date
   * (ADR-003). These rows genuinely are created at this instant, so it is the
   * true answer rather than a backfill, and onboarding hands the result to
   * `import`, which preserves timestamps instead of inventing its own.
   */
  return {
    settings,
    categories: stampAll(answers.categories, ctx.at),
    plans: [],
    transactions: stampAll(transactions, ctx.at),
    debts: stampAll(debts, ctx.at),
    goals: stampAll(goals, ctx.at),
  }
}
