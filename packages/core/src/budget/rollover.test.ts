import { describe, expect, it } from 'vitest'
import { cashLeft, spendingByCategory, cycleAt, plannedFor } from './budget'
import { allowanceFor, carriedIn, carriedInLookup, leftoverFrom, previousCycle } from './rollover'
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

const SEPT = '2026-09-25' as IsoDate
const AUG = '2026-08-25' as IsoDate
const TODAY = '2026-10-05' as IsoDate

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

const SEED: Array<[string, CategoryType, number, boolean]> = [
  ['Rent fund', 'savings', 75_000, false],
  ['Food and groceries', 'expense', 90_000, true],
  ['Transport, data and airtime', 'expense', 45_000, false],
]

const categories: Category[] = SEED.map(([name, type, , rollsOver], index) => ({
  id: `c${index}` as Id,
  name,
  type,
  rollsOver,
  sortOrder: index,
  updatedAt: STAMPED_AT,
}))

const food = categories[1]!
const transport = categories[2]!

function planFor(cycleStart: IsoDate): PlanEntry[] {
  return SEED.map(([, , planned], index) => ({
    id: `p-${cycleStart}-${index}` as Id,
    cycleStart,
    categoryId: `c${index}` as Id,
    planned: naira(planned),
    updatedAt: STAMPED_AT,
  }))
}

let seq = 0
function movement(
  date: string,
  type: TransactionType,
  amount: number,
  category?: Category,
): Transaction {
  seq += 1
  return {
    id: `t${seq}` as Id,
    date: date as IsoDate,
    type,
    amount: naira(amount),
    categoryId: category?.id,
    createdAt: '2026-10-05T00:00:00.000+01:00' as Transaction['createdAt'],
    updatedAt: STAMPED_AT,
  }
}

function snapshotWith(plans: PlanEntry[], transactions: Transaction[]): Snapshot {
  return { settings, categories, plans, transactions, debts: [], goals: [] }
}

/** August: ₦78,000 of a ₦90,000 food allowance spent, so ₦12,000 carries. */
const augustMovements = [
  movement('2026-08-25', 'income', 450_000),
  movement('2026-08-26', 'expense', 78_000, food),
  movement('2026-08-27', 'expense', 45_000, transport),
]

const septemberMovements = [
  movement('2026-09-25', 'income', 450_000),
  movement('2026-09-28', 'expense', 40_000, food),
]

const twoCycles = snapshotWith(
  [...planFor(AUG), ...planFor(SEPT)],
  [...augustMovements, ...septemberMovements],
)

const cycle = cycleAt(twoCycles, TODAY)

describe('the test that matters most', () => {
  it('cash left is identical with rollover on and off', () => {
    // If this ever fails, the same naira is spendable twice — once as cash and
    // again as allowance.
    const withRollover = cashLeft(twoCycles, cycle)

    const withoutRollover = cashLeft(
      { ...twoCycles, categories: categories.map((c) => ({ ...c, rollsOver: false })) },
      cycle,
    )

    expect(formatMoney(withRollover)).toBe(formatMoney(withoutRollover))
  })

  it('and the allowance is not', () => {
    const rolling = allowanceFor(twoCycles, cycle, food)
    const notRolling = allowanceFor(twoCycles, cycle, { ...food, rollsOver: false })
    expect(formatMoney(rolling)).toBe('₦102,000.00')
    expect(formatMoney(notRolling)).toBe('₦90,000.00')
  })
})

describe('how much carries', () => {
  it('carries ₦12,000.00 of food from August into September', () => {
    expect(formatMoney(carriedIn(twoCycles, cycle, food))).toBe('₦12,000.00')
  })

  it('carries nothing for a category that does not roll over', () => {
    expect(carriedIn(twoCycles, cycle, transport)).toBe(0)
  })

  it('carries nothing when there is no cycle before this one', () => {
    const first = snapshotWith(planFor(SEPT), septemberMovements)
    expect(carriedIn(first, cycleAt(first, TODAY), food)).toBe(0)
  })

  it('does not carry a debt forward when a category was overspent', () => {
    // The overspend was already shown on the cycle where it happened. Carrying
    // it would punish the same month twice, invisibly.
    const overspent = snapshotWith(
      [...planFor(AUG), ...planFor(SEPT)],
      [
        movement('2026-08-25', 'income', 450_000),
        movement('2026-08-26', 'expense', 120_000, food),
        ...septemberMovements,
      ],
    )
    expect(carriedIn(overspent, cycleAt(overspent, TODAY), food)).toBe(0)
  })

  it('gives the allowance as planned plus carried', () => {
    expect(formatMoney(plannedFor(twoCycles.plans, cycle, food.id))).toBe('₦90,000.00')
    expect(formatMoney(allowanceFor(twoCycles, cycle, food))).toBe('₦102,000.00')
  })
})

describe('compounding across a frugal run', () => {
  it('accumulates, because each allowance included what carried into it', () => {
    const july = '2026-07-25' as IsoDate
    const threeCycles = snapshotWith(
      [...planFor(july), ...planFor(AUG), ...planFor(SEPT)],
      [
        movement('2026-07-25', 'income', 450_000),
        movement('2026-07-26', 'expense', 80_000, food), // ₦10,000 carries
        movement('2026-08-25', 'income', 450_000),
        movement('2026-08-26', 'expense', 78_000, food), // 90,000 + 10,000 − 78,000
        ...septemberMovements,
      ],
    )
    // August's allowance was ₦100,000; ₦78,000 spent leaves ₦22,000.
    expect(formatMoney(carriedIn(threeCycles, cycleAt(threeCycles, TODAY), food))).toBe(
      '₦22,000.00',
    )
  })

  it('terminates on a long chain rather than recursing forever', () => {
    const months = Array.from({ length: 30 }, (_, i) => {
      const month = String(((i + 1) % 12) + 1).padStart(2, '0')
      const year = 2024 + Math.floor(i / 12)
      return `${year}-${month}-25` as IsoDate
    })
    const long = snapshotWith(months.flatMap(planFor), septemberMovements)
    expect(() => carriedIn(long, cycleAt(long, TODAY), food)).not.toThrow()
  })
})

describe('the lookup the spending table uses', () => {
  it('feeds the carried amount in without the spending table knowing rollover exists', () => {
    const rows = spendingByCategory(twoCycles, cycle, carriedInLookup(twoCycles, cycle))
    const foodRow = rows.find((r) => r.name.startsWith('Food'))!
    expect(formatMoney(foodRow.allowance)).toBe('₦102,000.00')
    expect(formatMoney(foodRow.spent)).toBe('₦40,000.00')
    expect(Math.round(foodRow.portionUsed * 100)).toBe(39)
  })

  it('returns zero for a category that no longer exists', () => {
    expect(carriedInLookup(twoCycles, cycle)('gone' as Id)).toBe(0)
  })
})

describe('the leftover, which is a different thing', () => {
  it('is whole-cycle cash nobody spent', () => {
    const august = previousCycle(twoCycles, cycle)
    // ₦450,000 in, ₦123,000 spent, rent never moved so ₦75,000 stays protected.
    expect(formatMoney(leftoverFrom(twoCycles, august))).toBe('₦252,000.00')
  })

  it('never reports a negative leftover', () => {
    const overspent = snapshotWith(planFor(AUG), [
      movement('2026-08-25', 'income', 100_000),
      movement('2026-08-26', 'expense', 400_000, food),
    ])
    expect(leftoverFrom(overspent, cycleAt(overspent, '2026-08-30'))).toBe(0)
  })
})
