import { describe, expect, it } from 'vitest'
import {
  totalMoved,
  amberThreshold,
  cashLeft,
  spendingByCategory,
  cycleAt,
  isProtected,
  plannedDailyAllowance,
  protectedRemaining,
  safeToSpend,
  plannedForSpending,
  unallocated,
} from './budget'
import { formatMoney, naira } from '../money/money'
import type {
  Category,
  CategoryType,
  Id,
  Instant,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
  TransactionType,
} from '../types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const CYCLE_START = '2026-09-25' as IsoDate
const TODAY = '2026-10-05' as IsoDate

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

/** The seeded plan, exactly as `docs/seed-data.md` sets it. */
const SEED: Array<[string, CategoryType, number, boolean]> = [
  ['Rent fund', 'savings', 75_000, false],
  ['Debt payment — A. Friend', 'debt-payment', 30_000, false],
  ['Emergency fund', 'savings', 15_000, false],
  ['Personal savings', 'savings', 70_000, false],
  ['Food and groceries', 'expense', 90_000, true],
  ['Transport, data and airtime', 'expense', 45_000, false],
  ['Family support', 'expense', 40_000, false],
  ['Apartment setup', 'expense', 25_000, false],
  ['Miscellaneous', 'expense', 22_000, false],
  ['Utilities', 'expense', 18_000, false],
  ['Health', 'expense', 10_000, false],
  ['Sadaqah', 'expense', 10_000, false],
]

const categories: Category[] = SEED.map(([name, type, , rollsOver], index) => ({
  id: `c${index}` as Id,
  name,
  type,
  rollsOver,
  sortOrder: index,
  updatedAt: STAMPED_AT,
}))

const plans: PlanEntry[] = SEED.map(([, , planned], index) => ({
  id: `p${index}` as Id,
  cycleStart: CYCLE_START,
  categoryId: `c${index}` as Id,
  planned: naira(planned),
  updatedAt: STAMPED_AT,
}))

const byName = (name: string) => categories.find((c) => c.name.startsWith(name))!.id

let seq = 0
function movement(
  date: string,
  type: TransactionType,
  amount: number,
  categoryName?: string,
): Transaction {
  seq += 1
  return {
    id: `t${seq}` as Id,
    date: date as IsoDate,
    type,
    amount: naira(amount),
    categoryId: categoryName ? byName(categoryName) : undefined,
    createdAt: '2026-10-05T00:00:00.000+01:00' as Transaction['createdAt'],
    updatedAt: STAMPED_AT,
  }
}

/**
 * The worked day: income, three protected movements, and the ₦110,000.00 expense
 * split from `docs/seed-data.md`, category by category.
 *
 * `extraFood` adds to the total without touching the split — used for the amber
 * and red variants, which differ only in how much was spent.
 */
function seededTransactions(extraFood = 0): Transaction[] {
  const expenses: Array<[string, number]> = [
    ['Health', 14_000],
    ['Transport', 38_250],
    ['Food', 40_000],
    ['Utilities', 4_750],
    ['Miscellaneous', 5_000],
    ['Family', 8_000],
  ]
  return [
    movement('2026-09-25', 'income', 450_000),
    movement('2026-09-25', 'savings-in', 75_000, 'Rent fund'),
    movement('2026-09-25', 'savings-in', 15_000, 'Emergency'),
    movement('2026-09-25', 'expense', 30_000, 'Debt payment'),
    ...expenses.map(([name, amount]) => movement('2026-09-28', 'expense', amount, name)),
    ...(extraFood > 0 ? [movement('2026-09-29', 'expense', extraFood, 'Food')] : []),
  ]
}

function snapshotWith(transactions: Transaction[], planEntries = plans): Snapshot {
  return { settings, categories, plans: planEntries, transactions, debts: [], goals: [] }
}

const seeded = snapshotWith(seededTransactions())
const cycle = cycleAt(seeded, TODAY)

describe('what counts as protected', () => {
  it('is everything that is not an expense', () => {
    expect(isProtected(categories[0]!)).toBe(true) // rent fund, savings
    expect(isProtected(categories[4]!)).toBe(false) // food, expense
  })

  it('lets a per-category override beat the type', () => {
    expect(isProtected({ ...categories[4]!, protectedOverride: true })).toBe(true)
    expect(isProtected({ ...categories[0]!, protectedOverride: false })).toBe(false)
  })
})

describe('the worked day, from docs/seed-data.md', () => {
  it('cash left is ₦220,000.00', () => {
    expect(formatMoney(cashLeft(seeded, cycle))).toBe('₦220,000.00')
  })

  it('protected remaining is ₦70,000.00 — planned minus actual, not planned', () => {
    // Rent, emergency and the debt payment have already moved, so they contribute
    // nothing. Only personal savings is still outstanding.
    expect(formatMoney(protectedRemaining(seeded, cycle))).toBe('₦70,000.00')
  })

  it('safe to spend is ₦150,000.00 in total and ₦7,500.00 a day, green', () => {
    const result = safeToSpend(seeded, TODAY)
    expect(formatMoney(result.total)).toBe('₦150,000.00')
    expect(formatMoney(result.perDay)).toBe('₦7,500.00')
    expect(result.daysLeft).toBe(20)
    expect(result.level).toBe('green')
  })

  it('the spendable plan is ₦260,000.00 and the daily allowance ₦8,666.66', () => {
    expect(formatMoney(plannedForSpending(seeded, cycle))).toBe('₦260,000.00')
    expect(formatMoney(plannedDailyAllowance(seeded, cycle))).toBe('₦8,666.66')
  })

  it('the amber threshold is ₦5,200.00, not ₦5,199.99', () => {
    // 26,000,000 × 600 ÷ (1000 × 30). Dividing last is what makes it exact.
    expect(formatMoney(amberThreshold(seeded, cycle))).toBe('₦5,200.00')
  })

  it('the plan is complete, so unallocated is ₦0.00', () => {
    expect(formatMoney(unallocated(seeded, cycle))).toBe('₦0.00')
  })

  it('the tiles read income ₦450,000.00, saved ₦90,000.00', () => {
    expect(formatMoney(totalMoved(seeded, cycle, ['income']))).toBe('₦450,000.00')
    expect(formatMoney(totalMoved(seeded, cycle, ['savings-in']))).toBe('₦90,000.00')
  })
})

describe('the amber variant', () => {
  // ₦110,000.00 spent plus ₦50,000.00 more — the ₦160,000.00 amber variant.
  const amber = snapshotWith(seededTransactions(50_000))

  it('lands at ₦5,000.00 a day and flips to amber', () => {
    const result = safeToSpend(amber, TODAY)
    expect(formatMoney(result.perDay)).toBe('₦5,000.00')
    expect(result.level).toBe('amber')
  })

  it('carries the threshold it fell below', () => {
    const result = safeToSpend(amber, TODAY)
    expect(result.level === 'amber' && formatMoney(result.threshold)).toBe('₦5,200.00')
  })
})

describe('the three states', () => {
  it('red means negative, not merely low', () => {
    const overspent = snapshotWith([
      ...seededTransactions(),
      movement('2026-10-01', 'expense', 200_000, 'Food'),
    ])
    const result = safeToSpend(overspent, TODAY)
    expect(result.perDay).toBeLessThan(0)
    expect(result.level).toBe('red')
  })

  it('exactly zero is amber, not red', () => {
    // Spend precisely the safe amount: ₦110,000 + ₦150,000 = ₦260,000.
    const exact = snapshotWith([
      ...seededTransactions(),
      movement('2026-10-01', 'expense', 150_000, 'Food'),
    ])
    const result = safeToSpend(exact, TODAY)
    expect(formatMoney(result.perDay)).toBe('₦0.00')
    expect(result.level).toBe('amber')
  })

  it('has no amber state when there is no plan', () => {
    const unplanned = snapshotWith(seededTransactions(), [])
    const result = safeToSpend(unplanned, TODAY)
    expect(result.hasPlan).toBe(false)
    expect(result.level).toBe('green')
  })

  it('is still red with no plan, because overspending is overspending', () => {
    const unplanned = snapshotWith(
      [...seededTransactions(), movement('2026-10-01', 'expense', 400_000, 'Food')],
      [],
    )
    expect(safeToSpend(unplanned, TODAY).level).toBe('red')
  })

  it('has no amber state when nothing spendable is planned', () => {
    const protectedOnly = snapshotWith(
      seededTransactions(),
      plans.filter((p) => isProtected(categories.find((c) => c.id === p.categoryId)!)),
    )
    expect(plannedDailyAllowance(protectedOnly, cycle)).toBe(0)
    expect(safeToSpend(protectedOnly, TODAY).level).toBe('green')
  })
})

describe('protected remaining does not double-count', () => {
  it('counts nothing for a category whose plan has already moved', () => {
    const moved = snapshotWith([
      movement('2026-09-25', 'income', 450_000),
      movement('2026-09-25', 'savings-in', 75_000, 'Rent fund'),
    ])
    const c = cycleAt(moved, TODAY)
    // Rent contributes 0; the other three protected categories are untouched.
    const expected = 30_000 + 15_000 + 70_000
    expect(formatMoney(protectedRemaining(moved, c))).toBe(formatMoney(naira(expected)))
  })

  it('never goes negative when a category is overshot', () => {
    const overshot = snapshotWith([
      movement('2026-09-25', 'income', 450_000),
      movement('2026-09-25', 'savings-in', 200_000, 'Rent fund'),
    ])
    const c = cycleAt(overshot, TODAY)
    const expected = 30_000 + 15_000 + 70_000
    expect(formatMoney(protectedRemaining(overshot, c))).toBe(formatMoney(naira(expected)))
  })
})

describe('what is left in each category', () => {
  const rows = spendingByCategory(seeded, cycle)

  it('puts the worst row first', () => {
    expect(rows[0]!.name).toBe('Health')
    expect(rows[0]!.status).toBe('overspent')
  })

  it('marks transport low at 85%', () => {
    const transport = rows.find((r) => r.name.startsWith('Transport'))!
    expect(Math.round(transport.portionUsed * 100)).toBe(85)
    expect(transport.status).toBe('low')
  })

  it('leaves an untouched category alone', () => {
    const sadaqah = rows.find((r) => r.name === 'Sadaqah')!
    expect(formatMoney(sadaqah.spent)).toBe('₦0.00')
    expect(sadaqah.status).toBe('ok')
  })

  it('adds anything carried in to the allowance', () => {
    const withCarry = spendingByCategory(seeded, cycle, (id) =>
      id === byName('Food') ? naira(12_000) : (0 as never),
    )
    const food = withCarry.find((r) => r.name.startsWith('Food'))!
    expect(formatMoney(food.allowance)).toBe('₦102,000.00')
  })
})

describe('unallocated', () => {
  it('counts money carried from last cycle towards the total to allocate', () => {
    expect(formatMoney(unallocated(seeded, cycle, naira(20_000)))).toBe('₦20,000.00')
  })

  it('is the whole take-home when nothing is planned', () => {
    const none = snapshotWith(seededTransactions(), [])
    expect(formatMoney(unallocated(none, cycle))).toBe('₦450,000.00')
  })
})
