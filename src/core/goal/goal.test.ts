/**
 * WHAT: The goal projection, pinned to the worked rent fund in
 *       `docs/seed-data.md` — ₦475,000.00 of ₦900,000.00, ₦50,000.00 short,
 *       needing ₦85,000.00 a payday.
 * WHY:  The rent fund is seeded **behind schedule on purpose**. A demo where
 *       everything is fine demonstrates nothing, and this is the figure that
 *       proves the warning works.
 * INTERVIEW: I tested the case the feature exists for — a goal quietly falling
 *       short — rather than the happy path, which would have passed either way.
 */

import { describe, expect, it } from 'vitest'
import {
  paydaysRemaining,
  plannedContribution,
  projectedGap,
  rateToClose,
  saved,
} from './goal'
import { formatMoney, naira } from '../money/money'
import type {
  Category,
  Goal,
  Id,
  Instant,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
} from '../types'

const TODAY = '2026-10-05' as IsoDate
const CYCLE_START = '2026-09-25' as IsoDate

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
}

const rentCategory: Category = {
  id: 'c-rent' as Id,
  name: 'Rent fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 0,
}

const emergencyCategory: Category = {
  id: 'c-emergency' as Id,
  name: 'Emergency fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 1,
}

/** Annual rent — ₦900,000, due 1 March (`docs/seed-data.md`). */
const rent: Goal = {
  id: 'g-rent' as Id,
  name: 'Annual rent',
  target: naira(900_000),
  dueDate: '2027-03-01' as IsoDate,
  categoryId: rentCategory.id,
  createdOn: '2026-08-24' as IsoDate,
}

/** Emergency fund — ₦150,000, no due date. */
const emergency: Goal = {
  id: 'g-emergency' as Id,
  name: 'Emergency fund',
  target: naira(150_000),
  categoryId: emergencyCategory.id,
  createdOn: '2026-08-24' as IsoDate,
}

let nextId = 0
function move(
  categoryId: Id,
  type: Transaction['type'],
  whole: number,
  date: string,
): Transaction {
  nextId += 1
  return {
    id: `t${nextId}` as Id,
    date: date as IsoDate,
    type,
    amount: naira(whole),
    categoryId,
    createdAt: `${date}T09:00:00.000Z` as Instant,
  }
}

function plan(categoryId: Id, whole: number, cycleStart: IsoDate = CYCLE_START): PlanEntry {
  nextId += 1
  return { id: `p${nextId}` as Id, cycleStart, categoryId, planned: naira(whole) }
}

/**
 * The seeded state on 5 October: ₦400,000 already in the rent fund at the close
 * of the first cycle, plus ₦75,000 moved this cycle.
 */
function seeded(): Snapshot {
  return {
    settings,
    categories: [rentCategory, emergencyCategory],
    plans: [plan(rentCategory.id, 75_000), plan(emergencyCategory.id, 15_000)],
    transactions: [
      move(rentCategory.id, 'savings-in', 305_000, '2026-08-24'),
      move(rentCategory.id, 'savings-in', 95_000, '2026-09-24'),
      move(rentCategory.id, 'savings-in', 75_000, '2026-09-26'),
      move(emergencyCategory.id, 'savings-in', 15_000, '2026-09-26'),
    ],
    debts: [],
    goals: [rent, emergency],
  }
}

describe('saved — a balance, not a flow', () => {
  it('is ₦475,000.00 on 5 October, across two cycles (seed-data)', () => {
    // 305,000 opening + 95,000 at the first cycle's close + 75,000 this cycle.
    expect(formatMoney(saved(seeded(), rent))).toBe('₦475,000.00')
  })

  it('counts every cycle, not just the current one', () => {
    const snapshot = seeded()
    const thisCycleOnly = naira(75_000)
    expect(saved(snapshot, rent)).not.toBe(thisCycleOnly)
  })

  it('subtracts money taken back out', () => {
    const snapshot = seeded()
    snapshot.transactions.push(move(rentCategory.id, 'savings-out', 25_000, '2026-10-02'))
    expect(formatMoney(saved(snapshot, rent))).toBe('₦450,000.00')
  })

  it('is ₦15,000.00 for the emergency fund, from its own category only', () => {
    expect(formatMoney(saved(seeded(), emergency))).toBe('₦15,000.00')
  })
})

describe('the projection counts paydays (D5)', () => {
  it('counts 5 paydays on or before 1 March — 25 Oct through 25 Feb', () => {
    expect(paydaysRemaining(seeded(), rent, TODAY)).toBe(5)
  })

  it('includes 25 February, which really does land before 1 March', () => {
    // Counting whole cycles would discard it and invent a shortfall that is not
    // there. False alarms are cheap once and corrosive twice.
    const wholeCyclesOnly = 4
    expect(paydaysRemaining(seeded(), rent, TODAY)).toBeGreaterThan(wholeCyclesOnly)
  })

  it('reads the planned contribution from the current cycle’s plan', () => {
    expect(formatMoney(plannedContribution(seeded(), rent, TODAY))).toBe('₦75,000.00')
  })
})

describe('projectedGap — the rent fund is behind on purpose', () => {
  it('projects ₦850,000.00 and reports ₦50,000.00 short (seed-data)', () => {
    const projection = projectedGap(seeded(), rent, TODAY)

    expect(projection.kind).toBe('projected')
    if (projection.kind !== 'projected') throw new Error('expected a projection')

    expect(projection.paydays).toBe(5)
    expect(formatMoney(projection.saved)).toBe('₦475,000.00')
    // 475,000 + (5 × 75,000)
    expect(formatMoney(projection.projected)).toBe('₦850,000.00')
    expect(formatMoney(projection.gap)).toBe('₦50,000.00')
    expect(projection.status).toBe('short')
  })

  it('needs ₦85,000.00 a payday to close it (seed-data)', () => {
    // (900,000 − 475,000) ÷ 5, and the same figure from the projection.
    expect(formatMoney(rateToClose(seeded(), rent, TODAY))).toBe('₦85,000.00')

    const projection = projectedGap(seeded(), rent, TODAY)
    if (projection.kind !== 'projected') throw new Error('expected a projection')
    expect(formatMoney(projection.rateToClose)).toBe('₦85,000.00')
  })

  it('is on track, with no gap, once the contribution is enough', () => {
    const snapshot = seeded()
    snapshot.plans = [plan(rentCategory.id, 85_000)]
    const projection = projectedGap(snapshot, rent, TODAY)

    if (projection.kind !== 'projected') throw new Error('expected a projection')
    expect(projection.status).toBe('on-track')
    // 475,000 + (5 × 85,000) = 900,000 exactly.
    expect(formatMoney(projection.projected)).toBe('₦900,000.00')
    expect(projection.gap).toBe(0)
  })

  it('never reports a negative gap — a surplus is not a shortfall', () => {
    const snapshot = seeded()
    snapshot.plans = [plan(rentCategory.id, 200_000)]
    const projection = projectedGap(snapshot, rent, TODAY)

    if (projection.kind !== 'projected') throw new Error('expected a projection')
    expect(projection.gap).toBe(0)
    expect(projection.status).toBe('on-track')
  })
})

describe('rateToClose rounds up', () => {
  it('rounds up, because a rate that leaves a naira short closes nothing', () => {
    const snapshot = seeded()
    // Remaining 425,000 over 3 paydays is 141,666.66r — the owner must find 67 kobo more.
    const nearDeadline = { ...rent, dueDate: '2027-01-01' as IsoDate }
    snapshot.goals = [nearDeadline]

    expect(paydaysRemaining(snapshot, nearDeadline, TODAY)).toBe(3)
    expect(formatMoney(rateToClose(snapshot, nearDeadline, TODAY))).toBe('₦141,666.67')
  })

  it('is zero when the target is already reached', () => {
    const snapshot = seeded()
    snapshot.transactions.push(move(rentCategory.id, 'savings-in', 425_000, '2026-10-04'))
    expect(saved(snapshot, rent)).toBe(naira(900_000))
    expect(rateToClose(snapshot, rent, TODAY)).toBe(0)
  })

  it('is zero rather than infinite when no payday remains before the date', () => {
    // 20 October: the next payday is the 25th, after the deadline.
    const imminent = { ...rent, dueDate: '2026-10-20' as IsoDate }
    const snapshot = seeded()
    expect(paydaysRemaining(snapshot, imminent, TODAY)).toBe(0)
    expect(rateToClose(snapshot, imminent, TODAY)).toBe(0)
  })
})

describe('no due date, and a date gone by', () => {
  it('a goal with no due date gets progress and no badge at all', () => {
    const projection = projectedGap(seeded(), emergency, TODAY)

    expect(projection.kind).toBe('no-deadline')
    expect(formatMoney(projection.saved)).toBe('₦15,000.00')
    expect(formatMoney(projection.remaining)).toBe('₦135,000.00')
    // There is nothing to be on track *for*, which is not the same as on track.
    expect('status' in projection).toBe(false)
    expect('gap' in projection).toBe(false)
  })

  it('a passed due date is overdue, and the projection stops', () => {
    const passed = { ...rent, dueDate: '2026-09-01' as IsoDate }
    const projection = projectedGap(seeded(), passed, TODAY)

    expect(projection.kind).toBe('overdue')
    // No paydays are counted forward: the date is gone, not approaching.
    expect('projected' in projection).toBe(false)
    expect(formatMoney(projection.remaining)).toBe('₦425,000.00')
  })

  it('the due date itself is still in play, not yet overdue', () => {
    const today = { ...rent, dueDate: TODAY }
    expect(projectedGap(seeded(), today, TODAY).kind).toBe('projected')
  })

  it('an emergency fund at ₦0.00 shows progress, not a failure', () => {
    const snapshot = seeded()
    snapshot.transactions = snapshot.transactions.filter(
      (t) => t.categoryId !== emergencyCategory.id,
    )
    const projection = projectedGap(snapshot, emergency, TODAY)

    expect(projection.kind).toBe('no-deadline')
    expect(projection.saved).toBe(0)
    expect(formatMoney(projection.remaining)).toBe('₦150,000.00')
  })
})
