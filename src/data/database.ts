/**
 * WHAT: The Dexie database — its tables, its indexes, and its migration chain.
 * WHY:  The **only** file besides the repository that names Dexie, and ESLint
 *       fails the build if that spreads (A4). Everything above it sees the
 *       `Repository` interface and never learns what is underneath.
 * INTERVIEW: I kept the storage library inside one folder behind an interface,
 *       so swapping IndexedDB for SQLite at v2 touches two files rather than
 *       every screen.
 */

import Dexie, { type Table } from 'dexie'
import type {
  Category,
  Debt,
  Deletion,
  Goal,
  PlanEntry,
  Settings,
  Transaction,
} from '@/core/types'

/**
 * Settings is a singleton, but a table stores rows.
 *
 * It gets one fixed key, declared **outbound** (`''`) so the key lives beside
 * the record rather than inside it. An inbound key would mean adding an `id`
 * field to `Settings` purely to satisfy the database — a storage detail leaking
 * into a domain type the mobile app also has to implement.
 */
export const SETTINGS_KEY = 'settings'

export class MizaniyaDatabase extends Dexie {
  settings!: Table<Settings, string>
  categories!: Table<Category, string>
  plans!: Table<PlanEntry, string>
  transactions!: Table<Transaction, string>
  debts!: Table<Debt, string>
  goals!: Table<Goal, string>
  deletions!: Table<Deletion, [string, string]>

  /**
   * `stampedAt` is the instant version 2's upgrade writes onto rows that predate
   * `updatedAt`. Injected so the migration can be tested against a fixed time;
   * a backfill nobody can pin down is a backfill nobody can assert on.
   */
  constructor(name = 'mizaniya', stampedAt: () => string = () => new Date().toISOString()) {
    super(name)

    /**
     * Version 1, and the chain starts here.
     *
     * Declaring it explicitly looks like ceremony when there is only one
     * version, and it is the whole point: Dexie replays versions in order to
     * bring a database at any older version forward. A `.version(2)` added
     * later needs a `.version(1)` to have been declared, or there is no chain
     * to extend — only a fresh schema and no route from the old one.
     *
     * Indexes are only what the `Repository` actually queries by: `date` for
     * `transactions.list(range)`, `cycleStart` for `plans.listByCycle`. An
     * index nothing queries is a write cost with no reader.
     */
    this.version(1).stores({
      settings: '',
      categories: 'id, sortOrder',
      plans: 'id, cycleStart',
      transactions: 'id, date',
      debts: 'id',
      goals: 'id',
    })

    /**
     * Version 2 — sync needs to know *when* (ADR-010).
     *
     * Two additions. Every row gains `updatedAt`, because a device cannot work
     * out which of two versions of a row is newer without it. And deletions are
     * recorded in their own table, because "I deleted this" and "I have never
     * seen this" are indistinguishable between two databases, so a sync puts the
     * row back — and a deleted category reappears.
     *
     * **A table, not a `deletedAt` column.** A column would put deleted rows
     * into the snapshot, and then every calculation and every selector would
     * have to filter them; one forgotten filter shows deleted records or counts
     * deleted money. Here the rows are simply gone, so nothing in `core/`
     * changes and no filter can be forgotten.
     *
     * `[entity+id]` is the key because an id is only unique within its own
     * table, and one deletions table holds all five.
     */
    this.version(2)
      .stores({
        deletions: '[entity+id], deletedAt',
      })
      .upgrade(async (tx) => {
        const at = stampedAt()

        /**
         * Existing rows get the moment of the upgrade. It is not when they last
         * really changed — nothing can recover that — but it is the same value
         * for every row, so no row spuriously beats another, and it is honest
         * about being the first moment this device could vouch for them.
         */
        await Promise.all(
          ['categories', 'plans', 'transactions', 'debts', 'goals'].map((table) =>
            tx
              .table(table)
              .toCollection()
              .modify((row: Record<string, unknown>) => {
                row.updatedAt = at
              }),
          ),
        )

        await tx
          .table('settings')
          .toCollection()
          .modify((row: Record<string, unknown>) => {
            row.updatedAt = at
          })
      })
  }

  /** Every table, for the operations that touch all of them at once. */
  get allTables(): Table<unknown, string>[] {
    return [
      this.settings as Table<unknown, string>,
      this.categories as Table<unknown, string>,
      this.plans as Table<unknown, string>,
      this.transactions as Table<unknown, string>,
      this.debts as Table<unknown, string>,
      this.goals as Table<unknown, string>,
      // Included so `clear()` and `import()` wipe tombstones with everything
      // else. An import replaces the whole dataset, and a tombstone left behind
      // refers to a row from data that no longer exists.
      this.deletions as unknown as Table<unknown, string>,
    ]
  }
}
