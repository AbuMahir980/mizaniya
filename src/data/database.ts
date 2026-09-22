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
import type { Category, Debt, Goal, PlanEntry, Settings, Transaction } from '@/core/types'

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

  constructor(name = 'mizaniya') {
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
    ]
  }
}
