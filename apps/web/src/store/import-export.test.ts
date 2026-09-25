import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createImportExport, type SaveableFile } from './import-export'
import { createSnapshotStore, type SnapshotStore } from './snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { MizaniyaDatabase } from '@/data/database'
import { buildExportFile, serialiseExport } from '@/data/export-file'
import { cashLeft, cycleAt, safeToSpend, spendingByCategory } from '@mizaniya/core/budget/budget'
import { SCHEMA_VERSION } from '@mizaniya/core/types'
import { balanceOf } from '@mizaniya/core/debt/debt'
import { projectedGap } from '@mizaniya/core/goal/goal'
import { estimate } from '@mizaniya/core/zakat/zakat'
import { formatMoney, naira } from '@mizaniya/core/money/money'
import type { ChangeNotifier, Repository } from '@mizaniya/core/repository'
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
} from '@mizaniya/core/types'

/** One fixed instant for every fixture here, so `updatedAt` never moves between runs. */
const STAMPED_AT = '2026-09-24T09:00:00.000Z' as Instant

const TODAY = '2026-10-05' as IsoDate
const NOW = '2026-10-05T09:00:00.000Z' as Instant

const settings: Settings = {
  salaryDay: 25,
  takeHome: naira(450_000),
  amberRatio: 0.6,
  earlyIncomeWindowDays: 3,
  zakat: { nisab: naira(2_450_000) },
  updatedAt: STAMPED_AT,
}

const rentCat: Category = {
  id: 'c-rent' as Id,
  name: 'Rent fund',
  type: 'savings',
  rollsOver: false,
  sortOrder: 0,
  updatedAt: STAMPED_AT,
}
const foodCat: Category = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 1,
  updatedAt: STAMPED_AT,
}
const salaryCat: Category = {
  id: 'c-salary' as Id,
  name: 'Salary',
  type: 'income',
  rollsOver: false,
  sortOrder: 2,
  updatedAt: STAMPED_AT,
}

const plans: PlanEntry[] = [
  {
    id: 'p1' as Id,
    cycleStart: '2026-09-25' as IsoDate,
    categoryId: rentCat.id,
    planned: naira(75_000),
    updatedAt: STAMPED_AT,
  },
  {
    id: 'p2' as Id,
    cycleStart: '2026-09-25' as IsoDate,
    categoryId: foodCat.id,
    planned: naira(90_000),
    updatedAt: STAMPED_AT,
  },
]

const friend: Debt = {
  id: 'd-friend' as Id,
  counterpartyName: 'A. Friend',
  openedOn: '2026-07-01' as IsoDate,
  scheduleAmount: naira(30_000),
  witnesses: ['Witness One'],
  updatedAt: STAMPED_AT,
}

const rentGoal: Goal = {
  id: 'g-rent' as Id,
  name: 'Annual rent',
  target: naira(900_000),
  dueDate: '2027-03-01' as IsoDate,
  categoryId: rentCat.id,
  createdOn: '2026-08-24' as IsoDate,
  updatedAt: STAMPED_AT,
}

function tx(
  id: string,
  type: Transaction['type'],
  whole: number,
  date: string,
  extra: Partial<Transaction> = {},
): Transaction {
  return {
    id: id as Id,
    date: date as IsoDate,
    type,
    amount: naira(whole),
    updatedAt: STAMPED_AT,
    createdAt: `${date}T09:00:00.000Z` as Instant,
    ...extra,
  }
}

/** A dataset rich enough that every `core/` figure has something to say. */
const seeded: Snapshot = {
  settings,
  categories: [rentCat, foodCat, salaryCat],
  plans,
  transactions: [
    tx('t1', 'income', 450_000, '2026-09-25', { categoryId: salaryCat.id }),
    tx('t2', 'savings-in', 400_000, '2026-09-24', { categoryId: rentCat.id }),
    tx('t3', 'savings-in', 75_000, '2026-09-26', { categoryId: rentCat.id }),
    tx('t4', 'expense', 78_000, '2026-09-28', { categoryId: foodCat.id }),
    tx('t5', 'borrowed', 120_000, '2026-09-24', { debtId: friend.id }),
    tx('t6', 'repaid', 30_000, '2026-09-26', { debtId: friend.id }),
  ],
  debts: [friend],
  goals: [rentGoal],
}

function silentNotifier(): ChangeNotifier {
  return { announce: () => {}, subscribe: () => () => {} }
}

/** Every figure the owner would actually see, as strings. */
function figuresOf(snapshot: Snapshot) {
  const cycle = cycleAt(snapshot, TODAY)
  const safe = safeToSpend(snapshot, TODAY)
  return {
    cashLeft: formatMoney(cashLeft(snapshot, cycle)),
    safeToSpend: JSON.stringify(safe),
    categories: JSON.stringify(spendingByCategory(snapshot, cycle)),
    friendBalance: formatMoney(balanceOf(snapshot, friend.id)),
    rentGoal: JSON.stringify(projectedGap(snapshot, rentGoal, TODAY)),
    zakat: JSON.stringify(estimate(snapshot)),
  }
}

let dbCount = 0
let sourceDb: MizaniyaDatabase
let sourceRepo: Repository
let sourceStore: SnapshotStore

beforeEach(async () => {
  dbCount += 1
  sourceDb = new MizaniyaDatabase(`mizaniya-io-src-${dbCount}`)
  sourceRepo = createDexieRepository(sourceDb)
  await sourceDb.open()
  await sourceRepo.import(seeded)
  sourceStore = createSnapshotStore(sourceRepo, silentNotifier()).api
  await sourceStore.initialise()
})

afterEach(async () => {
  sourceStore.dispose()
  await sourceDb.delete()
})

describe('export', () => {
  it('carries the app name, the schema version and when it was made', async () => {
    const io = createImportExport(sourceStore)
    const saved = await io.exportNow(NOW, TODAY)

    expect(saved).toBeDefined()
    expect(saved?.file.app).toBe('mizaniya')
    expect(saved?.file.schemaVersion).toBe(SCHEMA_VERSION)
    expect(saved?.file.exportedAt).toBe(NOW)
  })

  it('is named the way the refusal copy tells people to look for', async () => {
    const io = createImportExport(sourceStore)
    const saved = await io.exportNow(NOW, TODAY)
    expect(saved?.name).toBe('mizaniya-export-2026-10-05.json')
  })

  it('records lastExportedAt through the store, so it reaches storage', async () => {
    const io = createImportExport(sourceStore)
    await io.exportNow(NOW, TODAY)

    // In memory…
    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    expect(sourceStore.state.snapshot.settings.lastExportedAt).toBe(NOW)

    // …and actually written, not just held.
    const stored = await sourceRepo.settings.get()
    expect(stored?.lastExportedAt).toBe(NOW)
  })
})

describe('M3 — the round trip', () => {
  it('export, import into an empty database, every figure identical', async () => {
    const io = createImportExport(sourceStore)
    const saved = await io.exportNow(NOW, TODAY)
    if (!saved) throw new Error('expected a file')

    // A brand new device, with nothing on it.
    const freshDb = new MizaniyaDatabase(`mizaniya-io-fresh-${dbCount}`)
    const freshRepo = createDexieRepository(freshDb)
    await freshDb.open()
    const fresh = createSnapshotStore(freshRepo, silentNotifier()).api
    await fresh.initialise()
    expect(fresh.state.status).toBe('new-owner')

    const freshIo = createImportExport(fresh)
    const outcome = await freshIo.importFrom(saved.text, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {
        throw new Error('nothing should be backed up on an empty device')
      },
    })

    expect(outcome.kind).toBe('imported')
    if (outcome.kind !== 'imported') throw new Error('expected imported')
    expect(outcome.counts).toEqual({
      movements: 6,
      categories: 3,
      plans: 2,
      debts: 1,
      goals: 1,
    })
    // Nothing to back up on an empty device, so no copy was made.
    expect(outcome.safetyCopy).toBeUndefined()

    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    if (fresh.state.status !== 'ready') throw new Error('expected ready')

    // The figures, not the rows. This is the assertion that matters.
    expect(figuresOf(fresh.state.snapshot)).toEqual(figuresOf(sourceStore.state.snapshot))

    fresh.dispose()
    await freshDb.delete()
  })
})

describe('refusals — and nothing changes', () => {
  async function importInto(text: string) {
    const io = createImportExport(sourceStore)
    const before = sourceStore.state.status === 'ready' ? sourceStore.state.snapshot : undefined
    const outcome = await io.importFrom(text, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {},
    })
    return { outcome, before }
  }

  it('refuses a file that is not a Mizaniya export', async () => {
    const { outcome, before } = await importInto(JSON.stringify({ app: 'something-else' }))

    expect(outcome.kind).toBe('refused')
    if (outcome.kind !== 'refused') throw new Error('expected refused')
    expect(outcome.refusal.reason).toBe('not-mizaniya')

    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    expect(sourceStore.state.snapshot).toBe(before)
  })

  it('refuses a file from a newer version, and says which', async () => {
    const newer = { ...buildExportFile(seeded, NOW), schemaVersion: 99 }
    const { outcome, before } = await importInto(serialiseExport(newer))

    if (outcome.kind !== 'refused') throw new Error('expected refused')
    expect(outcome.refusal.reason).toBe('too-new')
    if (outcome.refusal.reason !== 'too-new') throw new Error('expected too-new')
    expect(outcome.refusal.fileVersion).toBe(99)
    expect(outcome.refusal.appVersion).toBe(SCHEMA_VERSION)

    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    expect(sourceStore.state.snapshot).toBe(before)
  })

  it('refuses a damaged file rather than reading what it can', async () => {
    const corrupt = serialiseExport(buildExportFile(seeded, NOW)).slice(0, 200)
    const { outcome, before } = await importInto(corrupt)

    if (outcome.kind !== 'refused') throw new Error('expected refused')
    expect(outcome.refusal.reason).toBe('malformed')

    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    expect(sourceStore.state.snapshot).toBe(before)
  })

  it('refuses a Mizaniya file whose contents are wrong', async () => {
    const broken = buildExportFile(seeded, NOW) as unknown as Record<string, unknown>
    broken.data = { ...seeded, transactions: [{ id: 'x', amount: -5 }] }
    const { outcome } = await importInto(JSON.stringify(broken))

    if (outcome.kind !== 'refused') throw new Error('expected refused')
    // Recognised as ours, so the owner is told it is damaged rather than foreign.
    expect(outcome.refusal.reason).toBe('malformed')
  })

  it('a refusal never touches storage either', async () => {
    const rowsBefore = await sourceRepo.transactions.list()
    await importInto(JSON.stringify({ nope: true }))
    expect(await sourceRepo.transactions.list()).toHaveLength(rowsBefore.length)
  })
})

describe('the safety copy is taken before anything is replaced', () => {
  it('hands over the current data first, then imports', async () => {
    const order: string[] = []
    const io = createImportExport(sourceStore)

    const incoming = serialiseExport(
      buildExportFile(
        { ...seeded, transactions: [tx('only', 'income', 1_000, '2026-09-25', { categoryId: salaryCat.id })] },
        NOW,
      ),
    )

    const outcome = await io.importFrom(incoming, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async (file: SaveableFile) => {
        // The copy still holds the data that is about to be overwritten.
        expect(file.file.data.transactions).toHaveLength(6)
        order.push('saved')
      },
    })

    order.push('imported')
    expect(order).toEqual(['saved', 'imported'])
    expect(outcome.kind).toBe('imported')
    if (outcome.kind !== 'imported') throw new Error('expected imported')
    expect(outcome.safetyCopy?.file.data.transactions).toHaveLength(6)
  })

  it('does not import at all if the safety copy could not be saved', async () => {
    const io = createImportExport(sourceStore)
    const before = sourceStore.state.status === 'ready' ? sourceStore.state.snapshot : undefined

    const incoming = serialiseExport(
      buildExportFile({ ...seeded, transactions: [] }, NOW),
    )

    const outcome = await io.importFrom(incoming, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {
        throw new Error('The disk is full.')
      },
    })

    expect(outcome.kind).toBe('failed')
    if (outcome.kind !== 'failed') throw new Error('expected failed')
    expect(outcome.message).toContain('nothing was replaced')

    // A backup that failed silently would be worse than none, because it was
    // relied on. So the data is exactly as it was.
    if (sourceStore.state.status !== 'ready') throw new Error('expected ready')
    expect(sourceStore.state.snapshot).toBe(before)
    expect(await sourceRepo.transactions.list()).toHaveLength(6)
  })
})

describe('a failed write leaves the database untouched', () => {
  it('reports failure and keeps every existing row', async () => {
    const failing: Repository = {
      ...sourceRepo,
      import: async () => {
        throw new Error('Storage is full.')
      },
    }
    const store = createSnapshotStore(failing, silentNotifier()).api
    await store.initialise()
    const io = createImportExport(store)

    const incoming = serialiseExport(buildExportFile({ ...seeded, transactions: [] }, NOW))
    const outcome = await io.importFrom(incoming, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {},
    })

    expect(outcome.kind).toBe('failed')
    if (outcome.kind !== 'failed') throw new Error('expected failed')
    expect(outcome.message).toBe('Storage is full.')

    // The real repository still has everything.
    expect(await sourceRepo.transactions.list()).toHaveLength(6)
    store.dispose()
  })
})

describe('the migration chain', () => {
  it('loads a file at the current version with no migration needed', async () => {
    const io = createImportExport(sourceStore)
    const saved = await io.exportNow(NOW, TODAY)
    if (!saved) throw new Error('expected a file')
    expect(saved.file.schemaVersion).toBe(SCHEMA_VERSION)

    const outcome = await io.importFrom(saved.text, {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {},
    })
    expect(outcome.kind).toBe('imported')
  })

  it('refuses rather than guessing when a step is missing', async () => {
    // A version-0 file: older than anything, with no migration to bring it up.
    const ancient = { ...buildExportFile(seeded, NOW), schemaVersion: 0 }
    const io = createImportExport(sourceStore)
    const outcome = await io.importFrom(serialiseExport(ancient), {
      now: NOW,
      today: TODAY,
      saveSafetyCopy: async () => {},
    })

    // Importing data shaped for an older version unchanged is the exact failure
    // the version field exists to prevent.
    expect(outcome.kind).toBe('refused')
  })
})
