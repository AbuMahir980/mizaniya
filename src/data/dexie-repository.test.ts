import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDexieRepository } from './dexie-repository'
import Dexie from 'dexie'
import { MizaniyaDatabase, SETTINGS_KEY } from './database'
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

const food: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 0,
  updatedAt: STAMPED_AT,
}

const planEntry: PlanEntry = {
  id: 'p1' as Id,
  cycleStart: '2026-09-25' as IsoDate,
  categoryId: food.id,
  planned: naira(90_000),
  updatedAt: STAMPED_AT,
}

function spend(id: string, whole: number, date: string): Transaction {
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

const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-07-01' as IsoDate,
  scheduleAmount: naira(30_000),
  witnesses: [],
  updatedAt: STAMPED_AT,
}

const rentGoal: Goal = {
  id: 'g-rent' as Id,
  name: 'Annual rent',
  target: naira(900_000),
  dueDate: '2027-03-01' as IsoDate,
  categoryId: 'c-rent' as Id,
  createdOn: '2026-08-24' as IsoDate,
  updatedAt: STAMPED_AT,
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
    await repo.categories.put(food, STAMPED_AT)
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
    await repo.plans.put(other, STAMPED_AT)

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
    await repo.transactions.delete('t2' as Id, STAMPED_AT)
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
  it('opens at version 2, and the chain from 1 is what made that possible', async () => {
    // Dexie reports the version it opened. Version 1 being declared explicitly
    // is what let version 2 upgrade an existing database rather than replace it.
    expect(db.verno).toBe(2)
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

describe('updatedAt is the repository\'s to set', () => {
  const LATER = '2026-10-01T12:00:00.000Z' as Instant

  it('stamps a put with the instant it was given', async () => {
    await repo.settings.put(settings, STAMPED_AT)
    await repo.categories.put(food, LATER)

    expect((await repo.categories.list())[0]!.updatedAt).toBe(LATER)
  })

  it('replaces a stale timestamp rather than trusting the one passed in', async () => {
    await repo.settings.put(settings, STAMPED_AT)
    // `{ ...food }` still carries STAMPED_AT. This is the ordinary way to edit
    // an object, and the row must not keep the old time just because it was there.
    await repo.categories.put({ ...food, name: 'Groceries' }, LATER)

    const saved = (await repo.categories.list())[0]!
    expect(saved.name).toBe('Groceries')
    expect(saved.updatedAt).toBe(LATER)
    expect(saved.updatedAt).not.toBe(STAMPED_AT)
  })

  it('stamps every row of a bulkPut with the same instant', async () => {
    await repo.settings.put(settings, STAMPED_AT)
    await repo.plans.bulkPut([planEntry, { ...planEntry, id: 'p2' as Id }], LATER)

    const saved = await repo.plans.listByCycle(planEntry.cycleStart)
    expect(saved.map((row) => row.updatedAt)).toEqual([LATER, LATER])
  })

  it('preserves the timestamps in an imported file instead of re-stamping them', async () => {
    /**
     * A restore is not an edit. If import stamped every row with "now", a
     * restored backup would look freshly changed and would beat genuinely newer
     * data on the server at the first sync — losing the newer data silently.
     */
    await repo.import(snapshot)

    const loaded = await repo.load()
    expect(loaded?.categories[0]!.updatedAt).toBe(STAMPED_AT)
    expect(loaded?.settings.updatedAt).toBe(STAMPED_AT)
  })
})

describe('a delete leaves a tombstone, so it can reach another device', () => {
  const DELETED_AT = '2026-10-02T08:00:00.000Z' as Instant

  beforeEach(async () => {
    await repo.import(snapshot)
  })

  it('records what was deleted, and when', async () => {
    await repo.categories.delete(food.id, DELETED_AT)

    expect(await repo.deletions.list()).toEqual([
      { entity: 'category', id: food.id, deletedAt: DELETED_AT },
    ])
  })

  it('removes the row itself, so nothing has to filter it out', async () => {
    await repo.categories.delete(food.id, DELETED_AT)

    // The reason this is a separate table rather than a `deletedAt` column: the
    // snapshot holds only live rows, so no calculation in core/ can count a
    // deleted one by forgetting a filter.
    expect(await repo.categories.list()).toHaveLength(0)
    expect((await repo.load())?.categories).toHaveLength(0)
  })

  it('names the table the row came from, because an id is only unique within one', async () => {
    await repo.transactions.delete('t2' as Id, DELETED_AT)
    await repo.plans.delete(planEntry.id, DELETED_AT)

    const recorded = (await repo.deletions.list()).map((d) => `${d.entity}:${d.id}`).sort()
    expect(recorded).toEqual(['plan:p1', 'transaction:t2'])
  })

  it('records each of the five deletable kinds', async () => {
    await repo.categories.delete(food.id, DELETED_AT)
    await repo.plans.delete(planEntry.id, DELETED_AT)
    await repo.transactions.delete('t1' as Id, DELETED_AT)
    await repo.debts.delete(friend.id, DELETED_AT)
    await repo.goals.delete(rentGoal.id, DELETED_AT)

    const kinds = (await repo.deletions.list()).map((d) => d.entity).sort()
    expect(kinds).toEqual(['category', 'debt', 'goal', 'plan', 'transaction'])
  })

  it('is cleared by an import, because the dataset it referred to is gone', async () => {
    await repo.categories.delete(food.id, DELETED_AT)
    expect(await repo.deletions.list()).toHaveLength(1)

    await repo.import(snapshot)
    expect(await repo.deletions.list()).toHaveLength(0)
  })

  it('is cleared by clear()', async () => {
    await repo.categories.delete(food.id, DELETED_AT)
    await repo.clear()
    expect(await repo.deletions.list()).toHaveLength(0)
  })
})

describe('upgrading a database that already exists', () => {
  const UPGRADED_AT = '2026-10-03T06:00:00.000Z'

  /**
   * The case the migration exists for: a device that has been in use since
   * before `updatedAt` existed. Its rows have no timestamp, and version 2 has to
   * give them one **without** losing anything.
   *
   * Built as a bare version-1 Dexie database rather than through
   * `MizaniyaDatabase`, because that class is already at version 2 — using it
   * here would test the upgrade against data the upgrade had already touched.
   */
  async function seedVersionOneDatabase(name: string): Promise<void> {
    const legacy = new Dexie(name)
    legacy.version(1).stores({
      settings: '',
      categories: 'id, sortOrder',
      plans: 'id, cycleStart',
      transactions: 'id, date',
      debts: 'id',
      goals: 'id',
    })
    await legacy.open()

    const { updatedAt: _s, ...settingsV1 } = settings
    const { updatedAt: _c, ...foodV1 } = food
    const { updatedAt: _t, ...movementV1 } = spend('t1', 12_000, '2026-09-26')

    await legacy.table('settings').put(settingsV1, 'settings')
    await legacy.table('categories').put(foodV1)
    await legacy.table('transactions').put(movementV1)
    legacy.close()
  }

  it('opens the old database at version 2 instead of replacing it', async () => {
    const name = `mizaniya-upgrade-${dbCount}-a`
    await seedVersionOneDatabase(name)

    const upgraded = new MizaniyaDatabase(name, () => UPGRADED_AT)
    await upgraded.open()

    expect(upgraded.verno).toBe(2)
    // The records survived. A "migration" that started from an empty schema
    // would pass a version check and quietly lose the owner's history.
    expect(await upgraded.categories.count()).toBe(1)
    expect(await upgraded.transactions.count()).toBe(1)
    await upgraded.close()
  })

  it('backfills updatedAt on every table, including the settings singleton', async () => {
    const name = `mizaniya-upgrade-${dbCount}-b`
    await seedVersionOneDatabase(name)

    const upgraded = new MizaniyaDatabase(name, () => UPGRADED_AT)
    await upgraded.open()

    expect((await upgraded.categories.get(food.id))?.updatedAt).toBe(UPGRADED_AT)
    expect((await upgraded.transactions.get('t1'))?.updatedAt).toBe(UPGRADED_AT)
    // Settings is stored under an outbound key, so it is easy to leave out of a
    // loop over the other tables — and then one row on the device has no
    // timestamp and every comparison involving it is undefined.
    expect((await upgraded.settings.get(SETTINGS_KEY))?.updatedAt).toBe(UPGRADED_AT)
    await upgraded.close()
  })

  it('does not disturb the data it is stamping', async () => {
    const name = `mizaniya-upgrade-${dbCount}-c`
    await seedVersionOneDatabase(name)

    const upgraded = new MizaniyaDatabase(name, () => UPGRADED_AT)
    await upgraded.open()

    const movement = await upgraded.transactions.get('t1')
    expect(movement?.amount).toBe(naira(12_000))
    expect(movement?.date).toBe('2026-09-26')
    expect((await upgraded.settings.get(SETTINGS_KEY))?.takeHome).toBe(naira(450_000))
    await upgraded.close()
  })

  it('gives the whole device one timestamp, so no row beats another by accident', async () => {
    const name = `mizaniya-upgrade-${dbCount}-d`
    await seedVersionOneDatabase(name)

    const upgraded = new MizaniyaDatabase(name, () => UPGRADED_AT)
    await upgraded.open()

    const stamps = [
      (await upgraded.categories.get(food.id))?.updatedAt,
      (await upgraded.transactions.get('t1'))?.updatedAt,
      (await upgraded.settings.get(SETTINGS_KEY))?.updatedAt,
    ]
    expect(new Set(stamps).size).toBe(1)
    await upgraded.close()
  })

  it('leaves the new deletions table present and empty', async () => {
    const name = `mizaniya-upgrade-${dbCount}-e`
    await seedVersionOneDatabase(name)

    const upgraded = new MizaniyaDatabase(name, () => UPGRADED_AT)
    await upgraded.open()

    expect(await upgraded.deletions.count()).toBe(0)
    await upgraded.close()
  })
})
