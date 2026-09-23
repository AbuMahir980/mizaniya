/**
 * @vitest-environment jsdom
 *
 * WHAT: The whole Quick Add flow — ⊕, a chip, Save — through the real store and
 *       a real IndexedDB.
 * WHY:  **Three taps plus the amount** is the acceptance criterion and the
 *       reason the bottom bar is shaped the way it is. Counting them in a test
 *       is the only way that claim stays true as fields are added.
 * INTERVIEW: I made the tap count an assertion rather than an intention, because
 *           every new field is one tap, and nobody notices the fourth.
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './routes'
import { StoreProvider } from './store-context'
import { createSnapshotStore } from '@/store/snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import { naira } from '@/core/money/money'
import type { ChangeNotifier, Repository } from '@/core/repository'
import type {
  Category,
  Debt,
  Id,
  Instant,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
} from '@/core/types'

const AT = '2026-10-05T09:00:00.000Z' as Instant

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
}

const food: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 0,
}
const transport: Category = {
  id: 'c-transport' as Id,
  name: 'Transport',
  type: 'expense',
  rollsOver: false,
  sortOrder: 1,
}
const salary: Category = {
  id: 'c-salary' as Id,
  name: 'Salary',
  type: 'income',
  rollsOver: false,
  sortOrder: 2,
}

const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-09-24' as IsoDate,
  witnesses: [],
}

const plans: PlanEntry[] = [
  { id: 'p1' as Id, cycleStart: '2026-09-25' as IsoDate, categoryId: food.id, planned: naira(90_000) },
]

const seeded: Snapshot = {
  settings,
  categories: [food, transport, salary],
  plans,
  transactions: [
    {
      id: 't1' as Id,
      date: '2026-09-25' as IsoDate,
      type: 'income',
      amount: naira(450_000),
      categoryId: salary.id,
      createdAt: AT,
    },
  ],
  debts: [friend],
  goals: [],
}

function silentNotifier(): ChangeNotifier {
  return { announce: () => {}, subscribe: () => () => {} }
}

let db: MizaniyaDatabase
let repo: Repository
let dbCount = 0

beforeEach(async () => {
  dbCount += 1
  db = new MizaniyaDatabase(`mizaniya-qa-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
  await repo.import(seeded)
})

afterEach(async () => {
  cleanup()
  await db.delete()
})

function renderApp(repository: Repository = repo) {
  const bundle = createSnapshotStore(repository, silentNotifier())
  render(
    <StoreProvider bundle={bundle}>
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    </StoreProvider>,
  )
  return bundle.api
}

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: 'Safe to spend today' })
  await user.click(screen.getByRole('button', { name: 'Add a movement' }))
  return screen.findByRole('dialog')
}

describe('three taps plus the amount', () => {
  it('records a spend: ⊕, a category chip, Save', async () => {
    const user = userEvent.setup()
    renderApp()

    // Tap one.
    const sheet = await openSheet(user)

    // The amount field is focused on open, so the keypad is already up.
    const amount = within(sheet).getByLabelText(/Amount/)
    expect(document.activeElement).toBe(amount)
    await user.keyboard('2000')

    // Tap two: the category. Type is already Expense and the date is today.
    await user.click(within(sheet).getByRole('radio', { name: 'Food and groceries' }))

    // Tap three.
    await user.click(within(sheet).getByRole('button', { name: 'Save' }))

    await waitFor(async () => {
      const stored = await repo.transactions.list()
      expect(stored).toHaveLength(2)
    })

    const added = (await repo.transactions.list()).find((t) => t.id !== 't1')!
    expect(added.type).toBe('expense')
    expect(added.amount).toBe(naira(2_000))
    expect(added.categoryId).toBe(food.id)
  })

  it('closes the sheet and confirms twice — a toast and one announcement', async () => {
    const user = userEvent.setup()
    const { container } = { container: document.body }
    renderApp()

    const sheet = await openSheet(user)
    await user.keyboard('2000')
    await user.click(within(sheet).getByRole('radio', { name: 'Food and groceries' }))
    await user.click(within(sheet).getByRole('button', { name: 'Save' }))

    // Seen.
    expect(await screen.findByText('Saved.')).toBeDefined()

    // And said — carrying the one figure the owner came for, not the dozen
    // that changed (§6).
    const live = container.querySelector('[aria-live="polite"]')
    await waitFor(() => expect(live?.textContent).toContain('Safe to spend today'))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('the type decides what else is asked for', () => {
  it('swaps categories for counterparties on a debt movement', async () => {
    const user = userEvent.setup()
    renderApp()
    const sheet = await openSheet(user)

    await user.click(within(sheet).getByText('Another kind of movement'))
    await user.click(within(sheet).getByRole('radio', { name: 'I repaid' }))

    // The counterparty is asked for; the category is not.
    expect(within(sheet).getByRole('radio', { name: 'A. Friend' })).toBeDefined()
    expect(within(sheet).queryByRole('radio', { name: 'Food and groceries' })).toBeNull()
  })

  it('offers income categories only when receiving money', async () => {
    const user = userEvent.setup()
    renderApp()
    const sheet = await openSheet(user)

    await user.click(within(sheet).getByRole('tab', { name: 'Received' }))

    expect(within(sheet).getByRole('radio', { name: 'Salary' })).toBeDefined()
    expect(within(sheet).queryByRole('radio', { name: 'Food and groceries' })).toBeNull()
  })

  it('drops a choice that no longer applies when the type changes', async () => {
    const user = userEvent.setup()
    renderApp()
    const sheet = await openSheet(user)

    await user.keyboard('2000')
    await user.click(within(sheet).getByRole('radio', { name: 'Food and groceries' }))

    // Switching to a debt movement must not carry the category across, where
    // it would mean nothing.
    await user.click(within(sheet).getByText('Another kind of movement'))
    await user.click(within(sheet).getByRole('radio', { name: 'I repaid' }))
    await user.click(within(sheet).getByRole('button', { name: 'Save' }))

    expect(await within(sheet).findByText('Choose who this is with.')).toBeDefined()
    expect(await repo.transactions.list()).toHaveLength(1)
  })
})

describe('what stops a save', () => {
  it('asks for an amount, and keeps the sheet open', async () => {
    const user = userEvent.setup()
    renderApp()
    const sheet = await openSheet(user)

    await user.click(within(sheet).getByRole('button', { name: 'Save' }))

    expect(await within(sheet).findByText('Enter an amount.')).toBeDefined()
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('keeps every value when the write is rejected', async () => {
    const failing: Repository = {
      ...repo,
      transactions: {
        ...repo.transactions,
        put: async () => {
          throw new Error('Storage is full.')
        },
      },
    }
    const user = userEvent.setup()
    renderApp(failing)
    const sheet = await openSheet(user)

    await user.keyboard('2000')
    await user.click(within(sheet).getByRole('radio', { name: 'Food and groceries' }))
    await user.click(within(sheet).getByRole('button', { name: 'Save' }))

    expect(await within(sheet).findByText(/Your entry is still here/)).toBeDefined()
    // Still open, still holding what was typed — the owner never retypes.
    expect(within(sheet).getByLabelText(/Amount/)).toHaveProperty('value', '2000')
  })

  it('starts empty each time, so nothing is recorded twice by accident', async () => {
    const user = userEvent.setup()
    renderApp()

    const first = await openSheet(user)
    await user.keyboard('2000')
    await user.click(within(first).getByRole('radio', { name: 'Food and groceries' }))
    await user.click(within(first).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    const second = await openSheet(user)
    expect(within(second).getByLabelText(/Amount/)).toHaveProperty('value', '')
  })
})
