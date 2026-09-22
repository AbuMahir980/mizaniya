/**
 * WHAT: The `Repository` implemented over IndexedDB, via Dexie.
 * WHY:  Returns and accepts **only** domain types — no Dexie `Table`,
 *       `Collection` or `PromiseExtended` crosses the boundary (A4). The seam
 *       is real because the types either side of it are the app's, not the
 *       library's.
 * INTERVIEW: I made the repository return plain domain objects and promises, so
 *       the interface is one a React Native or HTTP implementation could honour
 *       without pretending.
 */

import type { Repository, DateRange } from '@/core/repository'
import type {
  Category,
  Debt,
  Goal,
  Id,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
} from '@/core/types'
import { MizaniyaDatabase, SETTINGS_KEY } from './database'

export function createDexieRepository(database = new MizaniyaDatabase()): Repository {
  const db = database

  /**
   * Everything on the device, or `undefined` when there is nothing yet.
   *
   * Settings is the test for "has this device been set up", because it is the
   * one thing onboarding must write and the one thing no default can honestly
   * supply — a salary day and a take-home are answers only the owner can give.
   */
  async function readAll(): Promise<Snapshot | undefined> {
    const settings = await db.settings.get(SETTINGS_KEY)
    if (!settings) return undefined

    const [categories, plans, transactions, debts, goals] = await Promise.all([
      db.categories.toArray(),
      db.plans.toArray(),
      db.transactions.toArray(),
      db.debts.toArray(),
      db.goals.toArray(),
    ])

    return { settings, categories, plans, transactions, debts, goals }
  }

  return {
    load: readAll,

    settings: {
      async get(): Promise<Settings | undefined> {
        return db.settings.get(SETTINGS_KEY)
      },
      async put(settings: Settings): Promise<void> {
        // The key is passed separately because the table is declared outbound,
        // which keeps `Settings` free of a field that exists only for storage.
        await db.settings.put(settings, SETTINGS_KEY)
      },
    },

    categories: {
      async list(): Promise<Category[]> {
        return db.categories.toArray()
      },
      async put(category: Category): Promise<void> {
        await db.categories.put(category)
      },
      async delete(id: Id): Promise<void> {
        await db.categories.delete(id)
      },
    },

    plans: {
      async listByCycle(cycleStart: IsoDate): Promise<PlanEntry[]> {
        return db.plans.where('cycleStart').equals(cycleStart).toArray()
      },
      async put(entry: PlanEntry): Promise<void> {
        await db.plans.put(entry)
      },
      async bulkPut(entries: PlanEntry[]): Promise<void> {
        await db.plans.bulkPut(entries)
      },
      async delete(id: Id): Promise<void> {
        await db.plans.delete(id)
      },
    },

    transactions: {
      async list(range?: DateRange): Promise<Transaction[]> {
        if (!range) return db.transactions.toArray()
        // Half-open, as `DateRange` says: `from` included, `to` excluded.
        // Cycles abut, and an inclusive end would put every boundary day in two.
        return db.transactions.where('date').between(range.from, range.to, true, false).toArray()
      },
      async put(transaction: Transaction): Promise<void> {
        await db.transactions.put(transaction)
      },
      async bulkPut(transactions: Transaction[]): Promise<void> {
        await db.transactions.bulkPut(transactions)
      },
      async delete(id: Id): Promise<void> {
        await db.transactions.delete(id)
      },
    },

    debts: {
      async list(): Promise<Debt[]> {
        return db.debts.toArray()
      },
      async put(debt: Debt): Promise<void> {
        await db.debts.put(debt)
      },
      async delete(id: Id): Promise<void> {
        await db.debts.delete(id)
      },
    },

    goals: {
      async list(): Promise<Goal[]> {
        return db.goals.toArray()
      },
      async put(goal: Goal): Promise<void> {
        await db.goals.put(goal)
      },
      async delete(id: Id): Promise<void> {
        await db.goals.delete(id)
      },
    },

    /**
     * Everything, for the export file.
     *
     * Throws on an empty device rather than inventing a snapshot. There is
     * nothing to export before onboarding, and a file containing default
     * settings nobody entered would import as though the owner had answered.
     */
    async export(): Promise<Snapshot> {
      const snapshot = await readAll()
      if (!snapshot) {
        throw new Error('There is nothing to export yet — this device has no records.')
      }
      return snapshot
    },

    /**
     * Replaces everything, in **one** transaction.
     *
     * All of it lands or none of it does. A half-written import leaves records
     * that look valid and balances that are wrong, with nothing in the system
     * able to detect the difference (ADR-005) — which is the worst shape of
     * fault this app can have, because it is silent.
     *
     * The caller has already validated the file and already exported the
     * current data to disk. This method's only job is atomicity.
     */
    async import(snapshot: Snapshot): Promise<void> {
      await db.transaction('rw', db.allTables, async () => {
        await Promise.all(db.allTables.map((table) => table.clear()))

        await Promise.all([
          db.settings.put(snapshot.settings, SETTINGS_KEY),
          db.categories.bulkPut(snapshot.categories),
          db.plans.bulkPut(snapshot.plans),
          db.transactions.bulkPut(snapshot.transactions),
          db.debts.bulkPut(snapshot.debts),
          db.goals.bulkPut(snapshot.goals),
        ])
      })
    },

    async clear(): Promise<void> {
      await db.transaction('rw', db.allTables, async () => {
        await Promise.all(db.allTables.map((table) => table.clear()))
      })
    },
  }
}
