/**
 * @vitest-environment jsdom
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './routes'
import { StoreProvider } from './store-context'
import { TodayProvider } from './today-context'
import { createSnapshotStore } from '@/store/snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import { naira } from '@/core/money/money'
import type { ChangeNotifier, Repository } from '@/core/repository'
import type { Category, Id, Instant, IsoDate, PlanEntry, Settings, Snapshot } from '@/core/types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const TODAY = '2026-10-05' as IsoDate
const AT = '2026-10-05T09:00:00.000Z' as Instant

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  updatedAt: STAMPED_AT,
  zakat: {},
}

const rent: Category = {
  id: 'c-rent' as Id,
  name: 'Rent fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 0,
  updatedAt: STAMPED_AT,
}
const food: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 1,
  updatedAt: STAMPED_AT,
}
const transport: Category = {
  id: 'c-transport' as Id,
  name: 'Transport',
  type: 'expense',
  rollsOver: false,
  sortOrder: 2,
  updatedAt: STAMPED_AT,
}

function snapshotWith(plans: PlanEntry[], extra: Partial<Snapshot> = {}): Snapshot {
  return {
    settings,
    categories: [rent, food, transport],
    plans,
    transactions: [
      {
        id: 't1' as Id,
        date: '2026-09-25' as IsoDate,
        type: 'income',
        amount: naira(450_000),
        categoryId: rent.id,
        createdAt: AT,
        updatedAt: STAMPED_AT,
      },
    ],
    debts: [],
    goals: [],
    ...extra,
  }
}

function silentNotifier(): ChangeNotifier {
  return { announce: () => {}, subscribe: () => () => {} }
}

let db: MizaniyaDatabase
let repo: Repository
let dbCount = 0

beforeEach(async () => {
  dbCount += 1
  db = new MizaniyaDatabase(`mizaniya-plan-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
})

afterEach(async () => {
  cleanup()
  await db.delete()
})

function renderPlan(repository: Repository = repo) {
  const bundle = createSnapshotStore(repository, silentNotifier())
  render(
    <StoreProvider bundle={bundle}>
      <TodayProvider now={TODAY} at={AT}>
        <MemoryRouter initialEntries={['/plan']}>
        <AppRoutes />
      </MemoryRouter>
    </TodayProvider>
  </StoreProvider>,
  )
  return bundle.api
}

describe('unallocated is the whole feedback loop', () => {
  it('starts at the full take-home when nothing is planned', async () => {
    await repo.import(snapshotWith([]))
    renderPlan()

    await screen.findByRole('heading', { name: 'Plan' })
    // `Free`, not `Unallocated` — tokens.md §10. Home has always drawn Free
    // for this same quantity, so the two screens were naming one number two
    // ways, and Home's word is both plainer and the one seen more often.
    expect(screen.getByText('Free')).toBeDefined()
    // Two ₦450,000.00 on screen: the unallocated figure, and the take-home it
    // is measured against. The live region is the one that matters.
    expect(screen.getByText(/free, 450,000 naira/)).toBeDefined()
  })

  it('falls as rows are filled in, and each row autosaves on blur', async () => {
    await repo.import(snapshotWith([]))
    const user = userEvent.setup()
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    const rentInput = screen.getByLabelText('Rent fund amount')
    await user.click(rentInput)
    await user.keyboard('75000')
    // No Save button anywhere: blur is the commit.
    await user.tab()

    await waitFor(() => expect(screen.getByText('₦375,000.00')).toBeDefined())
    await waitFor(async () => expect(await repo.plans.listByCycle('2026-09-25' as IsoDate)).toHaveLength(1))
  })

  it('has no Save button at all', async () => {
    await repo.import(snapshotWith([]))
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('turns to the danger colour only when more is promised than exists', async () => {
    await repo.import(
      snapshotWith([
        {
          id: 'p1' as Id,
          cycleStart: '2026-09-25' as IsoDate,
          categoryId: rent.id,
          planned: naira(500_000),
          updatedAt: STAMPED_AT,
        },
      ]),
    )
    renderPlan()

    expect(await screen.findByText('Over-allocated')).toBeDefined()
    expect(screen.getByText(/given jobs to more money than you have/)).toBeDefined()
  })
})

describe('a rejected row', () => {
  it('keeps the typed figure and does NOT move unallocated', async () => {
    await repo.import(snapshotWith([]))
    const failing: Repository = {
      ...repo,
      plans: {
        ...repo.plans,
        put: async () => {
          throw new Error('Storage is full.')
        },
      },
    }
    const user = userEvent.setup()
    renderPlan(failing)
    await screen.findByRole('heading', { name: 'Plan' })

    const before = screen.getByText('₦450,000.00')
    expect(before).toBeDefined()

    const rentInput = screen.getByLabelText('Rent fund amount')
    await user.click(rentInput)
    await user.keyboard('75000')
    await user.tab()

    expect(await screen.findByText(/Couldn’t save that|Couldn't save that/)).toBeDefined()

    // The figure the owner typed is still there…
    expect(rentInput).toHaveProperty('value', '75000')
    // …and the running total has not moved, because memory was never touched.
    expect(screen.getByText('₦450,000.00')).toBeDefined()
    expect(screen.queryByText('₦375,000.00')).toBeNull()
  })

  it('offers Try again on the row that failed', async () => {
    await repo.import(snapshotWith([]))
    const failing: Repository = {
      ...repo,
      plans: { ...repo.plans, put: async () => { throw new Error('Storage is full.') } },
    }
    const user = userEvent.setup()
    renderPlan(failing)
    await screen.findByRole('heading', { name: 'Plan' })

    await user.click(screen.getByLabelText('Food and groceries amount'))
    await user.keyboard('90000')
    await user.tab()

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeDefined()
  })
})

describe('copy last cycle', () => {
  it('is disabled with a reason when there is no previous cycle', async () => {
    await repo.import(snapshotWith([]))
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    const button = screen.getByRole('button', { name: 'Copy last cycle' })
    expect(button).toHaveProperty('disabled', true)
    // Never silently inert: a dead button with no explanation is a bug the
    // owner cannot report.
    expect(screen.getByText('There is no previous cycle yet.')).toBeDefined()
  })

  it('fills the empty rows from last cycle', async () => {
    await repo.import(
      snapshotWith([
        {
          id: 'p-old-1' as Id,
          cycleStart: '2026-08-25' as IsoDate,
          categoryId: rent.id,
          planned: naira(75_000),
          updatedAt: STAMPED_AT,
        },
        {
          id: 'p-old-2' as Id,
          cycleStart: '2026-08-25' as IsoDate,
          categoryId: food.id,
          planned: naira(90_000),
          updatedAt: STAMPED_AT,
        },
      ]),
    )
    const user = userEvent.setup()
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    await user.click(screen.getByRole('button', { name: 'Copy last cycle' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Rent fund amount')).toHaveProperty('value', '75000')
    })
    expect(screen.getByLabelText('Food and groceries amount')).toHaveProperty('value', '90000')
  })

  it('never overwrites a figure already typed this cycle', async () => {
    await repo.import(
      snapshotWith([
        {
          id: 'p-old' as Id,
          cycleStart: '2026-08-25' as IsoDate,
          categoryId: rent.id,
          planned: naira(75_000),
          updatedAt: STAMPED_AT,
        },
        {
          id: 'p-now' as Id,
          cycleStart: '2026-09-25' as IsoDate,
          categoryId: rent.id,
          planned: naira(20_000),
          updatedAt: STAMPED_AT,
        },
      ]),
    )
    const user = userEvent.setup()
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    await user.click(screen.getByRole('button', { name: 'Copy last cycle' }))

    // Deliberate work is not undone by one tap, and there is no undo here.
    await waitFor(() =>
      expect(screen.getByText('Last cycle had nothing to copy.')).toBeDefined(),
    )
    expect(screen.getByLabelText('Rent fund amount')).toHaveProperty('value', '20000')
  })
})

describe('what a row shows', () => {
  it('marks a protected category, so it is not invisible state', async () => {
    await repo.import(snapshotWith([]))
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    const rentRow = screen.getByText('Rent fund').closest('div')!
    // Protection changes the app's headline figure; hiding it in a menu would
    // make that invisible.
    expect(within(rentRow).getByText('Protected')).toBeDefined()
  })

  it('marks a rolling category', async () => {
    await repo.import(snapshotWith([]))
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    const foodRow = screen.getByText('Food and groceries').closest('div')!
    expect(within(foodRow).getByText('Rolls over')).toBeDefined()
  })

  it('shows the planned daily allowance as a footnote', async () => {
    await repo.import(
      snapshotWith([
        {
          id: 'p1' as Id,
          cycleStart: '2026-09-25' as IsoDate,
          categoryId: food.id,
          planned: naira(90_000),
          updatedAt: STAMPED_AT,
        },
      ]),
    )
    renderPlan()
    await screen.findByRole('heading', { name: 'Plan' })

    // ₦90,000 spendable ÷ 30 days, floored.
    expect(screen.getByText(/Planned daily allowance ₦3,000\.00/)).toBeDefined()
  })
})
