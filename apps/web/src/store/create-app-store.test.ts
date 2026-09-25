import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { withPersistenceRequest } from './create-app-store'
import { createSnapshotStore } from './snapshot-store'
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

function income(id: string): Transaction {
  return {
    id: id as Id,
    date: '2026-09-25' as IsoDate,
    type: 'income',
    amount: naira(450_000),
    categoryId: salary.id,
    createdAt: '2026-09-25T09:00:00.000Z' as Instant,
    updatedAt: STAMPED_AT,
  }
}

const seeded: Snapshot = {
  settings,
  categories: [salary],
  plans: [],
  transactions: [income('t1')],
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
  db = new MizaniyaDatabase(`mizaniya-persist-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
  await repo.import(seeded)
})

afterEach(async () => {
  await db.delete()
})

function build(repository: Repository = repo) {
  let asks = 0
  const bundle = withPersistenceRequest(
    createSnapshotStore(repository, silentNotifier()),
    async () => {
      asks += 1
    },
  )
  return { api: bundle.api, asks: () => asks }
}

describe('the browser is asked after the first real write (D12)', () => {
  it('does not ask on load, however much data is already there', async () => {
    const { api, asks } = build()
    await api.initialise()

    // Loading is not engagement. The records may have arrived from an import on
    // another device and been sitting untouched ever since.
    expect(asks()).toBe(0)
    api.dispose()
  })

  it('asks once the first write succeeds', async () => {
    const { api, asks } = build()
    await api.initialise()

    const added = income('t2')
    const result = await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(result.ok).toBe(true)
    expect(asks()).toBe(1)
    api.dispose()
  })

  it('asks only once, however many writes follow', async () => {
    const { api, asks } = build()
    await api.initialise()

    for (const id of ['t2', 't3', 't4']) {
      const added = income(id)
      await api.write(
        (r) => r.transactions.put(added, STAMPED_AT),
        (s) => ({ ...s, transactions: [...s.transactions, added] }),
      )
    }

    // A permission prompt on every save would train the owner to dismiss it.
    expect(asks()).toBe(1)
    api.dispose()
  })

  it('does not ask when the write was rejected', async () => {
    const failing: Repository = {
      ...repo,
      transactions: {
        ...repo.transactions,
        put: async () => {
          throw new Error('Storage is full.')
        },
      },
    }
    const { api, asks } = build(failing)
    await api.initialise()

    const added = income('t-never')
    const result = await api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(result.ok).toBe(false)
    // Nothing was stored, so there is nothing yet worth protecting.
    expect(asks()).toBe(0)
    api.dispose()
  })

  it('asks after an import, which is the most real write there is', async () => {
    const { api, asks } = build()
    await api.initialise()

    await api.replaceAll({ ...seeded, transactions: [income('t9')] })
    expect(asks()).toBe(1)
    api.dispose()
  })

  it('still reports the write result when the request is slow', async () => {
    // The request is never awaited: a save must not wait on a permission prompt.
    let settle: (() => void) | undefined
    const bundle = withPersistenceRequest(
      createSnapshotStore(repo, silentNotifier()),
      () =>
        new Promise<void>((resolve) => {
          settle = resolve
        }),
    )
    await bundle.api.initialise()

    const added = income('t5')
    const result = await bundle.api.write(
      (r) => r.transactions.put(added, STAMPED_AT),
      (s) => ({ ...s, transactions: [...s.transactions, added] }),
    )

    expect(result).toEqual({ ok: true })
    settle?.()
    bundle.api.dispose()
  })
})
