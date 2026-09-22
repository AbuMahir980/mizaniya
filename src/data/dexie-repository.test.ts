/**
 * WHAT: The Dexie repository against a real IndexedDB implementation
 *       (fake-indexeddb), including an import that is **rejected part-way**.
 * WHY:  Atomicity is the one property that cannot be checked by reading the
 *       code. A rollback either happens or it does not, and the only way to
 *       know is to break a write on purpose and look at what survived.
 * INTERVIEW: I tested the failure path of the import transaction rather than
 *       the happy path, because a half-written import is the silent fault the
 *       whole design is arranged against.
 */

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDexieRepository } from './dexie-repository'
import { MizaniyaDatabase } from './database'
import type { Repository } from '@/core/repository'
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
import { naira } from '@/core/money/money'

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

const planEntry: PlanEntry = {
  id: 'p1' as Id,
  cycleStart: '2026-09-25' as IsoDate,
  categoryId: food.id,
  planned: naira(90_000),
}

function spend(id: string, whole: number, date: string): Transaction {
  return {
    id: id as Id,
    date: date as IsoDate,
    type: 'expense',
    amount: naira(whole),
    categoryId: food.id,
    createdAt: `${date}T09:00:00.000Z` as Instant,
  }
}

const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-07-01' as IsoDate,
  scheduleAmount: naira(30_000),
  witnesses: [],
}

const rentGoal: Goal = {
  id: 'g-rent' as Id,
  name: 'Annual rent',
  target: naira(900_000),
  dueDate: '2027-03-01' as IsoDate,
  categoryId: 'c-rent' as Id,
  createdOn: '2026-08-24' as IsoDate,
}

const snapshot: Snapshot = {
  settings,
  categories: [food],
  plans: [planEntry],
  transactions: [
    spend('t1', 12_000, '2026-09-26'),
    spend('t2', 8_000, '2026-10-05'),
    spend('t3', 5_000, '2026-10-24'),
  ],
  debts: [friend],
  goals: [rentGoal],
}

let db: MizaniyaDatabase
let repo: Repository
let dbCount = 0

beforeEach(async () => {
  dbCount += 1
  // A fresh database per test, so one test's rows cannot explain another's pass.
  db = new MizaniyaDatabase(`mizaniya-test-${dbCount}`)
  repo = createDexieRepository(db)
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('a device with nothing on it', () => {
  it('load() returns undefined — a new owner, not an error', async () => {
    expect(await repo.load()).toBeUndefined()
  })

  it('stays undefined even when rows exist but settings do not', async () => {
    // Nothing should write rows before onboarding, but if it did, the app must
    // still treat the device as not set up rather than render a half-Home.
    await repo.categories.put(food)
    expect(await repo.load()).toBeUndefined()
  })

  it('refuses to export rather than inventing a file', async () => {
    await expect(repo.export()).rejects.toThrow(/nothing to export/i)
  })
})

describe('reading back what was written', () => {
  beforeEach(async () => {
    await repo.import(snapshot)
  })

  it('load() returns every collection once settings exist', async () => {
    const loaded = await repo.load()
    expect(loaded).toBeDefined()
    if (!loaded) throw new Error('expected a snapshot')

    expect(loaded.settings.salaryDay).toBe(25)
    expect(loaded.categories).toHaveLength(1)
    expect(loaded.plans).toHaveLength(1)
    expect(loaded.transactions).toHaveLength(3)
    expect(loaded.debts).toHaveLength(1)
    expect(loaded.goals).toHaveLength(1)
  })

  it('keeps money as integer kobo through a round trip', async () => {
    const loaded = await repo.load()
    expect(loaded?.settings.takeHome).toBe(45_000_000)
    expect(loaded?.debts[0]?.scheduleAmount).toBe(3_000_000)
  })

  it('stores settings without adding an id to the domain type', async () => {
    const stored = await repo.settings.get()
    expect(stored).toEqual(settings)
    expect(stored && 'id' in stored).toBe(false)
  })

  it('lists plans by cycle', async () => {
    const other: PlanEntry = { ...planEntry, id: 'p2' as Id, cycleStart: '2026-10-25' as IsoDate }
    await repo.plans.put(other)

    const september = await repo.plans.listByCycle('2026-09-25' as IsoDate)
    expect(september.map((p) => p.id)).toEqual(['p1'])
  })

  it('lists transactions in a half-open range — `to` is excluded', async () => {
    const inCycle = await repo.transactions.list({
      from: '2026-09-25' as IsoDate,
      to: '2026-10-25' as IsoDate,
    })
    expect(inCycle.map((t) => t.id).sort()).toEqual(['t1', 't2', 't3'])

    // 24 October is the cycle's last day, so a range ending on it excludes it.
    const upToThe24th = await repo.transactions.list({
      from: '2026-09-25' as IsoDate,
      to: '2026-10-24' as IsoDate,
    })
    expect(upToThe24th.map((t) => t.id).sort()).toEqual(['t1', 't2'])
  })

  it('deletes a single record without touching its neighbours', async () => {
    await repo.transactions.delete('t2' as Id)
    const left = await repo.transactions.list()
    expect(left.map((t) => t.id).sort()).toEqual(['t1', 't3'])
  })

  it('clear() empties everything, and load() reports a fresh device again', async () => {
    await repo.clear()
    expect(await repo.load()).toBeUndefined()
    expect(await repo.transactions.list()).toHaveLength(0)
  })
})

describe('import is one transaction — all of it or none (ADR-005)', () => {
  it('replaces the previous contents entirely', async () => {
    await repo.import(snapshot)

    const replacement: Snapshot = {
      ...snapshot,
      transactions: [spend('t9', 1_000, '2026-11-02')],
      debts: [],
    }
    await repo.import(replacement)

    const loaded = await repo.load()
    expect(loaded?.transactions.map((t) => t.id)).toEqual(['t9'])
    // The old rows are gone, not merged with the new ones.
    expect(loaded?.debts).toHaveLength(0)
  })

  it('rolls back completely when a write is rejected part-way', async () => {
    await repo.import(snapshot)

    /**
     * A record with no primary key. IndexedDB rejects it, which fails the
     * transaction after the tables have already been cleared — precisely the
     * moment a non-atomic import would leave the device empty.
     */
    const broken = {
      ...snapshot,
      transactions: [
        spend('t1', 12_000, '2026-09-26'),
        { ...spend('t-broken', 4_000, '2026-10-06'), id: undefined as unknown as Id },
      ],
    }

    await expect(repo.import(broken)).rejects.toThrow()

    // Nothing was lost: the snapshot from before the failed import is intact.
    const loaded = await repo.load()
    expect(loaded).toBeDefined()
    expect(loaded?.transactions.map((t) => t.id).sort()).toEqual(['t1', 't2', 't3'])
    expect(loaded?.debts).toHaveLength(1)
    expect(loaded?.settings.takeHome).toBe(45_000_000)
  })

  it('leaves a fresh device fresh when the very first import fails', async () => {
    const broken = {
      ...snapshot,
      categories: [{ ...food, id: undefined as unknown as Id }],
    }

    await expect(repo.import(broken)).rejects.toThrow()
    // Not half-written: still no settings, so still a new owner.
    expect(await repo.load()).toBeUndefined()
  })
})

describe('the migration chain', () => {
  it('opens at version 1, so a version 2 has something to upgrade from', async () => {
    // Dexie reports the version it opened; a chain that starts at 1 is what
    // lets a later .version(2).upgrade() run against an existing database.
    expect(db.verno).toBe(1)
  })

  it('reopens an existing database and finds the same records', async () => {
    await repo.import(snapshot)
    await db.close()

    const reopened = new MizaniyaDatabase(db.name)
    const again = createDexieRepository(reopened)
    await reopened.open()

    const loaded = await again.load()
    expect(loaded?.transactions).toHaveLength(3)
    await reopened.close()
  })
})
