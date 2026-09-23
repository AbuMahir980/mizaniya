/**
 * WHAT: The seeded household from `docs/seed-data.md`, and the assertions that
 *       prove it still matches that document.
 * WHY:  **An export file rather than a dev-only seeding route.** v1 has no
 *       server and the repository is IndexedDB, which a Node script cannot
 *       reach — and CLAUDE.md forbids a mock-data layer. Writing the documented
 *       export format means the demo data arrives through the code T9 already
 *       built and tested, and nothing ships in the production bundle.
 * INTERVIEW: I kept the seed's data and its assertions in a module with no
 *       side effects, so a test could run the assertions without writing files.
 */

import { naira } from '../src/core/money/money'
import type {
  Category,
  Debt,
  Goal,
  Id,
  Instant,
  IsoDate,
  Kobo,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
} from '../src/core/types'

/** Every figure below is transcribed from `docs/seed-data.md`. None is invented here. */

/**
 * **Throws rather than exiting.** A check that calls `process.exit` cannot be
 * tested, and an assertion nobody can prove fires is the thing this whole
 * ticket exists to avoid.
 */
export class SeedMismatch extends Error {}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new SeedMismatch(message)
}

// ---------------------------------------------------------------------------
// Dates — the scenario is anchored on its documented cycle and shifted whole
// months, so the salary day stays the 25th and every relative position holds.
// ---------------------------------------------------------------------------

export const ANCHOR_CYCLE_START = '2026-09-25'

export function shiftMonths(date: string, months: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  // Clamp rather than roll over: 30 September shifted to February is the 28th,
  // not the 2nd of March. Cycle boundaries are nominal (D4).
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  const day = Math.min(d, lastDay)
  return `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` as IsoDate
}

/** The cycle start on or before `today`, for a salary day of the 25th. */
export function cycleStartOn(today: Date): string {
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth()
  const start = today.getUTCDate() >= 25 ? new Date(Date.UTC(y, m, 25)) : new Date(Date.UTC(y, m - 1, 25))
  return start.toISOString().slice(0, 10)
}

export function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number) as [number, number]
  const [ty, tm] = to.split('-').map(Number) as [number, number]
  return (ty - fy) * 12 + (tm - fm)
}

// ---------------------------------------------------------------------------
// The household
// ---------------------------------------------------------------------------

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
}

/**
 * The twelve planned categories, plus one for salary.
 *
 * Income is not a planned category — nothing allocates it — but the schema
 * requires every income movement to name one, so it exists as a record rather
 * than as a figure.
 */
const CATEGORIES: (Category & { planned?: Kobo })[] = [
  { id: 'c-salary' as Id, name: 'Salary', type: 'income', rollsOver: false, sortOrder: 0 },
  { id: 'c-rent' as Id, name: 'Rent fund', type: 'savings', rollsOver: false, sortOrder: 1, planned: naira(75_000) },
  { id: 'c-debt-friend' as Id, name: 'Debt payment — A. Friend', type: 'debt-payment', rollsOver: false, sortOrder: 2, planned: naira(30_000) },
  { id: 'c-emergency' as Id, name: 'Emergency fund', type: 'savings', rollsOver: false, sortOrder: 3, planned: naira(15_000) },
  { id: 'c-personal' as Id, name: 'Personal savings', type: 'savings', rollsOver: false, sortOrder: 4, planned: naira(70_000) },
  { id: 'c-food' as Id, name: 'Food and groceries', type: 'expense', rollsOver: true, sortOrder: 5, planned: naira(90_000) },
  { id: 'c-transport' as Id, name: 'Transport, data and airtime', type: 'expense', rollsOver: false, sortOrder: 6, planned: naira(45_000) },
  { id: 'c-family' as Id, name: 'Family support', type: 'expense', rollsOver: false, sortOrder: 7, planned: naira(40_000) },
  { id: 'c-apartment' as Id, name: 'Apartment setup', type: 'expense', rollsOver: false, sortOrder: 8, planned: naira(25_000) },
  { id: 'c-misc' as Id, name: 'Miscellaneous', type: 'expense', rollsOver: false, sortOrder: 9, planned: naira(22_000) },
  { id: 'c-utilities' as Id, name: 'Utilities', type: 'expense', rollsOver: false, sortOrder: 10, planned: naira(18_000) },
  { id: 'c-health' as Id, name: 'Health', type: 'expense', rollsOver: false, sortOrder: 11, planned: naira(10_000) },
  { id: 'c-sadaqah' as Id, name: 'Sadaqah', type: 'expense', rollsOver: false, sortOrder: 12, planned: naira(10_000) },
]

const DEBTS: Debt[] = [
  { id: 'd-friend' as Id, counterpartyName: 'A. Friend', openedOn: '2026-09-24' as IsoDate, scheduleAmount: naira(30_000), witnesses: [] },
  { id: 'd-spouse' as Id, counterpartyName: 'Spouse', openedOn: '2026-09-24' as IsoDate, witnesses: [] },
  { id: 'd-colleague' as Id, counterpartyName: 'B. Colleague', openedOn: '2026-09-24' as IsoDate, witnesses: [] },
]

const GOALS: Goal[] = [
  { id: 'g-rent' as Id, name: 'Annual rent', target: naira(900_000), dueDate: '2027-03-01' as IsoDate, categoryId: 'c-rent' as Id, createdOn: '2026-08-24' as IsoDate },
  { id: 'g-emergency' as Id, name: 'Emergency fund', target: naira(150_000), categoryId: 'c-emergency' as Id, createdOn: '2026-08-24' as IsoDate },
]

/** `docs/seed-data.md` § "The 23 movements, 25 September to 5 October". */
type Row = [day: string, type: Transaction['type'], amount: number, ref: string, note?: string]

const MOVEMENTS: Row[] = [
  ['2026-09-25', 'income', 450_000, 'c-salary', 'Salary'],
  ['2026-09-25', 'savings-in', 75_000, 'c-rent'],
  ['2026-09-25', 'savings-in', 15_000, 'c-emergency'],
  ['2026-09-25', 'repaid', 30_000, 'd-friend', 'Monthly repayment'],
  ['2026-09-25', 'expense', 12_500, 'c-food', "Month's foodstuff"],
  ['2026-09-25', 'expense', 8_000, 'c-transport', 'Data bundle and airtime'],
  ['2026-09-26', 'expense', 3_200, 'c-food', 'Market'],
  ['2026-09-26', 'expense', 2_500, 'c-transport', 'Fuel'],
  ['2026-09-28', 'expense', 4_750, 'c-utilities', 'Electricity units'],
  ['2026-09-28', 'expense', 3_000, 'c-transport', 'Fuel'],
  ['2026-09-29', 'expense', 5_400, 'c-food', 'Market'],
  ['2026-09-29', 'expense', 8_000, 'c-family', 'Monthly support'],
  ['2026-09-30', 'expense', 4_250, 'c-transport', 'Fuel'],
  ['2026-09-30', 'expense', 2_000, 'c-misc', 'Barber'],
  ['2026-10-01', 'expense', 14_000, 'c-health', 'Clinic visit and prescription'],
  ['2026-10-01', 'expense', 4_800, 'c-food', 'Market'],
  ['2026-10-02', 'expense', 6_500, 'c-transport', 'Fuel and transport'],
  ['2026-10-02', 'expense', 6_100, 'c-food', 'Groceries'],
  ['2026-10-03', 'expense', 5_000, 'c-food', 'Market'],
  ['2026-10-03', 'expense', 3_000, 'c-misc', 'Household items'],
  ['2026-10-04', 'expense', 7_000, 'c-transport', 'Fuel'],
  ['2026-10-04', 'expense', 3_000, 'c-food', 'Bread and provisions'],
  ['2026-10-05', 'expense', 7_000, 'c-transport', 'Fuel'],
]

/** § "Opening movements, dated 24 September" — the day *before* the cycle. */
const OPENINGS: Row[] = [
  ['2026-09-24', 'savings-in', 400_000, 'c-rent', 'Opening balance'],
  ['2026-09-24', 'borrowed', 120_000, 'd-friend', 'Opening balance'],
  ['2026-09-24', 'borrowed', 60_000, 'd-spouse', 'Opening balance'],
  ['2026-09-24', 'lent', 40_000, 'd-colleague', 'Opening balance'],
]

/**
 * § "The first cycle" — its plan and the one figure that carries forward.
 *
 * **Only food is seeded.** The document records the first cycle's totals but
 * deliberately does not enumerate its movements, and says the rollover "needs
 * only the food figure" — ₦78,000.00 spent against ₦90,000.00 planned, which is
 * where the ₦12,000.00 carried comes from. Splitting the remaining ₦277,000.00
 * of that cycle's spending across categories would mean inventing figures at
 * the point of use, which repo rule 2 forbids. Months will show that cycle
 * incomplete until the document enumerates it.
 */
const FIRST_CYCLE_START = '2026-08-25'
const FIRST_CYCLE: Row[] = [['2026-09-20', 'expense', 78_000, 'c-food', 'First cycle, as documented']]

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

let counter = 0
export function resetIds(): void {
  counter = 0
}
function idFor(prefix: string): Id {
  counter += 1
  return `${prefix}-${String(counter).padStart(3, '0')}` as Id
}

function toTransaction([day, type, amount, ref, note]: Row, months: number): Transaction {
  const date = shiftMonths(day, months)
  const isDebt = ref.startsWith('d-')
  return {
    id: idFor('seed'),
    date,
    type,
    amount: naira(amount),
    ...(isDebt ? { debtId: ref as Id } : { categoryId: ref as Id }),
    ...(type === 'savings-in' || type === 'savings-out'
      ? { savingsDestination: ref === 'c-emergency' ? ('piggyvest' as const) : ('bank-vault' as const) }
      : {}),
    ...(note ? { note } : {}),
    createdAt: `${date}T09:00:00.000Z` as Instant,
  }
}

export function build(months: number, withMovements: boolean): Snapshot {
  const categories: Category[] = CATEGORIES.map(({ planned: _planned, ...category }) => category)

  const plans: PlanEntry[] = CATEGORIES.filter((c) => c.planned !== undefined).map((c) => ({
    id: idFor('plan'),
    cycleStart: shiftMonths(ANCHOR_CYCLE_START, months),
    categoryId: c.id,
    planned: c.planned as Kobo,
  }))

  // The first cycle's food allocation, so the ₦12,000 rollover has a source.
  plans.push({
    id: idFor('plan'),
    cycleStart: shiftMonths(FIRST_CYCLE_START, months),
    categoryId: 'c-food' as Id,
    planned: naira(90_000),
  })

  const transactions = withMovements
    ? [...FIRST_CYCLE, ...OPENINGS, ...MOVEMENTS].map((row) => toTransaction(row, months))
    : []

  return {
    settings,
    categories,
    plans,
    transactions,
    debts: withMovements ? DEBTS : [],
    goals: GOALS,
  }
}

// ---------------------------------------------------------------------------
// The assertions. These are the point of the ticket.
// ---------------------------------------------------------------------------

/** § "The expense split on that day" — every per-category figure. */
const EXPECTED_BY_CATEGORY: Record<string, number> = {
  'c-health': 14_000,
  'c-transport': 38_250,
  'c-food': 40_000,
  'c-utilities': 4_750,
  'c-misc': 5_000,
  'c-family': 8_000,
  'c-apartment': 0,
  'c-sadaqah': 0,
}

export function checkSeed(snapshot: Snapshot, months: number): void {
  const cycleStart = shiftMonths(ANCHOR_CYCLE_START, months)
  const cycleEnd = shiftMonths('2026-10-25', months)

  const inCycle = snapshot.transactions.filter((t) => t.date >= cycleStart && t.date < cycleEnd)
  const expenses = inCycle.filter((t) => t.type === 'expense')

  assert(expenses.length === 19, `expected 19 expenses this cycle, found ${expenses.length}`)

  const total = expenses.reduce((sum, t) => sum + t.amount, 0)
  assert(
    total === naira(110_000),
    `the 19 expenses must total ₦110,000.00; they total ${total / 100}`,
  )

  for (const [categoryId, expected] of Object.entries(EXPECTED_BY_CATEGORY)) {
    const got = expenses.filter((t) => t.categoryId === categoryId).reduce((s, t) => s + t.amount, 0)
    assert(
      got === naira(expected),
      `${categoryId}: documented ₦${expected.toLocaleString()}, seeded ₦${(got / 100).toLocaleString()}`,
    )
  }

  const planned = snapshot.plans
    .filter((p) => p.cycleStart === cycleStart)
    .reduce((sum, p) => sum + p.planned, 0)
  assert(planned === naira(450_000), `the plan must total ₦450,000.00; it totals ${planned / 100}`)

  // § "Opening balances" — dated the day before, so they are outside the cycle.
  const openings = snapshot.transactions.filter((t) => t.date === shiftMonths('2026-09-24', months))
  assert(openings.length === 4, `expected 4 opening movements, found ${openings.length}`)
  for (const opening of openings) {
    assert(opening.date < cycleStart, 'an opening movement must fall outside the cycle')
  }

  assert(inCycle.length === 23, `expected 23 movements this cycle, found ${inCycle.length}`)
}
