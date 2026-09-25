import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSnapshotStore } from './snapshot-store'
import { recomputes, selectCashLeft, selectSafeToSpend } from './selectors'
import { createDexieRepository } from '@/data/dexie-repository'
import { createBroadcastNotifier } from '@/data/broadcast-notifier'
import { MizaniyaDatabase } from '@/data/database'
import type { ChangeNotifier, Repository } from '@/core/repository'
import { naira } from '@/core/money/money'
import type {
  Category,
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

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: {},
  updatedAt: STAMPED_AT,
}

const food: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 0,
  updatedAt: STAMPED_AT,
}

const plan: PlanEntry = {
  id: 'p1' as Id,
  cycleStart: '2026-09-25' as IsoDate,
  categoryId: food.id,
  planned: naira(90_000),
  updatedAt: STAMPED_AT,
}

function spend(id: string, whole: number, date = '2026-10-01'): Transaction {
  return {
    id: id as Id,
    date: date as IsoDate,
    type: 'expense',
    amount: naira(whole),
    categoryId: food.id,
    createdAt: `${date}T09:00:00.000Z` as Instant,
    updatedAt: STAMPED_AT,
  }
}

const seeded: Snapshot = {
  settings,
  categories: [food],
  plans: [plan],
  transactions: [
    { ...spend('t-income', 450_000, '2026-09-25'), type: 'income', categoryId: undefined },
    spend('t1', 10_000),
  ],
  debts: [],
  goals: [],
}

/** A notifier that records its announcements, for asserting ordering. */
function spyNotifier(): ChangeNotifier & { announced: number } {
  const listeners = new Set<() => void>()
  const spy = {
    announced: 0,
    announce() {
      spy.announced += 1
      listeners.forEach((l) => l())
    },
    subscribe(onChange: () => void) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
  }
  return spy
}

let db: MizaniyaDatabase
let repo: Repository
let dbCount = 0

beforeEach(async () => {
  dbCount += 1
  db = new MizaniyaDatabase(`mizaniya-store-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
  recomputes.count = 0
})

afterEach(async () => {
  await db.delete()
})

describe('what the store knows about its own data', () => {
  it('reports new-owner on a device with nothing on it', async () => {
    const { api } = createSnapshotStore(repo, spyNotifier())
    await api.initialise()

    expect(api.state.status).toBe('new-owner')
    api.dispose()
  })

  it('reports ready once there is something to load', async () => {
    await repo.import(seeded)
    const { api } = createSnapshotStore(repo, spyNotifier())
    await api.initialise()

    expect(api.state.status).toBe('ready')
    if (api.state.status !== 'ready') throw new Error('expected ready')
    expect(api.state.snapshot.transactions).toHaveLength(2)
    api.dispose()
  })

  it('reports an error rather than throwing at the caller', async () => {
    const broken: Repository = {
      ...repo,
      load: async () => {
        throw new Error('The database could not be opened.')
      },
    }
    const { api } = createSnapshotStore(broken, spyNotifier())
    await api.initialise()

    expect(api.state.status).toBe('error')
    if (api.state.status !== 'error') throw new Error('expected error')
    expect(api.state.message).toBe('The database could not be opened.')
    api.dispose()
  })
})

describe('storage first, memory second', () => {
  it('updates memory after a write that succeeded', async () => {
    await repo.import(seeded)
    const notifier = spyNotifier()
    const { api } = createSnapshotStore(repo, notifier)
    await api.initialise()

    const added = spend('t2', 5_000, '2026-10-06')
    const result = await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(result).toEqual({ ok: true })
    if (api.state.status !== 'ready') throw new Error('expected ready')
    expect(api.state.snapshot.transactions).toHaveLength(3)

    // And it really reached storage, not just memory.
    expect(await repo.transactions.list()).toHaveLength(3)
    api.dispose()
  })

  it('leaves the snapshot untouched when the repository rejects', async () => {
    await repo.import(seeded)
    const notifier = spyNotifier()
    const failing: Repository = {
      ...repo,
      transactions: {
        ...repo.transactions,
        put: async () => {
          throw new Error('Storage is full.')
        },
      },
    }
    const { api } = createSnapshotStore(failing, notifier)
    await api.initialise()

    const before = api.state.status === 'ready' ? api.state.snapshot : undefined
    const added = spend('t-never', 5_000, '2026-10-06')

    const result = await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(result).toEqual({ ok: false, message: 'Storage is full.' })

    // The very same object, not merely an equal one: memory was never touched.
    if (api.state.status !== 'ready') throw new Error('expected ready')
    expect(api.state.snapshot).toBe(before)
    expect(api.state.snapshot.transactions).toHaveLength(2)

    // And nothing was announced, because nothing changed.
    expect(notifier.announced).toBe(0)
    api.dispose()
  })

  it('announces only after both storage and memory have been updated', async () => {
    await repo.import(seeded)
    const notifier = spyNotifier()
    const { api } = createSnapshotStore(repo, notifier)
    await api.initialise()

    const added = spend('t3', 1_000, '2026-10-07')
    await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(notifier.announced).toBe(1)
    api.dispose()
  })

  it('refuses to write before anything is loaded', async () => {
    const { api } = createSnapshotStore(repo, spyNotifier())
    const result = await api.write(
      async () => {},
      (s) => s,
    )

    expect(result.ok).toBe(false)
    api.dispose()
  })
})

describe('two tabs do not drift', () => {
  it('a write in one tab makes the other reload from storage', async () => {
    await repo.import(seeded)

    const channel = `mizaniya-test-${dbCount}`
    const tabA = createSnapshotStore(
      createDexieRepository(db),
      createBroadcastNotifier(channel),
    )
    const tabB = createSnapshotStore(
      createDexieRepository(db),
      createBroadcastNotifier(channel),
    )

    await tabA.api.initialise()
    await tabB.api.initialise()

    if (tabB.api.state.status !== 'ready') throw new Error('expected ready')
    expect(tabB.api.state.snapshot.transactions).toHaveLength(2)

    const added = spend('t-from-a', 7_000, '2026-10-08')
    await tabA.api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    // The broadcast is delivered asynchronously, so wait for B to catch up.
    await new Promise((resolve) => setTimeout(resolve, 50))

    if (tabB.api.state.status !== 'ready') throw new Error('expected ready')
    expect(tabB.api.state.snapshot.transactions).toHaveLength(3)
    expect(tabB.api.state.snapshot.transactions.map((t) => t.id)).toContain('t-from-a')

    tabA.api.dispose()
    tabB.api.dispose()
  })
})

describe('nothing derived is stored', () => {
  it('recomputes only when the snapshot changes', async () => {
    await repo.import(seeded)
    const { api } = createSnapshotStore(repo, spyNotifier())
    await api.initialise()
    if (api.state.status !== 'ready') throw new Error('expected ready')

    const snapshot = api.state.snapshot
    const first = selectSafeToSpend(snapshot, TODAY)
    recomputes.count = 0

    // Same snapshot, same day: the answer is already known.
    selectSafeToSpend(snapshot, TODAY)
    selectSafeToSpend(snapshot, TODAY)
    expect(recomputes.count).toBe(0)
    expect(selectSafeToSpend(snapshot, TODAY)).toBe(first)

    api.dispose()
  })

  it('recomputes when the day changes, even on the same snapshot', async () => {
    await repo.import(seeded)
    const { api } = createSnapshotStore(repo, spyNotifier())
    await api.initialise()
    if (api.state.status !== 'ready') throw new Error('expected ready')

    const snapshot = api.state.snapshot
    selectSafeToSpend(snapshot, TODAY)
    recomputes.count = 0

    selectSafeToSpend(snapshot, '2026-10-06' as IsoDate)
    expect(recomputes.count).toBe(1)
    api.dispose()
  })

  it('a write invalidates the figures, because the snapshot object is replaced', async () => {
    await repo.import(seeded)
    const { api } = createSnapshotStore(repo, spyNotifier())
    await api.initialise()
    if (api.state.status !== 'ready') throw new Error('expected ready')

    const before = selectCashLeft(api.state.snapshot, TODAY)

    const added = spend('t4', 20_000, '2026-10-09')
    await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    if (api.state.status !== 'ready') throw new Error('expected ready')
    const after = selectCashLeft(api.state.snapshot, TODAY)

    // The figure moved by exactly the spend, with nothing stored in between.
    expect(before - after).toBe(naira(20_000))
    api.dispose()
  })
})
