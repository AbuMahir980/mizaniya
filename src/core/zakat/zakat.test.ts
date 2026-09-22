/**
 * WHAT: The zakat estimate, pinned to the seeded scenario — which is
 *       deliberately the **below-nisab** case — and to both above-nisab
 *       variants, ₦62,250.00 and ₦63,250.00.
 * WHY:  The seeded state is the one the owner will actually be in, and the one
 *       most likely to be got wrong: an app that always shows a figure will
 *       happily show one when none is due.
 * INTERVIEW: I tested that the app stays silent when nothing is owed, because
 *           that is the case a happy-path test would never have caught.
 */

import { describe, expect, it } from 'vitest'
import { estimate, hawlStart, receivables, zakatDue, zakatableSavings } from './zakat'
import { formatMoney, naira } from '../money/money'
import type {
  Category,
  Debt,
  Id,
  Instant,
  IsoDate,
  Kobo,
  Settings,
  Snapshot,
  Transaction,
} from '../types'

/** The hawl start the owner gave: 16 June 2026, 1 Muharram 1448. */
const HAWL_START = '2026-06-16' as IsoDate

/** The nisab as the owner entered it — **invented**, never a reference value. */
const NISAB = naira(2_450_000)

const baseSettings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: { hawlStart: HAWL_START, nisab: NISAB },
}

const rent: Category = {
  id: 'c-rent' as Id,
  name: 'Rent fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 0,
}
const emergency: Category = {
  id: 'c-emergency' as Id,
  name: 'Emergency fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 1,
}
const personal: Category = {
  id: 'c-personal' as Id,
  name: 'Personal savings',
  type: 'savings',
  rollsOver: false,
  sortOrder: 2,
}
const food: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 3,
}

const colleague: Debt = {
  id: 'd-colleague' as Id,
  counterpartyName: 'B. Colleague',
  openedOn: '2026-08-10' as IsoDate,
  witnesses: [],
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

function debtMove(type: Transaction['type'], whole: number, date: string): Transaction {
  nextId += 1
  return {
    id: `t${nextId}` as Id,
    date: date as IsoDate,
    type,
    amount: naira(whole),
    debtId: colleague.id,
    createdAt: `${date}T09:00:00.000Z` as Instant,
  }
}

/**
 * The seeded state on 5 October: rent ₦475,000, emergency ₦15,000, personal ₦0,
 * and ₦40,000 owed to the owner by B. Colleague.
 */
function seeded(overrides: Partial<Settings['zakat']> = {}): Snapshot {
  return {
    settings: { ...baseSettings, zakat: { ...baseSettings.zakat, ...overrides } },
    categories: [rent, emergency, personal, food],
    plans: [],
    transactions: [
      move(rent.id, 'savings-in', 400_000, '2026-09-24'),
      move(rent.id, 'savings-in', 75_000, '2026-09-26'),
      move(emergency.id, 'savings-in', 15_000, '2026-09-26'),
      move(food.id, 'expense', 78_000, '2026-09-28'),
      debtMove('lent', 40_000, '2026-09-24'),
    ],
    debts: [colleague],
    goals: [],
  }
}

/** The above-nisab variant: personal savings has reached ₦2,000,000. */
function aboveNisab(overrides: Partial<Settings['zakat']> = {}): Snapshot {
  const snapshot = seeded(overrides)
  snapshot.transactions.push(move(personal.id, 'savings-in', 2_000_000, '2026-09-30'))
  return snapshot
}

describe('zakatableSavings — a balance, and only savings', () => {
  it('is ₦490,000.00 on 5 October (seed-data)', () => {
    // rent 475,000 + emergency 15,000 + personal 0
    expect(formatMoney(zakatableSavings(seeded()))).toBe('₦490,000.00')
  })

  it('ignores expense movements entirely', () => {
    const snapshot = seeded()
    snapshot.transactions.push(move(food.id, 'expense', 50_000, '2026-10-01'))
    expect(formatMoney(zakatableSavings(snapshot))).toBe('₦490,000.00')
  })

  it('subtracts money taken back out of savings', () => {
    const snapshot = seeded()
    snapshot.transactions.push(move(rent.id, 'savings-out', 90_000, '2026-10-02'))
    expect(formatMoney(zakatableSavings(snapshot))).toBe('₦400,000.00')
  })

  it('counts wealth held before the hawl opened — it is still held today', () => {
    const snapshot = seeded()
    snapshot.transactions.push(move(personal.id, 'savings-in', 10_000, '2026-01-01'))
    expect(formatMoney(zakatableSavings(snapshot))).toBe('₦500,000.00')
  })
})

describe('the seeded case is below the nisab, and shows no figure', () => {
  it('reports below-nisab rather than an estimate (seed-data)', () => {
    const result = estimate(seeded())

    expect(result.kind).toBe('below-nisab')
    if (result.kind !== 'below-nisab') throw new Error('expected below-nisab')

    expect(formatMoney(result.zakatable)).toBe('₦490,000.00')
    expect(formatMoney(result.nisab)).toBe('₦2,450,000.00')
    // There is no estimate on this variant at all — not an estimate of zero.
    expect('estimate' in result).toBe(false)
  })
})

describe('above the nisab', () => {
  it('estimates ₦62,250.00 with receivables excluded (seed-data)', () => {
    const result = estimate(aboveNisab({ includeReceivables: false }))

    expect(result.kind).toBe('due')
    if (result.kind !== 'due') throw new Error('expected a figure')

    // 475,000 + 15,000 + 2,000,000 = 2,490,000; 2.5% of that.
    expect(formatMoney(result.zakatable)).toBe('₦2,490,000.00')
    expect(formatMoney(result.estimate)).toBe('₦62,250.00')
  })

  it('estimates ₦63,250.00 with receivables included (seed-data)', () => {
    const result = estimate(aboveNisab({ includeReceivables: true }))

    if (result.kind !== 'due') throw new Error('expected a figure')
    // 2,490,000 + 40,000 owed by B. Colleague.
    expect(formatMoney(result.zakatable)).toBe('₦2,530,000.00')
    expect(formatMoney(result.estimate)).toBe('₦63,250.00')
  })

  it('excludes receivables while the question is unanswered', () => {
    // Not asked is not the same as included. The panel asks; it does not assume.
    const result = estimate(aboveNisab())

    if (result.kind !== 'due') throw new Error('expected a figure')
    expect(result.receivables.kind).toBe('not-asked')
    expect(formatMoney(result.receivables.amount)).toBe('₦40,000.00')
    expect(formatMoney(result.zakatable)).toBe('₦2,490,000.00')
  })

  it('treats reaching the nisab exactly as due', () => {
    const snapshot = seeded({ nisab: naira(490_000) })
    expect(estimate(snapshot).kind).toBe('due')
  })
})

describe('zakatDue rounds up, because it is an obligation', () => {
  it('is 2.5% exactly when the amount divides', () => {
    expect(formatMoney(zakatDue(naira(2_490_000)))).toBe('₦62,250.00')
  })

  it('rounds up rather than down when it does not divide', () => {
    // 1 kobo ÷ 40 is 0.025 of a kobo. Flooring would report nothing owed;
    // understating an obligation is the unsafe direction here (D3).
    expect(zakatDue(1 as Kobo)).toBe(1)
  })

  it('rounds a fractional kobo up, not to the nearest', () => {
    // ₦1,000.01 = 100,001 kobo; ÷ 40 = 2,500.025 → 2,501 kobo.
    expect(formatMoney(zakatDue(100_001 as Kobo))).toBe('₦25.01')
  })
})

describe('no nisab is not ₦0.00', () => {
  it('reports what is missing and carries no estimate at all', () => {
    const snapshot = seeded()
    delete snapshot.settings.zakat.nisab
    const result = estimate(snapshot)

    expect(result.kind).toBe('no-nisab')
    // Zero is a figure. "We do not know" is not, and they must not look alike.
    expect('estimate' in result).toBe(false)
    expect('nisab' in result).toBe(false)
    // The workings are still shown, so the owner can see what was counted.
    expect(formatMoney(result.savings)).toBe('₦490,000.00')
  })

  it('withholds the figure even when savings are plainly large', () => {
    const snapshot = aboveNisab({ includeReceivables: true })
    delete snapshot.settings.zakat.nisab
    expect(estimate(snapshot).kind).toBe('no-nisab')
  })
})

describe('the hawl is asked for, never assumed (D6)', () => {
  it('uses the date the owner gave', () => {
    expect(hawlStart(seeded())).toEqual({ kind: 'set', date: HAWL_START })
  })

  it('falls back to the first record, and says that is what it did', () => {
    const snapshot = seeded()
    delete snapshot.settings.zakat.hawlStart
    const hawl = hawlStart(snapshot)

    expect(hawl.kind).toBe('fallback')
    if (hawl.kind !== 'fallback') throw new Error('expected a fallback')
    // The earliest movement, whatever order they were recorded in.
    expect(hawl.date).toBe('2026-09-24')
  })

  it('has nothing to fall back to on a fresh install', () => {
    const snapshot = seeded()
    delete snapshot.settings.zakat.hawlStart
    snapshot.transactions = []
    expect(hawlStart(snapshot)).toEqual({ kind: 'none' })
  })

  it('carries the hawl into the estimate, so the panel can show its source', () => {
    const snapshot = seeded()
    delete snapshot.settings.zakat.hawlStart
    expect(estimate(snapshot).hawl.kind).toBe('fallback')
  })
})

describe('receivables', () => {
  it('counts only what is owed to the owner, never what they owe', () => {
    const snapshot = seeded()
    snapshot.debts = [colleague, { ...colleague, id: 'd-friend' as Id }]
    snapshot.transactions.push({
      ...debtMove('borrowed', 120_000, '2026-09-24'),
      debtId: 'd-friend' as Id,
    })

    const owed = receivables(snapshot)
    // The ₦120,000 the owner borrowed is not an asset.
    expect(formatMoney(owed.amount)).toBe('₦40,000.00')
  })

  it('is ₦0.00 and still unanswered when nobody owes the owner anything', () => {
    const snapshot = seeded()
    snapshot.debts = []
    snapshot.transactions = snapshot.transactions.filter((t) => !t.debtId)

    const owed = receivables(snapshot)
    expect(owed.kind).toBe('not-asked')
    expect(owed.amount).toBe(0)
  })
})
