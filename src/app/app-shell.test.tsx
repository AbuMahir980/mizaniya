/**
 * @vitest-environment jsdom
 *
 * WHAT: The shell's behaviour — the redirect to onboarding, every state it can
 *       be in, and the keyboard reaching every nav item.
 * WHY:  The environment is set here rather than globally so `core/` keeps
 *       running in plain node. Its tests need no DOM, and paying for one on
 *       every run would make the fast suite slow for the sake of this file.
 * INTERVIEW: I scoped the browser environment to the tests that need a DOM, so
 *       the domain suite stays a pure-function test run.
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './routes'
import { StoreProvider } from './store-context'
import { createSnapshotStore } from '@/store/snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import type { ChangeNotifier, Repository } from '@/core/repository'
import { naira } from '@/core/money/money'
import type { Category, Id, Instant, IsoDate, Settings, Snapshot, Transaction } from '@/core/types'

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
}

const salary: Category = {
  id: 'c-salary' as Id,
  name: 'Salary',
  type: 'income',
  rollsOver: false,
  sortOrder: 0,
}

const income: Transaction = {
  id: 't1' as Id,
  date: '2026-09-25' as IsoDate,
  type: 'income',
  amount: naira(450_000),
  categoryId: salary.id,
  createdAt: '2026-09-25T09:00:00.000Z' as Instant,
}

const seeded: Snapshot = {
  settings,
  categories: [salary],
  plans: [],
  transactions: [income],
  debts: [],
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
  db = new MizaniyaDatabase(`mizaniya-shell-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
})

afterEach(async () => {
  cleanup()
  await db.delete()
})

function renderApp(repository: Repository, path = '/') {
  const bundle = createSnapshotStore(repository, silentNotifier())
  return render(
    <StoreProvider bundle={bundle}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </StoreProvider>,
  )
}

describe('a new owner is sent to onboarding', () => {
  it('redirects to /welcome when there are no settings yet', async () => {
    renderApp(repo)

    // T7's `undefined` load is a state the shell has to handle, and this is it.
    // The welcome screen's own heading is the app's name (T12).
    expect(await screen.findByRole('button', { name: 'Get started' })).toBeDefined()
  })

  it('does not redirect once settings exist', async () => {
    await repo.import(seeded)
    renderApp(repo)

    expect(await screen.findByRole('heading', { name: 'Safe to spend today' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Get started' })).toBeNull()
  })
})

describe('the states the shell can be in', () => {
  it('shows a loading screen before the data arrives', async () => {
    let release: (() => void) | undefined
    const slow: Repository = {
      ...repo,
      load: () =>
        new Promise((resolve) => {
          release = () => resolve(undefined)
        }),
    }
    renderApp(slow)

    expect(screen.getByText('Opening your records…')).toBeDefined()

    // Released inside act, so the resolution's re-render is not a stray update
    // after the test has finished — a warning here would hide a real one later.
    await act(async () => {
      release?.()
    })
  })

  it('says what happened and what to do next when loading fails (L2)', async () => {
    const broken: Repository = {
      ...repo,
      load: async () => {
        throw new Error('The database is locked.')
      },
    }
    renderApp(broken)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Couldn’t open your data')
    expect(alert.textContent).toContain('usually temporary')
    expect(alert.textContent).toContain('The database is locked.')
  })
})

describe('navigation', () => {
  beforeEach(async () => {
    await repo.import(seeded)
  })

  it('moves between screens when a nav item is chosen', async () => {
    const user = userEvent.setup()
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    await user.click(screen.getAllByRole('button', { name: /Debts/ })[0]!)
    expect(await screen.findByRole('heading', { name: 'Debts & Goals' })).toBeDefined()
  })

  it('keeps Debts active on a nested route, so the bar does not lie', async () => {
    renderApp(repo, '/debts/d-friend/record')
    expect(await screen.findByRole('heading', { name: 'Debt record' })).toBeDefined()

    const debts = screen.getAllByRole('button', { name: /Debts/ })
    expect(debts.some((b) => b.getAttribute('aria-current') === 'page')).toBe(true)
  })

  it('has no Transactions item — Quick Add covers recording (§2)', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const nav = screen.getAllByRole('navigation')[0]!
    expect(nav.textContent).not.toContain('Transactions')
  })
})

describe('the keyboard reaches every nav item (J5)', () => {
  beforeEach(async () => {
    await repo.import(seeded)
  })

  it('tabs to every destination, and each one takes focus', async () => {
    const user = userEvent.setup()
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const labels = ['Home', 'Plan', 'Debts', 'More']
    const reached = new Set<string>()

    // Walk the whole document once; every nav label must be landed on.
    for (let i = 0; i < 40 && reached.size < labels.length; i += 1) {
      await user.tab()
      const active = document.activeElement
      const text = active?.textContent ?? ''
      const hit = labels.find((label) => text.includes(label))
      if (hit && active?.tagName === 'BUTTON') reached.add(hit)
    }

    expect([...reached].sort()).toEqual([...labels].sort())
  })

  it('activates a nav item with the keyboard alone', async () => {
    const user = userEvent.setup()
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const plan = screen.getAllByRole('button', { name: /Plan/ })[0]!
    plan.focus()
    expect(document.activeElement).toBe(plan)

    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Plan' })).toBeDefined())
  })

  it('every nav item is a real button, so focus is visible by default', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    // index.css puts a 2px emerald ring on :focus-visible for every element, so
    // the requirement is that these are focusable elements rather than divs.
    for (const label of ['Home', 'Plan', 'Debts', 'More']) {
      const items = screen.getAllByRole('button', { name: new RegExp(label) })
      expect(items.length).toBeGreaterThan(0)
      expect(items[0]!.tagName).toBe('BUTTON')
    }
  })
})

describe('the shell mounts one live region, not one per figure (§3)', () => {
  it('has exactly one polite live region', async () => {
    await repo.import(seeded)
    const { container } = renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const polite = container.querySelectorAll('[aria-live="polite"]')
    expect(polite.length).toBe(1)
  })
})
