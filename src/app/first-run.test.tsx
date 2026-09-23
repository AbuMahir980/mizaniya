/**
 * @vitest-environment jsdom
 *
 * WHAT: The whole first run — welcome, restore, the six steps, and what lands
 *       in storage at the end.
 * WHY:  The acceptance criterion asks that the seeded owner onboards and Home
 *       reads ₦7,500.00. Onboarding supplies only half of that: it writes
 *       settings, categories, opening balances, debts and the goal, but **not
 *       the plan and not this cycle's movements**, which are the owner's own
 *       later. So the test adds those and asserts the figure — proving
 *       onboarding's half rather than pretending it produced all of it.
 * INTERVIEW: I made the end-to-end test say which half it was proving, because
 *       a test that quietly seeds the answer proves nothing about the code.
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './routes'
import { StoreProvider } from './store-context'
import { TodayProvider } from './today-context'
import { createSnapshotStore } from '@/store/snapshot-store'
import { buildSaveable } from '@/store/import-export'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import { safeToSpend } from '@/core/budget/budget'
import { formatMoney, naira } from '@/core/money/money'
import type { ChangeNotifier, Repository } from '@/core/repository'
import type { Id, Instant, IsoDate, PlanEntry, Snapshot, Transaction } from '@/core/types'

const TODAY = '2026-10-05' as IsoDate
const NOW = '2026-10-05T09:00:00.000Z' as Instant

function silentNotifier(): ChangeNotifier {
  return { announce: () => {}, subscribe: () => () => {} }
}

let db: MizaniyaDatabase
let repo: Repository
let dbCount = 0

beforeEach(async () => {
  dbCount += 1
  db = new MizaniyaDatabase(`mizaniya-first-run-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
})

afterEach(async () => {
  cleanup()
  await db.delete()
})

function renderApp(repository: Repository = repo) {
  const bundle = createSnapshotStore(repository, silentNotifier())
  const view = render(
    <StoreProvider bundle={bundle}>
      <TodayProvider now={TODAY} at={NOW}>
        <MemoryRouter initialEntries={['/welcome']}>
        <AppRoutes />
      </MemoryRouter>
    </TodayProvider>
  </StoreProvider>,
  )
  return { ...view, api: bundle.api }
}

describe('the welcome screen', () => {
  it('leads with the promise and the three things the app does', async () => {
    renderApp()
    expect(await screen.findByText('Know what you can spend today.')).toBeDefined()
    expect(screen.getByText('Safe to spend, today')).toBeDefined()
    expect(screen.getByText('Debts in both directions')).toBeDefined()
    expect(screen.getByText('Nothing leaves this device')).toBeDefined()
  })

  /**
   * **This one earns its brittleness.** The three tints have been shipped as
   * three identical emerald ones twice — once when the icons were missing
   * altogether, and again in the fix for that. The artboard draws `em2`, `sl2`
   * and `oc2`, and nothing else in the suite would notice them collapsing.
   */
  it('gives the three points three different tints, as the artboard draws them', async () => {
    const { container } = renderApp()
    await screen.findByText('Know what you can spend today.')

    for (const tint of ['bg-em2', 'bg-sl2', 'bg-oc2']) {
      expect(container.querySelector(`.${tint}`), tint).not.toBeNull()
    }
  })

  it('shows the app icon rather than the bare mark', async () => {
    const { container } = renderApp()
    await screen.findByText('Know what you can spend today.')

    // A rounded emerald tile with the scales reversed out — the lockup the
    // installed icon uses. The first screen is where that is established.
    expect(container.querySelector('.bg-emerald.text-onEmerald')).not.toBeNull()
  })

  it('says more in the cards at 1440, because there is room to', async () => {
    const { container } = renderApp()
    await screen.findByText('Know what you can spend today.')

    // `useMediaQuery` answers true without `matchMedia`, so this is the wide
    // layout. 360 is checked below.
    expect(container.textContent).toContain('never a number you have to take on trust')
  })

  it('keeps the short line at 360, where it sits under a paragraph', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { container } = renderApp()
    await screen.findByText('Know what you can spend today.')

    expect(container.textContent).toContain('One figure, worked out in front of you.')
    expect(container.textContent).not.toContain('never a number you have to take on trust')
    vi.unstubAllGlobals()
  })

  it('offers a route in for someone restoring an export', async () => {
    renderApp()
    expect(await screen.findByRole('button', { name: /export to restore/i })).toBeDefined()
  })

  it('starts onboarding at step 1, not at the required step', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: 'Get started' }))

    // Step 1 is the name, and it is optional — nobody is asked for money first.
    // The artboards ask a question; they do not label the field twice.
    expect(await screen.findByRole('heading', { name: 'What should we call you?' })).toBeDefined()
    expect(screen.getByText('Step 1 of 6')).toBeDefined()
  })
})

describe('step 2 is the only one that is required', () => {
  async function toStepTwo() {
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: 'Get started' }))
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'When are you paid, and how much?' })
    return user
  }

  it('refuses to move on without a take-home figure', async () => {
    const user = await toStepTwo()
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Enter how much you take home each month.')).toBeDefined()
    // Still on step 2, not silently advanced.
    expect(screen.getByRole('heading', { name: 'When are you paid, and how much?' })).toBeDefined()
  })

  it('says what a short month does, before it can surprise anyone (D4)', async () => {
    await toStepTwo()

    // Standing guidance under the field, as the artboard draws it — not a
    // banner that appears once the day is already 29 or more. Nothing is
    // wrong, so nothing should arrive looking like a correction (F7).
    const note = await screen.findByText('Short months will use the last day.')
    expect(note).toBeDefined()
    expect(note.closest('.bg-ro2')).toBeNull()
  })

  it('opens a picker for the salary day rather than asking for a number', async () => {
    const user = await toStepTwo()

    // The artboard draws a field that opens, not a numeric input.
    await user.click(screen.getByRole('button', { name: /Salary day/ }))
    await user.click(await screen.findByRole('radio', { name: '31' }))

    expect(screen.getByRole('button', { name: /Salary day/ })).toHaveProperty(
      'textContent',
      expect.stringContaining('31'),
    )
  })

  it('echoes the amount back formatted as it is typed', async () => {
    const user = await toStepTwo()
    await user.type(screen.getByLabelText(/Take-home/), '450000')

    // In the helper slot, which is where the artboard has room for a line of
    // text under that field — not as an extra one it does not draw.
    expect(await screen.findByText('₦450,000.00 a month.')).toBeDefined()
  })
})

describe('the controls the artboards drew after the rebuild', () => {
  async function toStepThree() {
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: 'Get started' }))
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'When are you paid, and how much?' })
    await user.type(screen.getByLabelText(/Take-home/), '450000')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'These are your categories.' })
    return user
  }

  it('opens a category row, because nothing could remove one before', async () => {
    const user = await toStepThree()

    // PAGE SPECS §7.1 calls the list editable and the helper promises rename,
    // remove or add — but no row carried a control until the pickers board.
    await user.click(screen.getByRole('button', { name: /Food and groceries — edit/ }))

    expect(await screen.findByRole('button', { name: 'Remove this category' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined()
  })

  it('removes the category it was opened on', async () => {
    const user = await toStepThree()
    await user.click(screen.getByRole('button', { name: /Food and groceries — edit/ }))
    await user.click(await screen.findByRole('button', { name: 'Remove this category' }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Food and groceries — edit/ })).toBeNull(),
    )
  })

  it('keeps the same two words in the footer on every step', async () => {
    const user = await toStepThree()
    for (const question of ['What have you already saved?', 'Who do you owe, and who owes you?']) {
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', { name: question })
    }

    // Step 5 adds inline. A primary that changes its own label on form state
    // is one the owner cannot predict, so `+ Add another` lives in the form.
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDefined()
    expect(screen.getByRole('button', { name: '+ Add another' })).toBeDefined()
  })
})

describe('what onboarding writes', () => {
  async function onboardMinimally() {
    const user = userEvent.setup()
    const view = renderApp()
    await user.click(await screen.findByRole('button', { name: 'Get started' }))

    await user.click(screen.getByRole('button', { name: 'Continue' })) // name
    await screen.findByRole('heading', { name: 'When are you paid, and how much?' })
    await user.type(screen.getByLabelText(/Take-home/), '450000')

    for (const _ of [0, 1, 2, 3]) {
      await user.click(screen.getByRole('button', { name: 'Continue' }))
    }
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
    return view
  }

  it('lands on Home, never leaving the owner on the form', async () => {
    await onboardMinimally()
    expect(await screen.findByRole('heading', { name: 'Safe to spend today' })).toBeDefined()
  })

  it('writes the settings to storage, so a reload finds them', async () => {
    await onboardMinimally()
    await waitFor(async () => {
      const stored = await repo.settings.get()
      expect(stored?.takeHome).toBe(naira(450_000))
      expect(stored?.salaryDay).toBe(25)
    })
  })

  it('keeps every answer when the save fails, and offers to try again', async () => {
    const failing: Repository = {
      ...repo,
      import: async () => {
        throw new Error('Storage is full.')
      },
    }
    const user = userEvent.setup()
    renderApp(failing)
    await user.click(await screen.findByRole('button', { name: 'Get started' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'When are you paid, and how much?' })
    await user.type(screen.getByLabelText(/Take-home/), '450000')
    for (const _ of [0, 1, 2, 3]) {
      await user.click(screen.getByRole('button', { name: 'Continue' }))
    }
    await user.click(await screen.findByRole('button', { name: 'Finish' }))

    expect(await screen.findByText(/Your answers are still here/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeDefined()

    // Still on the form, with the figure the owner typed.
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByDisplayValue('450000')).toBeDefined()
  })
})

describe('restoring an export skips onboarding entirely', () => {
  /** A dataset that already has everything onboarding would ask for. */
  const restored: Snapshot = {
    settings: {
      salaryDay: 25,
      takeHome: naira(450_000),
      amberRatio: 0.6,
      earlyIncomeWindowDays: 3,
      zakat: {},
    },
    categories: [
      { id: 'c-salary' as Id, name: 'Salary', type: 'income', rollsOver: false, sortOrder: 0 },
    ],
    plans: [],
    transactions: [
      {
        id: 't1' as Id,
        date: '2026-09-25' as IsoDate,
        type: 'income',
        amount: naira(450_000),
        categoryId: 'c-salary' as Id,
        createdAt: NOW,
      },
    ],
    debts: [],
    goals: [],
  }

  it('imports the file and goes straight to Home', async () => {
    const user = userEvent.setup()
    renderApp()

    const file = buildSaveable(restored, NOW, TODAY)
    const picker = await screen.findByLabelText('Choose an export file to restore')
    await user.upload(
      picker as HTMLInputElement,
      new File([file.text], file.name, { type: 'application/json' }),
    )

    // The export already carries the settings, so asking again would be asking
    // for answers the file has supplied.
    expect(await screen.findByRole('heading', { name: 'Safe to spend today' })).toBeDefined()
    expect(await repo.transactions.list()).toHaveLength(1)
  })

  it('refuses a foreign file, and says nothing has changed', async () => {
    const user = userEvent.setup()
    renderApp()

    const picker = await screen.findByLabelText('Choose an export file to restore')
    await user.upload(
      picker as HTMLInputElement,
      new File([JSON.stringify({ app: 'something-else' })], 'other.json', {
        type: 'application/json',
      }),
    )

    const message = await screen.findByText(/doesn’t look like a Mizaniya export/)
    expect(message.textContent).toContain('Nothing has changed.')
    // Still on welcome, with nothing written.
    expect(screen.getByRole('button', { name: 'Get started' })).toBeDefined()
    expect(await repo.settings.get()).toBeUndefined()
  })
})

describe('the seeded owner reaches ₦7,500.00 (the acceptance figure)', () => {
  it('onboarding supplies the settings; the plan and the cycle supply the rest', async () => {
    await (async () => {
      const user = userEvent.setup()
      renderApp()
      await user.click(await screen.findByRole('button', { name: 'Get started' }))
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', { name: 'When are you paid, and how much?' })
      await user.type(screen.getByLabelText(/Take-home/), '450000')
      for (const _ of [0, 1, 2, 3]) {
        await user.click(screen.getByRole('button', { name: 'Continue' }))
      }
      await user.click(await screen.findByRole('button', { name: 'Finish' }))
      await screen.findByRole('heading', { name: 'Safe to spend today' })
    })()

    const afterOnboarding = await repo.load()
    expect(afterOnboarding).toBeDefined()
    if (!afterOnboarding) throw new Error('expected a snapshot')

    // Onboarding wrote the settings and the categories. It deliberately wrote
    // no plan: a plan is the owner's to make, and pre-filling one would put
    // figures on their screen they never chose.
    expect(afterOnboarding.plans).toEqual([])

    const byName = (name: string) => afterOnboarding.categories.find((c) => c.name === name)!
    const plan = (name: string, whole: number, id: string): PlanEntry => ({
      id: id as Id,
      cycleStart: '2026-09-25' as IsoDate,
      categoryId: byName(name).id,
      planned: naira(whole),
    })
    const move = (
      id: string,
      type: Transaction['type'],
      whole: number,
      name: string,
      date = '2026-09-26',
    ): Transaction => ({
      id: id as Id,
      date: date as IsoDate,
      type,
      amount: naira(whole),
      categoryId: byName(name).id,
      createdAt: NOW,
    })

    // The seeded plan and the seeded cycle, from docs/seed-data.md.
    const seeded: Snapshot = {
      ...afterOnboarding,
      plans: [
        plan('Rent fund', 75_000, 'p1'),
        plan('Emergency fund', 15_000, 'p2'),
        plan('Personal savings', 70_000, 'p3'),
        plan('Food and groceries', 90_000, 'p4'),
        plan('Transport, data and airtime', 45_000, 'p5'),
        plan('Family support', 40_000, 'p6'),
        plan('Apartment setup', 25_000, 'p7'),
        plan('Miscellaneous', 22_000, 'p8'),
        plan('Utilities', 18_000, 'p9'),
        plan('Health', 10_000, 'p10'),
        plan('Sadaqah', 10_000, 'p11'),
      ],
      transactions: [
        {
          id: 'i1' as Id,
          date: '2026-09-25' as IsoDate,
          type: 'income',
          amount: naira(450_000),
          categoryId: byName('Rent fund').id,
          createdAt: NOW,
        },
        move('s1', 'savings-in', 75_000, 'Rent fund'),
        move('s2', 'savings-in', 15_000, 'Emergency fund'),
        move('e1', 'expense', 110_000, 'Food and groceries'),
        // Repaid A. Friend. It leaves the account like any other outflow, which
        // is why cash left is ₦220,000 and not ₦250,000.
        {
          id: 'd1' as Id,
          date: '2026-09-26' as IsoDate,
          type: 'repaid',
          amount: naira(30_000),
          debtId: 'debt-friend' as Id,
          createdAt: NOW,
        },
      ],
      debts: [
        {
          id: 'debt-friend' as Id,
          counterpartyName: 'A. Friend',
          openedOn: '2026-09-24' as IsoDate,
          scheduleAmount: naira(30_000),
          witnesses: [],
        },
      ],
    }

    // ₦220,000 cash left, ₦70,000 still promised, 20 days to 24 October.
    const safe = safeToSpend(seeded, TODAY)

    expect(formatMoney(safe.perDay)).toBe('₦7,500.00')
    expect(formatMoney(safe.total)).toBe('₦150,000.00')
    expect(safe.daysLeft).toBe(20)
    // A plan exists, and ₦7,500 clears the ₦5,200 amber threshold.
    expect(safe.hasPlan).toBe(true)
    expect(safe.level).toBe('green')
  })
})
