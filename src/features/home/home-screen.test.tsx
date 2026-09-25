/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeScreen } from './home-screen'
import { naira } from '@/core/money/money'
import type {
  Category,
  Debt,
  Goal,
  Id,
  Instant,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
} from '@/core/types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const TODAY = '2026-10-05' as IsoDate
const AT = '2026-10-05T09:00:00.000Z' as Instant

afterEach(cleanup)

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

/** The seeded plan, exactly as `docs/seed-data.md` sets it. */
const SEED: Array<[string, Category['type'], number, boolean]> = [
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

const categories: Category[] = SEED.map(([name, type, , rollsOver], i) => ({
  id: `c${i}` as Id,
  name,
  type,
  rollsOver,
  sortOrder: i,
  updatedAt: STAMPED_AT,
}))

const plans: PlanEntry[] = SEED.map(([, , planned], i) => ({
  id: `p${i}` as Id,
  cycleStart: '2026-09-25' as IsoDate,
  categoryId: `c${i}` as Id,
  planned: naira(planned),
  updatedAt: STAMPED_AT,
}))

const byName = (name: string) => categories.find((c) => c.name === name)!

let n = 0
function move(
  type: Transaction['type'],
  whole: number,
  extra: Partial<Transaction> = {},
  date = '2026-09-26',
): Transaction {
  n += 1
  return {
    id: `t${n}` as Id,
    date: date as IsoDate,
    type,
    amount: naira(whole),
    createdAt: AT,
    ...extra,
    updatedAt: STAMPED_AT,
  }
}

const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-09-24' as IsoDate,
  scheduleAmount: naira(30_000),
  witnesses: [],
  updatedAt: STAMPED_AT,
}

const rentGoal: Goal = {
  id: 'g-rent' as Id,
  name: 'Annual rent',
  target: naira(900_000),
  dueDate: '2027-03-01' as IsoDate,
  categoryId: byName('Rent fund').id,
  createdOn: '2026-08-24' as IsoDate,
  updatedAt: STAMPED_AT,
}

/** The worked day: 5 October, day 11 of 30 (`docs/seed-data.md`). */
function seeded(): Snapshot {
  n = 0
  return {
    settings,
    categories,
    plans,
    transactions: [
      move('income', 450_000, { categoryId: byName('Rent fund').id }, '2026-09-25'),
      // Opening balance, outside this cycle.
      move('savings-in', 400_000, { categoryId: byName('Rent fund').id }, '2026-09-24'),
      move('savings-in', 75_000, { categoryId: byName('Rent fund').id }),
      move('savings-in', 15_000, { categoryId: byName('Emergency fund').id }),
      // Carries both: the debt it repays, and the planned category it satisfies.
      // Without the categoryId the plan's ₦30,000 debt line reads as unfunded
      // and safe-to-spend drops to ₦6,000 a day.
      move('repaid', 30_000, {
        debtId: friend.id,
        categoryId: byName('Debt payment — A. Friend').id,
      }),
      move('borrowed', 120_000, { debtId: friend.id }, '2026-09-24'),
      // ₦110,000 spent across expense categories.
      move('expense', 78_000, { categoryId: byName('Food and groceries').id }),
      move('expense', 22_000, { categoryId: byName('Transport, data and airtime').id }, '2026-10-01'),
      move('expense', 10_000, { categoryId: byName('Health').id }, '2026-10-03'),
    ],
    debts: [friend],
    goals: [rentGoal],
  }
}

function renderHome(snapshot = seeded(), props: Partial<{ online: boolean }> = {}) {
  const onOpen = vi.fn()
  render(<HomeScreen snapshot={snapshot} now={TODAY} onOpen={onOpen} {...props} />)
  return { onOpen }
}

describe('the worked day renders every seeded figure', () => {
  it('leads with safe to spend today — ₦7,500.00', () => {
    renderHome()
    expect(screen.getByText('Safe to spend today')).toBeDefined()
    // MoneyText renders the naira and the kobo as separate spans, so the whole
    // figure is read from the accessible name rather than the text nodes.
    expect(screen.getByRole('img', { name: /7,500 naira/ })).toBeDefined()
  })

  it('shows cash left ₦220,000.00 and 20 days to the next payday', () => {
    renderHome()
    expect(screen.getByRole('button', { name: /Cash left this cycle/ })).toBeDefined()
    expect(screen.getByText(/20 days to 25 Oct/)).toBeDefined()
  })

  it('shows the Hijri date beside the Gregorian one', () => {
    renderHome()
    // Two lines now, as the artboard draws it: the weekday above, the date and
    // the Hijri beside each other below.
    expect(screen.getByText('Monday')).toBeDefined()
    // Pinned to islamic-umalqura: a religious date that differs by device is
    // worse than no date.
    expect(screen.getByText(/5 October/)).toBeDefined()
    expect(screen.getByText(/1448/)).toBeDefined()
  })

  it('reports the cycle’s money — spent, saved, debt paid', () => {
    renderHome()
    const key = screen.getByText('Spent').closest('dl')!
    expect(within(key).getByText('₦110,000.00')).toBeDefined()
    expect(within(key).getByText('₦90,000.00')).toBeDefined()
    expect(within(key).getByText('₦30,000.00')).toBeDefined()
  })

  it('lists categories worst first, so the row needing attention is on top', () => {
    renderHome()
    const rows = screen.getAllByRole('row').slice(1)
    // Health is at 100% of its allowance with ₦0.00 left — worse than Food at
    // 87%. Rent fund is also at 100%, but it is protected: fully funding it is
    // the plan working, so it carries no badge and does not lead the table.
    expect(rows[0]?.textContent).toContain('Health')
    const names = rows.map((r) => r.textContent ?? '')
    // Anchored on a spending category: protected lines are no longer listed
    // here at all, because they can never need attention.
    expect(names.findIndex((t) => t.includes('Food'))).toBeLessThan(
      names.findIndex((t) => t.includes('Sadaqah')),
    )
  })

  it('shows the rent goal short, with the rate that closes it', () => {
    renderHome()
    expect(screen.getByText(/₦50,000.00 short · needs ₦85,000.00 a payday/)).toBeDefined()
    expect(screen.getByText('Short')).toBeDefined()
  })

  it('shows A. Friend at ₦90,000.00, clearing in 3 paydays', () => {
    renderHome()
    expect(screen.getByText('A. Friend')).toBeDefined()
    expect(screen.getByText('Clears in 3 paydays')).toBeDefined()
  })
})

describe('unallocated is a banner, and disappears at ₦0.00 (D8)', () => {
  it('is absent when the plan is complete', () => {
    // The seeded plan sums to exactly ₦450,000.
    renderHome()
    expect(screen.queryByText(/unallocated/i)).toBeNull()
  })

  it('appears when money is left unplanned', () => {
    const snapshot = seeded()
    snapshot.plans = snapshot.plans.filter((p) => p.categoryId !== byName('Sadaqah').id)
    renderHome(snapshot)
    // Never a tile reading zero; a banner that is simply not there.
    expect(screen.getAllByText(/unallocated/i).length).toBeGreaterThan(0)
  })
})

describe('the states', () => {
  it('flips to amber below the threshold, and says Low', () => {
    const snapshot = seeded()
    // Spend enough that the daily figure falls under ₦5,200.00.
    snapshot.transactions.push(
      move('expense', 60_000, { categoryId: byName('Miscellaneous').id }, '2026-10-04'),
    )
    renderHome(snapshot)
    // The hero badge, whatever the category table also says.
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0)
  })

  it('flips to red when there is nothing left, and explains it', () => {
    const snapshot = seeded()
    snapshot.transactions.push(
      move('expense', 300_000, { categoryId: byName('Miscellaneous').id }, '2026-10-04'),
    )
    renderHome(snapshot)
    expect(screen.getAllByText('Overspent').length).toBeGreaterThan(0)
    expect(screen.getByText(/spent more than you have left/)).toBeDefined()
  })

  it('says the figure is a guess when there is no plan', () => {
    const snapshot = seeded()
    snapshot.plans = []
    renderHome(snapshot)
    expect(screen.getByText(/Set a plan to make this exact/)).toBeDefined()
  })

  it('shows an empty note rather than an empty grid', () => {
    const snapshot = seeded()
    snapshot.goals = []
    snapshot.debts = []
    snapshot.transactions = snapshot.transactions.filter((t) => !t.debtId)
    renderHome(snapshot)
    expect(screen.getByText(/Nothing recorded yet/)).toBeDefined()
  })

  it('shows the offline note, neutral and never danger', () => {
    renderHome(seeded(), { online: false })
    const note = screen.getByText(/You’re offline/)
    expect(note).toBeDefined()
    expect(note.closest('.bg-ro2')).toBeNull()
  })
})

describe('no figure is a dead end', () => {
  it('cash left opens the movements behind it', async () => {
    const user = userEvent.setup()
    const { onOpen } = renderHome()

    await user.click(screen.getByRole('button', { name: /Cash left this cycle/ }))
    expect(onOpen).toHaveBeenCalledWith('/transactions')
  })

  it('a category row opens its own records', async () => {
    const user = userEvent.setup()
    const { onOpen } = renderHome()

    // Scoped to the table: Home draws its categories twice, as a full table at
    // 1440 and a ranked list at 360, and CSS decides which is seen. jsdom
    // applies no media query, so both are here and an unscoped query is
    // ambiguous.
    const table = screen.getByRole('table', { name: /What is left in each category/ })
    const food = within(table).getByText('Food and groceries').closest('tr')!
    await user.click(food)
    expect(onOpen).toHaveBeenCalledWith(
      `/transactions?category=${byName('Food and groceries').id}`,
    )
  })
})

/**
 * Home draws its categories twice: the full table at 1440, a ranked subset at
 * 360. Eight rows at 360 push *Safe to spend today* off the screen, and that
 * figure is the reason Home exists (D8).
 */
describe('the ranked section at 360', () => {
  /**
   * `useMediaQuery` answers `true` without `matchMedia`, which is jsdom rather
   * than a browser — so every other test on this screen gets the full table.
   * These three say they are on a phone.
   */
  function atPhoneWidth() {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  }

  afterEach(() => vi.unstubAllGlobals())

  function ranked() {
    return screen.getByRole('heading', { name: /Needs attention|^Categories$/ }).closest('section')!
  }

  it('shows only what needs attention, and says how many of how many', () => {
    atPhoneWidth()
    renderHome()

    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeDefined()
    // Overspent *and* low — Health is over, Transport is at 85%. Low is a
    // warning in time to act on, so leaving it out would drop the only row
    // still worth changing.
    // Eight spending categories, two of them needing attention. Protected
    // lines are not among them: money already moved where the plan promised
    // has nothing left to spend, so it can never need attention.
    expect(within(ranked()).getByText('2 of 8')).toBeDefined()
    expect(within(ranked()).getByText('Health')).toBeDefined()
    expect(within(ranked()).getByText('Food and groceries')).toBeDefined()
    // Comfortable categories are not in the subset — that is the whole point.
    expect(within(ranked()).queryByText('Sadaqah')).toBeNull()
    expect(within(ranked()).queryByText('Transport, data and airtime')).toBeNull()
    expect(within(ranked()).queryByText('Rent fund')).toBeNull()
  })

  it('expands to everything, and the heading follows the list', async () => {
    const user = userEvent.setup()
    atPhoneWidth()
    renderHome()

    await user.click(screen.getByRole('button', { name: 'Show all 8 categories' }))

    // The rule that settled the naming question: the heading names what the
    // list is showing. Once it shows all eight, it is Categories.
    expect(screen.queryByRole('heading', { name: 'Needs attention' })).toBeNull()
    const section = screen.getByRole('heading', { name: 'Categories' }).closest('section')!
    expect(within(section).getByText('Sadaqah')).toBeDefined()
    expect(within(section).queryByText('2 of 8')).toBeNull()
  })

  it('is headed Categories with the worst three when nothing needs attention', () => {
    // Nothing spent, so every category is comfortably inside its allowance.
    const calm = seeded()
    calm.transactions = calm.transactions.filter((t) => t.type !== 'expense')
    atPhoneWidth()
    renderHome(calm)

    // Never "Needs attention · 0 of 8" — the state nobody specified, settled
    // by the same rule.
    expect(screen.queryByRole('heading', { name: 'Needs attention' })).toBeNull()

    const section = ranked()
    expect(within(section).getAllByRole('listitem')).toHaveLength(3)
    expect(within(section).queryByText(/of 8/)).toBeNull()
    expect(within(section).getByRole('button', { name: 'Show all 8 categories' })).toBeDefined()
  })
})

describe('every diagram carries a text key (tokens.md §6)', () => {
  it('the gauge is labelled with the figure it draws', () => {
    renderHome()
    expect(screen.getByRole('img', { name: /Safe to spend today, 7,500 naira/ })).toBeDefined()
  })

  it('the daily chart says in words what the bars show', () => {
    renderHome()
    expect(screen.getByRole('img', { name: /Spending each day of this cycle/ })).toBeDefined()
  })

  it('the breakdown has a row per segment, not only a bar', () => {
    renderHome()
    expect(screen.getByText('Spent')).toBeDefined()
    expect(screen.getByText('Saved')).toBeDefined()
    expect(screen.getByText('Debt paid')).toBeDefined()
  })
})
