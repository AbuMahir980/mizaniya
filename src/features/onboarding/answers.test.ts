/**
 * WHAT: The answers-to-snapshot conversion, and above all **the date an opening
 *       balance carries**.
 * WHY:  Dating them today would put a lifetime of savings inside the running
 *       cycle, and Home's Saved tile would read ₦490,000.00 instead of
 *       ₦90,000.00. The figure looks entirely plausible; nothing would flag it.
 *       That is the whole reason this is a pure function with its own test.
 * INTERVIEW: I isolated the one rule that fails silently into a pure function,
 *       so it is tested with plain values rather than through six form screens.
 */

import { describe, expect, it } from 'vitest'
import { buildSnapshot, emptyAnswers, starterCategories, type OnboardingAnswers } from './answers'
import { cycleFor } from '@/core/cycle/cycle'
import { totalMoved, cycleAt } from '@/core/budget/budget'
import { balanceOf, directionOf } from '@/core/debt/debt'
import { formatMoney, naira } from '@/core/money/money'
import type { Id, Instant, IsoDate } from '@/core/types'

const TODAY = '2026-10-05' as IsoDate
const AT = '2026-10-05T09:00:00.000Z' as Instant

let n = 0
const makeId = () => `id-${(n += 1)}`

function answersFor(): OnboardingAnswers {
  n = 0
  const base = emptyAnswers(makeId)
  const rent = base.categories.find((c) => c.name === 'Rent fund')!
  const emergency = base.categories.find((c) => c.name === 'Emergency fund')!

  return {
    ...base,
    ownerName: 'The owner',
    salaryDay: 25,
    takeHome: naira(450_000),
    openingBalances: { [rent.id]: naira(400_000), [emergency.id]: naira(0) },
    debts: [
      {
        counterpartyName: 'A. Friend',
        direction: 'i-owe',
        amount: naira(120_000),
        scheduleAmount: naira(30_000),
      },
      { counterpartyName: 'B. Colleague', direction: 'owed-to-me', amount: naira(40_000) },
    ],
    rent: { target: naira(900_000), dueDate: '2027-03-01' as IsoDate },
  }
}

const ctx = () => ({ now: TODAY, at: AT, makeId })

describe('opening balances are dated the day before the cycle begins', () => {
  it('dates them 24 September, not today', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const opening = snapshot.transactions.filter((t) => t.note === 'Opening balance')

    // The cycle running on 5 October began on 25 September.
    expect(cycleFor(snapshot.settings, TODAY).start).toBe('2026-09-25')
    for (const t of opening) expect(t.date).toBe('2026-09-24')
  })

  it('so this cycle’s Saved figure is not inflated by a lifetime of saving', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const cycle = cycleAt(snapshot, TODAY)

    // ₦400,000 was put aside before the app existed. None of it is this cycle's.
    expect(totalMoved(snapshot, cycle, ['savings-in'])).toBe(0)
  })

  it('and dating them today would have inflated it — the failure, demonstrated', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const misdated = {
      ...snapshot,
      transactions: snapshot.transactions.map((t) =>
        t.note === 'Opening balance' && t.type === 'savings-in' ? { ...t, date: TODAY } : t,
      ),
    }

    // Plausible, wrong, and nothing in the app would flag it.
    expect(formatMoney(totalMoved(misdated, cycleAt(misdated, TODAY), ['savings-in']))).toBe(
      '₦400,000.00',
    )
  })

  it('records nothing at all for a category left empty or at zero', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const savingsIn = snapshot.transactions.filter((t) => t.type === 'savings-in')

    // Emergency fund was answered ₦0: nothing to record, not a ₦0 record.
    expect(savingsIn).toHaveLength(1)
  })
})

describe('debts are entered in both directions and stored as movements (D9)', () => {
  it('turns “I owe” into a borrowed movement, positive balance', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const friend = snapshot.debts.find((d) => d.counterpartyName === 'A. Friend')!

    expect(formatMoney(balanceOf(snapshot, friend.id))).toBe('₦120,000.00')
    expect(directionOf(balanceOf(snapshot, friend.id))).toBe('you-owe')
    expect(friend.scheduleAmount).toBe(naira(30_000))
  })

  it('turns “owed to me” into a lent movement, negative balance', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const colleague = snapshot.debts.find((d) => d.counterpartyName === 'B. Colleague')!

    expect(directionOf(balanceOf(snapshot, colleague.id))).toBe('owed-to-you')
  })

  it('stores no direction field on the debt itself', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    for (const debt of snapshot.debts) {
      expect('direction' in debt).toBe(false)
    }
  })
})

describe('settings, categories and the rent goal', () => {
  it('keeps the owner’s name only when they gave one', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    expect(snapshot.settings.ownerName).toBe('The owner')

    const anonymous = buildSnapshot({ ...answersFor(), ownerName: undefined }, ctx())
    expect('ownerName' in anonymous.settings).toBe(false)
  })

  it('carries the salary day and take-home from step 2', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    expect(snapshot.settings.salaryDay).toBe(25)
    expect(formatMoney(snapshot.settings.takeHome)).toBe('₦450,000.00')
  })

  it('writes no plan — a plan is the owner’s to make', () => {
    // Pre-filling one would put figures on their screen they never chose.
    expect(buildSnapshot(answersFor(), ctx()).plans).toEqual([])
  })

  it('attaches the rent goal to the rent fund category', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const goal = snapshot.goals[0]!
    const rent = snapshot.categories.find((c) => c.name === 'Rent fund')!

    expect(goal.target).toBe(naira(900_000))
    expect(goal.dueDate).toBe('2027-03-01')
    expect(goal.categoryId).toBe(rent.id)
  })

  it('makes no goal when step 6 was skipped', () => {
    const snapshot = buildSnapshot({ ...answersFor(), rent: undefined }, ctx())
    expect(snapshot.goals).toEqual([])
  })

  it('starts from the eleven starter categories', () => {
    const categories = starterCategories(makeId)
    expect(categories).toHaveLength(11)
    // Food rolls over; nothing else does (D2, seed-data).
    expect(categories.filter((c) => c.rollsOver).map((c) => c.name)).toEqual([
      'Food and groceries',
    ])
  })
})

describe('only step 2 is required', () => {
  it('builds a usable snapshot from the salary day and take-home alone', () => {
    n = 0
    const minimal = emptyAnswers(makeId)
    const snapshot = buildSnapshot({ ...minimal, takeHome: naira(450_000) }, ctx())

    expect(snapshot.settings.takeHome).toBe(naira(450_000))
    expect(snapshot.transactions).toEqual([])
    expect(snapshot.debts).toEqual([])
    expect(snapshot.goals).toEqual([])
    // And it is a real Home, not an empty one: the cycle is known.
    expect(cycleAt(snapshot, TODAY).start).toBe('2026-09-25')
  })
})

describe('ids are unique across everything it creates', () => {
  it('never reuses an id between a debt and its opening movement', () => {
    const snapshot = buildSnapshot(answersFor(), ctx())
    const ids = [
      ...snapshot.categories.map((c) => c.id),
      ...snapshot.transactions.map((t) => t.id),
      ...snapshot.debts.map((d) => d.id),
      ...snapshot.goals.map((g) => g.id),
    ] as Id[]

    expect(new Set(ids).size).toBe(ids.length)
  })
})
