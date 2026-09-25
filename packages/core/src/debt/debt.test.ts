import { describe, expect, it } from 'vitest'
import {
  amountOwed,
  balanceOf,
  debtMovements,
  debtsByDirection,
  directionOf,
  lastMovement,
  paydaysToClear,
  summarise,
} from './debt'
import { cashLeft, cycleAt } from '../budget/budget'
import { formatMoney, naira, speakMoney } from '../money/money'
import type { Debt, Id, Instant, IsoDate, Settings, Snapshot, Transaction } from '../types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const TODAY = '2026-10-05' as IsoDate

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

/** The three counterparties `docs/seed-data.md` names. */
const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-07-01' as IsoDate,
  scheduleAmount: naira(30_000),
  terms: '₦30,000 monthly until cleared',
  witnesses: [],
  updatedAt: STAMPED_AT,
}

const spouse: Debt = {
  id: 'd-spouse' as Id,
  counterpartyName: 'Spouse',
  openedOn: '2026-07-01' as IsoDate,
  witnesses: [],
  updatedAt: STAMPED_AT,
}

const colleague: Debt = {
  id: 'd-colleague' as Id,
  counterpartyName: 'B. Colleague',
  openedOn: '2026-08-10' as IsoDate,
  witnesses: [],
  updatedAt: STAMPED_AT,
}

/** An ajo counterparty — one record, both directions over its life (D9). */
const ajo: Debt = {
  id: 'd-ajo' as Id,
  counterpartyName: 'Ajo group',
  openedOn: '2026-06-01' as IsoDate,
  witnesses: ['Witness One'],
  updatedAt: STAMPED_AT,
}

let nextId = 0
function movement(
  debtId: Id,
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
    debtId,
    createdAt: `${date}T09:00:00.000Z` as Instant,
    updatedAt: STAMPED_AT,
  }
}

function snapshotOf(transactions: Transaction[], debts: Debt[] = []): Snapshot {
  return { settings, categories: [], plans: [], transactions, debts, goals: [] }
}

describe('balanceOf — the sign is the direction', () => {
  it('A. Friend is ₦120,000.00 owed, and ₦90,000.00 after one repayment', () => {
    const opening = snapshotOf([movement(friend.id, 'borrowed', 120_000, '2026-07-01')])
    expect(formatMoney(balanceOf(opening, friend.id))).toBe('₦120,000.00')

    const afterRepayment = snapshotOf([
      movement(friend.id, 'borrowed', 120_000, '2026-07-01'),
      movement(friend.id, 'repaid', 30_000, '2026-09-26'),
    ])
    expect(formatMoney(balanceOf(afterRepayment, friend.id))).toBe('₦90,000.00')
    expect(directionOf(balanceOf(afterRepayment, friend.id))).toBe('you-owe')
  })

  it('Spouse is ₦60,000.00 owed, with no schedule', () => {
    const snapshot = snapshotOf([movement(spouse.id, 'borrowed', 60_000, '2026-07-01')])
    expect(formatMoney(balanceOf(snapshot, spouse.id))).toBe('₦60,000.00')
  })

  it('B. Colleague is negative — ₦40,000.00 owed to the owner', () => {
    const snapshot = snapshotOf([movement(colleague.id, 'lent', 40_000, '2026-08-10')])
    const balance = balanceOf(snapshot, colleague.id)

    expect(balance).toBe(naira(-40_000))
    expect(directionOf(balance)).toBe('owed-to-you')
    // Shown without a sign; the word carries the direction (page specs §8).
    expect(formatMoney(amountOwed(balance))).toBe('₦40,000.00')
  })

  it('a repayment received moves the balance back toward zero, not past it', () => {
    const snapshot = snapshotOf([
      movement(colleague.id, 'lent', 40_000, '2026-08-10'),
      movement(colleague.id, 'repayment-received', 15_000, '2026-09-28'),
    ])
    expect(formatMoney(amountOwed(balanceOf(snapshot, colleague.id)))).toBe('₦25,000.00')
    expect(directionOf(balanceOf(snapshot, colleague.id))).toBe('owed-to-you')
  })

  it('a debt with no movements is settled, and settled is its own state', () => {
    const snapshot = snapshotOf([])
    expect(balanceOf(snapshot, friend.id)).toBe(0)
    expect(directionOf(balanceOf(snapshot, friend.id))).toBe('settled')
  })

  it('ignores movements naming a debt that does not exist', () => {
    const snapshot = snapshotOf([movement('d-ghost' as Id, 'borrowed', 5_000, '2026-09-01')])
    expect(balanceOf(snapshot, friend.id)).toBe(0)
  })
})

describe('the ajo round trip — one record, through zero', () => {
  /**
   * Four months of a rotating ajo. The owner contributes ₦20,000 a month before
   * their turn (the money goes to whoever collects, so it is lent), then
   * collects the pot, which they now owe back over the remaining months.
   */
  const round = snapshotOf(
    [
      movement(ajo.id, 'lent', 20_000, '2026-06-01'),
      movement(ajo.id, 'lent', 20_000, '2026-07-01'),
      // The owner's turn: they collect ₦80,000 from the group.
      movement(ajo.id, 'borrowed', 80_000, '2026-08-01'),
      movement(ajo.id, 'repaid', 20_000, '2026-09-01'),
    ],
    [ajo],
  )

  it('is owed to the owner before their turn', () => {
    const before = snapshotOf([
      movement(ajo.id, 'lent', 20_000, '2026-06-01'),
      movement(ajo.id, 'lent', 20_000, '2026-07-01'),
    ])
    expect(directionOf(balanceOf(before, ajo.id))).toBe('owed-to-you')
    expect(formatMoney(amountOwed(balanceOf(before, ajo.id)))).toBe('₦40,000.00')
  })

  it('crosses zero at the payout without being split in two', () => {
    // −40,000 + 80,000 = +40,000. One record, one sum, no special case.
    const atPayout = snapshotOf([
      movement(ajo.id, 'lent', 20_000, '2026-06-01'),
      movement(ajo.id, 'lent', 20_000, '2026-07-01'),
      movement(ajo.id, 'borrowed', 80_000, '2026-08-01'),
    ])
    expect(directionOf(balanceOf(atPayout, ajo.id))).toBe('you-owe')
    expect(formatMoney(balanceOf(atPayout, ajo.id))).toBe('₦40,000.00')
  })

  it('lands exactly on zero when the round completes, and reports settled', () => {
    // −20 −20 +80 −20 = +20 outstanding; one more repayment closes it.
    expect(formatMoney(balanceOf(round, ajo.id))).toBe('₦20,000.00')

    const closed = snapshotOf(
      [...round.transactions, movement(ajo.id, 'repaid', 20_000, '2026-10-01')],
      [ajo],
    )
    expect(balanceOf(closed, ajo.id)).toBe(0)
    expect(directionOf(balanceOf(closed, ajo.id))).toBe('settled')
  })

  it('moves between groups as it crosses, and is one record in both', () => {
    const before = snapshotOf(
      [
        movement(ajo.id, 'lent', 20_000, '2026-06-01'),
        movement(ajo.id, 'lent', 20_000, '2026-07-01'),
      ],
      [ajo],
    )
    const beforeGroups = debtsByDirection(before, TODAY)
    expect(beforeGroups['owed-to-you'].map((s) => s.debt.id)).toEqual([ajo.id])
    expect(beforeGroups['you-owe']).toHaveLength(0)

    const afterGroups = debtsByDirection(round, TODAY)
    expect(afterGroups['you-owe'].map((s) => s.debt.id)).toEqual([ajo.id])
    expect(afterGroups['owed-to-you']).toHaveLength(0)
  })
})

describe('paydaysToClear', () => {
  it('A. Friend clears in 3 paydays on ₦30,000 a month (page specs §7.6)', () => {
    const snapshot = snapshotOf(
      [
        movement(friend.id, 'borrowed', 120_000, '2026-07-01'),
        movement(friend.id, 'repaid', 30_000, '2026-09-26'),
      ],
      [friend],
    )
    const projection = paydaysToClear(snapshot, friend, TODAY)

    expect(projection.kind).toBe('scheduled')
    if (projection.kind !== 'scheduled') throw new Error('expected a scheduled projection')
    expect(projection.paydays).toBe(3)
    // Three paydays on from 5 October: 25 Oct, 25 Nov, 25 Dec.
    expect(projection.clearsOn).toBe('2026-12-25')
  })

  it('rounds up, because a payment that leaves a remainder has cleared nothing', () => {
    const snapshot = snapshotOf([movement(friend.id, 'borrowed', 95_000, '2026-07-01')], [friend])
    const projection = paydaysToClear(snapshot, friend, TODAY)

    if (projection.kind !== 'scheduled') throw new Error('expected a scheduled projection')
    // 95,000 ÷ 30,000 is 3.17. Three paydays leave ₦5,000 outstanding.
    expect(projection.paydays).toBe(4)
  })

  it('says no-schedule rather than guessing, when there is no agreed amount', () => {
    const snapshot = snapshotOf([movement(spouse.id, 'borrowed', 60_000, '2026-07-01')], [spouse])
    expect(paydaysToClear(snapshot, spouse, TODAY).kind).toBe('no-schedule')
  })

  it('never projects a repayment the owner does not control', () => {
    const snapshot = snapshotOf([movement(colleague.id, 'lent', 40_000, '2026-08-10')], [colleague])
    // A schedule describes what the owner pays. Nothing predicts when someone
    // else pays them back, and the app must not imply that it can (D3).
    expect(paydaysToClear(snapshot, colleague, TODAY).kind).toBe('owed-to-you')
  })

  it('reports settled for a cleared debt rather than zero paydays', () => {
    const snapshot = snapshotOf(
      [
        movement(friend.id, 'borrowed', 30_000, '2026-07-01'),
        movement(friend.id, 'repaid', 30_000, '2026-09-26'),
      ],
      [friend],
    )
    expect(paydaysToClear(snapshot, friend, TODAY).kind).toBe('settled')
  })
})

describe('D3 — money owed to the owner counts toward nothing', () => {
  it('a debt owed to the owner never reaches cash left', () => {
    const lentOut = movement(colleague.id, 'lent', 40_000, '2026-09-26')
    const withDebt = snapshotOf([lentOut], [colleague])
    const left = cashLeft(withDebt, cycleAt(withDebt, TODAY))

    // Lending is an outflow: the money genuinely left the account.
    expect(left).toBe(naira(-40_000))
    // And it is spoken as a word, never as a bare minus sign (page specs §8).
    expect(speakMoney(left)).toBe('40,000 naira over')

    // The ₦40,000 they owe back adds nothing until it actually arrives.
    expect(directionOf(balanceOf(withDebt, colleague.id))).toBe('owed-to-you')
  })

  it('cash left moves only when the repayment actually arrives', () => {
    const arrived = snapshotOf(
      [
        movement(colleague.id, 'lent', 40_000, '2026-09-26'),
        movement(colleague.id, 'repayment-received', 40_000, '2026-09-30'),
      ],
      [colleague],
    )
    expect(cashLeft(arrived, cycleAt(arrived, TODAY))).toBe(0)
    expect(directionOf(balanceOf(arrived, colleague.id))).toBe('settled')
  })
})

describe('the card', () => {
  it('summarises what §7.6 prints, with the figure unsigned', () => {
    const snapshot = snapshotOf(
      [
        movement(friend.id, 'borrowed', 120_000, '2026-07-01'),
        movement(friend.id, 'repaid', 30_000, '2026-09-26'),
      ],
      [friend],
    )
    const card = summarise(snapshot, friend, TODAY)

    expect(card.direction).toBe('you-owe')
    expect(formatMoney(card.owed)).toBe('₦90,000.00')
    expect(card.lastMovement?.date).toBe('2026-09-26')
  })

  it('orders movements oldest first, whatever order they were recorded in', () => {
    const snapshot = snapshotOf([
      movement(friend.id, 'repaid', 30_000, '2026-09-26'),
      movement(friend.id, 'borrowed', 120_000, '2026-07-01'),
    ])
    expect(debtMovements(snapshot, friend.id).map((t) => t.date)).toEqual([
      '2026-07-01',
      '2026-09-26',
    ])
    expect(lastMovement(snapshot, friend.id)?.date).toBe('2026-09-26')
  })
})
