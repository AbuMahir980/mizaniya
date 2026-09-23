/**
 * WHAT: The Transactions list's derivations — filtering, day grouping, the
 *       "spent" subtotals and savings per destination.
 * WHY:  Figures come from `docs/seed-data.md` §"The 23 movements", and the day
 *       subtotals here are the same ones drawn on `TransactionsLight.dc.html`.
 *       **That is the point of using them**: if the maths and the artboard ever
 *       disagree, one of the two is wrong and this test says so.
 * INTERVIEW: I pinned the list's subtotals to the figures already drawn in the
 *           design, so the screen and its maths cannot drift apart silently.
 */

import { describe, expect, it } from 'vitest'
import {
  DESTINATION_LABELS,
  MOVEMENT_LABELS,
  MOVEMENT_TYPES,
  groupByDay,
  matchesFilter,
  movementsMatching,
  savingsByDestination,
  spentIn,
} from './movement'
import { cycleAt } from '../budget/budget'
import { naira } from '../money/money'
import type { Category, Id, Instant, IsoDate, Settings, Snapshot, Transaction } from '../types'

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
}

const food = { id: 'c-food' as Id, name: 'Food and groceries', type: 'expense', rollsOver: true, sortOrder: 0 } satisfies Category
const transport = { id: 'c-transport' as Id, name: 'Transport, data and airtime', type: 'expense', rollsOver: false, sortOrder: 1 } satisfies Category
const rent = { id: 'c-rent' as Id, name: 'Rent fund', type: 'savings', rollsOver: false, sortOrder: 2 } satisfies Category

let sequence = 0
function movement(partial: Partial<Transaction> & Pick<Transaction, 'date' | 'type' | 'amount'>): Transaction {
  sequence += 1
  return {
    id: `t-${sequence}` as Id,
    // Recorded in the order written, so "most recent first" is testable.
    createdAt: `2026-10-05T${String(sequence).padStart(2, '0')}:00:00.000Z` as Instant,
    ...partial,
  }
}

/** The tail of the seeded cycle — 1 to 5 October, the days the artboard draws. */
function seeded(): Snapshot {
  return {
    settings,
    categories: [food, transport, rent],
    plans: [],
    debts: [],
    goals: [],
    transactions: [
      movement({ date: '2026-10-01' as IsoDate, type: 'expense', amount: naira(14_000), categoryId: 'c-health' as Id, note: 'Clinic visit and prescription' }),
      movement({ date: '2026-10-01' as IsoDate, type: 'expense', amount: naira(4_800), categoryId: food.id, note: 'Market' }),
      movement({ date: '2026-10-03' as IsoDate, type: 'expense', amount: naira(5_000), categoryId: food.id, note: 'Market' }),
      movement({ date: '2026-10-03' as IsoDate, type: 'expense', amount: naira(3_000), categoryId: 'c-misc' as Id, note: 'Household items' }),
      movement({ date: '2026-10-04' as IsoDate, type: 'expense', amount: naira(7_000), categoryId: transport.id, note: 'Fuel' }),
      movement({ date: '2026-10-04' as IsoDate, type: 'expense', amount: naira(3_000), categoryId: food.id, note: 'Bread and provisions' }),
      movement({ date: '2026-10-05' as IsoDate, type: 'expense', amount: naira(7_000), categoryId: transport.id, note: 'Fuel' }),
    ],
  }
}

const NOW = '2026-10-05' as IsoDate

describe('the eight, in one voice', () => {
  it('reads as everyday speech, not accounting', () => {
    // Spent and Received rather than Expense and Income (D7, O4). The owner is
    // describing something they did.
    expect(MOVEMENT_LABELS.expense).toBe('Spent')
    expect(MOVEMENT_LABELS.income).toBe('Received')
    expect(MOVEMENT_LABELS['savings-in']).toBe('Moved to savings')
    expect(MOVEMENT_LABELS['savings-out']).toBe('Took from savings')
  })

  it('covers all eight with no gaps, so a new type cannot ship unlabelled', () => {
    expect(MOVEMENT_TYPES).toHaveLength(8)
    for (const type of MOVEMENT_TYPES) {
      expect(MOVEMENT_LABELS[type]).toBeTruthy()
    }
    expect(new Set(Object.values(MOVEMENT_LABELS)).size).toBe(8)
  })

  it('names every savings destination', () => {
    expect(Object.values(DESTINATION_LABELS)).toHaveLength(5)
    expect(DESTINATION_LABELS['bank-vault']).toBe('Bank vault')
  })
})

describe('filtering', () => {
  it('an absent filter keeps everything', () => {
    const snapshot = seeded()
    expect(movementsMatching(snapshot, cycleAt(snapshot, NOW))).toHaveLength(7)
  })

  it('an empty types array means "not chosen yet", not "match nothing"', () => {
    // A filter panel with every box cleared is someone who has not decided.
    // Reading it as "nothing" would show an empty list they cannot explain.
    const snapshot = seeded()
    const all = movementsMatching(snapshot, cycleAt(snapshot, NOW), { types: [] })
    expect(all).toHaveLength(7)
  })

  it('narrows to one category', () => {
    const snapshot = seeded()
    const rows = movementsMatching(snapshot, cycleAt(snapshot, NOW), { categoryId: transport.id })

    expect(rows).toHaveLength(2)
    expect(spentIn(rows)).toBe(naira(14_000))
  })

  it('narrows to chosen types', () => {
    const snapshot = seeded()
    expect(movementsMatching(snapshot, cycleAt(snapshot, NOW), { types: ['income'] })).toHaveLength(0)
  })

  it('combines category and type, rather than picking one', () => {
    const snapshot = seeded()
    const rows = movementsMatching(snapshot, cycleAt(snapshot, NOW), {
      categoryId: food.id,
      types: ['income'],
    })
    expect(rows).toHaveLength(0)
    const marketRun = snapshot.transactions[1]!
    expect(matchesFilter(marketRun, { categoryId: food.id, types: ['expense'] })).toBe(true)
  })
})

describe('grouped into days', () => {
  it('newest day first, and only days that have something on them', () => {
    const snapshot = seeded()
    const days = groupByDay(movementsMatching(snapshot, cycleAt(snapshot, NOW)))

    // 2 October is absent: a list of thirty empty headers is not a list.
    expect(days.map((day) => day.date)).toEqual([
      '2026-10-05',
      '2026-10-04',
      '2026-10-03',
      '2026-10-01',
    ])
  })

  it('subtotals each day, matching the figures drawn on the artboard', () => {
    const snapshot = seeded()
    const days = groupByDay(movementsMatching(snapshot, cycleAt(snapshot, NOW)))
    const spentOn = Object.fromEntries(days.map((day) => [day.date, day.spent]))

    // TransactionsLight.dc.html, day headers, top to bottom.
    expect(spentOn['2026-10-05']).toBe(naira(7_000))
    expect(spentOn['2026-10-04']).toBe(naira(10_000))
    expect(spentOn['2026-10-03']).toBe(naira(8_000))
    expect(spentOn['2026-10-01']).toBe(naira(18_800))
  })

  it('puts the most recently recorded movement at the top of its day', () => {
    const snapshot = seeded()
    const fourth = groupByDay(movementsMatching(snapshot, cycleAt(snapshot, NOW)))[1]!

    // The one just entered is the one most likely being corrected.
    expect(fourth.movements.map((m) => m.note)).toEqual(['Bread and provisions', 'Fuel'])
  })
})

describe('what counts as spending', () => {
  it('income is never added to expense, because that total would mean nothing', () => {
    // Amounts are always positive and direction comes from the type (H5).
    const movements = [
      movement({ date: '2026-10-05' as IsoDate, type: 'expense', amount: naira(7_000) }),
      movement({ date: '2026-10-05' as IsoDate, type: 'income', amount: naira(450_000) }),
    ]
    expect(spentIn(movements)).toBe(naira(7_000))
  })

  it('money moved to savings or to a debt is not spending', () => {
    const movements = [
      movement({ date: '2026-09-25' as IsoDate, type: 'savings-in', amount: naira(75_000) }),
      movement({ date: '2026-09-25' as IsoDate, type: 'repaid', amount: naira(30_000) }),
    ]
    // It is money going where the plan already promised it — the same rule
    // `spendingByDay` follows.
    expect(spentIn(movements)).toBe(0)
  })
})

describe('savings per destination', () => {
  it('totals each destination, largest first', () => {
    const movements = [
      movement({ date: '2026-09-25' as IsoDate, type: 'savings-in', amount: naira(75_000), savingsDestination: 'bank-vault' }),
      movement({ date: '2026-09-25' as IsoDate, type: 'savings-in', amount: naira(15_000), savingsDestination: 'piggyvest' }),
    ]

    expect(savingsByDestination(movements)).toEqual([
      { destination: 'bank-vault', total: naira(75_000) },
      { destination: 'piggyvest', total: naira(15_000) },
    ])
  })

  it('totals what it is given rather than netting in against out', () => {
    // Filtered to "Moved to savings" it answers what went in; filtered to
    // "Took from savings", what came out. Netting would answer neither, and
    // could go negative — which H5 has no honest way to show.
    const movements = [
      movement({ date: '2026-09-25' as IsoDate, type: 'savings-in', amount: naira(75_000), savingsDestination: 'bank-vault' }),
      movement({ date: '2026-10-02' as IsoDate, type: 'savings-out', amount: naira(20_000), savingsDestination: 'bank-vault' }),
    ]

    expect(savingsByDestination(movements)).toEqual([
      { destination: 'bank-vault', total: naira(95_000) },
    ])
  })

  it('ignores movements that name no destination', () => {
    const movements = [movement({ date: '2026-10-05' as IsoDate, type: 'expense', amount: naira(7_000) })]
    expect(savingsByDestination(movements)).toEqual([])
  })
})
