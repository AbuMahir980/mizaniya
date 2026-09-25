/**
 * @vitest-environment jsdom
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './routes'
import { StoreProvider } from './store-context'
import { TodayProvider } from './today-context'
import { createSnapshotStore } from '@/store/snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import type { ChangeNotifier, Repository } from '@mizaniya/core/repository'
import { naira } from '@mizaniya/core/money/money'
import type { Category, Id, Instant, IsoDate, Settings, Snapshot, Transaction } from '@mizaniya/core/types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

const salary: Category = {
  id: 'c-salary' as Id,
  name: 'Salary',
  type: 'income',
  rollsOver: false,
  sortOrder: 0,
  updatedAt: STAMPED_AT,
}

const income: Transaction = {
  id: 't1' as Id,
  date: '2026-09-25' as IsoDate,
  type: 'income',
  amount: naira(450_000),
  categoryId: salary.id,
  createdAt: '2026-09-25T09:00:00.000Z' as Instant,
  updatedAt: STAMPED_AT,
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
      <TodayProvider>
        <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </TodayProvider>
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
  it('shows the launch screen before the data arrives', async () => {
    let release: (() => void) | undefined
    const slow: Repository = {
      ...repo,
      load: () =>
        new Promise((resolve) => {
          release = () => resolve(undefined)
        }),
    }
    renderApp(slow)

    // The artboard's launch panel: the name, and the one line of reassurance.
    // No spinner is drawn, so the announcement carries the "still working" part
    // that a turning spinner would otherwise convey.
    expect(screen.getByText('Mizaniya')).toBeDefined()
    expect(screen.getByText('Everything stays on this device')).toBeDefined()
    // Scoped: the shell's announcer mounts a live region of its own.
    expect(screen.getByText('Opening your records…').closest('[role="status"]')).not.toBeNull()
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

  it('the bottom bar has no Transactions item — Quick Add covers recording (§2)', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    // The bottom bar is the mobile one: five slots, and More carries the rest.
    const bottomBar = screen
      .getAllByRole('navigation')
      .find((nav) => nav.className.includes('fixed'))!
    expect(bottomBar.textContent).not.toContain('Transactions')
    expect(bottomBar.textContent).toContain('More')
  })

  it('the sidebar lists every destination flat, and no More (§2)', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const sidebar = screen
      .getAllByRole('navigation')
      .find((nav) => nav.className.includes('desktop:w-[240px]'))!

    for (const label of ['Transactions', 'Months', 'Settings', 'Zakat']) {
      expect(sidebar.textContent, `${label} missing from the sidebar`).toContain(label)
    }
    // More is a mobile affordance for a problem 1440 does not have.
    expect(sidebar.textContent).not.toContain('More')
  })

  it('puts Zakat among the destinations and Settings apart, at the foot', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const sidebar = screen
      .getAllByRole('navigation')
      .find((nav) => nav.className.includes('desktop:w-[240px]'))!
    const labels = [...sidebar.querySelectorAll('button')].map((b) => b.textContent ?? '')

    // Zakat is a feature, not a preference, so it sits with the places the
    // owner goes to do something.
    const zakat = labels.findIndex((l) => l.includes('Zakat'))
    const settings = labels.findIndex((l) => l.includes('Settings'))
    expect(zakat).toBeGreaterThan(-1)
    expect(settings).toBeGreaterThan(zakat)

    // And Settings is in its own group, because it holds Import — the most
    // dangerous action in the app (§7.9).
    const settingsButton = [...sidebar.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Settings'),
    )!
    const zakatButton = [...sidebar.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Zakat'),
    )!
    expect(settingsButton.parentElement).not.toBe(zakatButton.parentElement)
  })

  it('still lights Settings when the owner is on it', async () => {
    renderApp(repo, '/settings')
    const sidebar = await waitFor(() =>
      screen
        .getAllByRole('navigation')
        .find((nav) => nav.className.includes('desktop:w-[240px]'))!,
    )

    const settings = [...sidebar.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Settings'),
    )!
    // Settings sits outside the main group, so the active key is derived over
    // both — otherwise being here would light Home.
    expect(settings.getAttribute('aria-current')).toBe('page')
  })

  it('the root is never a scroll container, or nothing can be sticky', async () => {
    // Anchored to the repo root, where the root vitest config runs from.
    // Not `import.meta.url` — that is not a file URL under jsdom. Not `?raw` —
    // vitest stubs CSS imports to empty by default, which would make this
    // assertion pass vacuously one day.
    const { readFileSync } = await import('node:fs')
    const css = readFileSync('apps/web/src/index.css', 'utf8')
    const root = /html,\s*\n?\s*body\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''

    // `overflow-x: hidden` forces the other axis to compute as `auto`, which
    // makes the root a scroll container and silently breaks every sticky
    // element inside it. Two fixes to the sidebar did nothing until this line
    // changed, so it is asserted where it will be read.
    expect(root).toContain('clip')
    expect(root).not.toContain('hidden')
  })

  it('renders a real icon per nav item, not a placeholder', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const sidebar = screen
      .getAllByRole('navigation')
      .find((nav) => nav.className.includes('desktop:w-[240px]'))!

    // Destinations and the Add button — not the theme control, whose tab
    // triggers are buttons carrying words rather than glyphs.
    const navButtons = [...sidebar.querySelectorAll('button')].filter(
      (b) => !b.closest('[role="tablist"]'),
    )
    expect(navButtons.length).toBeGreaterThan(5)

    for (const button of navButtons) {
      // The Add button and every destination carry a 24-grid glyph.
      const svg = button.querySelector('svg')
      expect(svg, `no icon on "${button.textContent}"`).not.toBeNull()
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
      // A drawn path, not the bordered circle the placeholder used.
      expect(svg?.querySelector('path, circle, rect')).not.toBeNull()
    }
  })

  it('carries a theme control, so both themes can be seen', async () => {
    const user = userEvent.setup()
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const themes = screen.getByRole('tablist', { name: 'Colour theme' })
    expect(themes).toBeDefined()

    // Auto is the default, and it is a real state rather than "not chosen".
    const auto = within(themes).getByRole('tab', { name: 'Auto' })
    expect(auto.getAttribute('data-state')).toBe('active')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)

    await user.click(within(themes).getByRole('tab', { name: 'Dark' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // And back, which a two-way toggle could not do.
    await user.click(auto)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('the sidebar carries the lockup, and stays put while the page scrolls', async () => {
    renderApp(repo)
    await screen.findByRole('heading', { name: 'Safe to spend today' })

    const sidebar = screen
      .getAllByRole('navigation')
      .find((nav) => nav.className.includes('desktop:w-[240px]'))!

    expect(sidebar.textContent).toContain('Mizaniya')
    expect(sidebar.className).toContain('desktop:sticky')
    expect(sidebar.className).toContain('desktop:h-screen')
    // Without self-start the flex row stretches it to the height of the page,
    // and a sticky element that tall has nowhere to stick — it scrolls away and
    // only its footer stays in view.
    expect(sidebar.className).toContain('desktop:self-start')
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
