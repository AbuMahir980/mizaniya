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
  DeletableEntity,
  Debt,
  Deletion,
  Goal,
  Id,
  Instant,
  IsoDate,
  PlanEntry,
  Settings,
  Snapshot,
  Transaction,
  Unstamped,
} from '@/core/types'
import { stamp, stampAll } from '@/core/sync/stamp'
import { MizaniyaDatabase, SETTINGS_KEY } from './database'

export function createDexieRepository(database = new MizaniyaDatabase()): Repository {
  const db = database

  /**
   * Records that a row used to exist, in the same transaction that removes it.
   *
   * Both together or neither. A row removed with no tombstone is a deletion that
   * can never reach another device; a tombstone with the row still present is a
   * record that contradicts itself. Either half alone is worse than neither.
   */
  async function removeAndRecord(
    table: { delete(id: string): Promise<void> },
    entity: DeletableEntity,
    id: Id,
    at: Instant,
  ): Promise<void> {
    await db.transaction('rw', [table as never, db.deletions as never], async () => {
      await table.delete(id)
      await db.deletions.put({ entity, id, deletedAt: at })
    })
  }

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
      async put(settings: Unstamped<Settings>, at: Instant): Promise<void> {
        // The key is passed separately because the table is declared outbound,
        // which keeps `Settings` free of a field that exists only for storage.
        await db.settings.put(stamp<Settings>(settings, at), SETTINGS_KEY)
      },
    },

    categories: {
      async list(): Promise<Category[]> {
        return db.categories.toArray()
      },
      async put(category: Unstamped<Category>, at: Instant): Promise<void> {
        await db.categories.put(stamp<Category>(category, at))
      },
      async delete(id: Id, at: Instant): Promise<void> {
        await removeAndRecord(db.categories, 'category', id, at)
      },
    },

    plans: {
      async listByCycle(cycleStart: IsoDate): Promise<PlanEntry[]> {
        return db.plans.where('cycleStart').equals(cycleStart).toArray()
      },
      async put(entry: Unstamped<PlanEntry>, at: Instant): Promise<void> {
        await db.plans.put(stamp<PlanEntry>(entry, at))
      },
      async bulkPut(entries: Unstamped<PlanEntry>[], at: Instant): Promise<void> {
        await db.plans.bulkPut(stampAll<PlanEntry>(entries, at))
      },
      async delete(id: Id, at: Instant): Promise<void> {
        await removeAndRecord(db.plans, 'plan', id, at)
      },
    },

    transactions: {
      async list(range?: DateRange): Promise<Transaction[]> {
        if (!range) return db.transactions.toArray()
        // Half-open, as `DateRange` says: `from` included, `to` excluded.
        // Cycles abut, and an inclusive end would put every boundary day in two.
        return db.transactions.where('date').between(range.from, range.to, true, false).toArray()
      },
      async put(transaction: Unstamped<Transaction>, at: Instant): Promise<void> {
        await db.transactions.put(stamp<Transaction>(transaction, at))
      },
      async bulkPut(transactions: Unstamped<Transaction>[], at: Instant): Promise<void> {
        await db.transactions.bulkPut(stampAll<Transaction>(transactions, at))
      },
      async delete(id: Id, at: Instant): Promise<void> {
        await removeAndRecord(db.transactions, 'transaction', id, at)
      },
    },

    debts: {
      async list(): Promise<Debt[]> {
        return db.debts.toArray()
      },
      async put(debt: Unstamped<Debt>, at: Instant): Promise<void> {
        await db.debts.put(stamp<Debt>(debt, at))
      },
      async delete(id: Id, at: Instant): Promise<void> {
        await removeAndRecord(db.debts, 'debt', id, at)
      },
    },

    goals: {
      async list(): Promise<Goal[]> {
        return db.goals.toArray()
      },
      async put(goal: Unstamped<Goal>, at: Instant): Promise<void> {
        await db.goals.put(stamp<Goal>(goal, at))
      },
      async delete(id: Id, at: Instant): Promise<void> {
        await removeAndRecord(db.goals, 'goal', id, at)
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
        // Nothing stamps these rows: the file's own timestamps are the truth
        // about when they last changed. Re-stamping on restore would make every
        // row look edited just now, and a restored backup would then beat data
        // that is genuinely newer at the first sync.

      })
    },

    deletions: {
      async list(): Promise<Deletion[]> {
        return db.deletions.toArray()
      },
    },

    async clear(): Promise<void> {
      await db.transaction('rw', db.allTables, async () => {
        await Promise.all(db.allTables.map((table) => table.clear()))
      })
    },
  }
}
