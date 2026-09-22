/**
 * WHAT: The only door between the app and wherever its data actually lives —
 *       IndexedDB today, SQLite on mobile, an HTTP API when sync exists.
 * WHY:  Plain async CRUD, deliberately boring, because three implementations
 *       have to honour it. Anything clever here — a query language, a live
 *       subscription — would be a promise one of those three could not keep.
 * INTERVIEW: I kept the repository interface to operations every backing store
 *       can implement honestly, so the storage engine stays a detail the
 *       screens never learn about.
 */

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
} from './types'

/**
 * A half-open range of calendar dates: `from` included, `to` excluded.
 * Half-open because cycles abut — one ends exactly where the next begins, and
 * an inclusive end would put every boundary day in two cycles at once.
 */
export interface DateRange {
  from: IsoDate
  /** Exclusive. */
  to: IsoDate
}

export interface Repository {
  /**
   * Reads everything, once, at startup. The app then works from that snapshot
   * in memory and never reads again except after an external change (ADR-001).
   *
   * **`undefined` means this device holds nothing yet** — a new owner, not an
   * error. It is the signal that sends them to `/welcome` and onboarding.
   *
   * It is deliberately not a snapshot with default settings. The arrays would
   * be honestly empty, but `salaryDay` and `takeHome` are answers only the
   * owner can give, and inventing them makes Home render a cycle nobody set up
   * and divide by a take-home nobody entered. Typing the absence means a caller
   * cannot forget the new-owner case rather than merely being told not to.
   */
  load(): Promise<Snapshot | undefined>

  settings: {
    get(): Promise<Settings | undefined>
    put(settings: Settings): Promise<void>
  }

  categories: {
    list(): Promise<Category[]>
    put(category: Category): Promise<void>
    delete(id: Id): Promise<void>
  }

  plans: {
    listByCycle(cycleStart: IsoDate): Promise<PlanEntry[]>
    put(entry: PlanEntry): Promise<void>
    bulkPut(entries: PlanEntry[]): Promise<void>
    delete(id: Id): Promise<void>
  }

  transactions: {
    /** Omit the range to list everything. */
    list(range?: DateRange): Promise<Transaction[]>
    put(transaction: Transaction): Promise<void>
    bulkPut(transactions: Transaction[]): Promise<void>
    delete(id: Id): Promise<void>
  }

  debts: {
    list(): Promise<Debt[]>
    put(debt: Debt): Promise<void>
    delete(id: Id): Promise<void>
  }

  goals: {
    list(): Promise<Goal[]>
    put(goal: Goal): Promise<void>
    delete(id: Id): Promise<void>
  }

  /** Everything, for the export file. */
  export(): Promise<Snapshot>

  /**
   * Replaces everything, in a single transaction. All of it lands or none of it
   * does — a half-written import would leave records that look valid and
   * balances that are wrong, with nothing to detect the difference (ADR-005).
   *
   * The caller has already validated and migrated the file, and has already
   * exported the current data to disk before calling this.
   */
  import(snapshot: Snapshot): Promise<void>

  /** Removes everything. Used by tests and by "start again" in Settings. */
  clear(): Promise<void>
}

/**
 * Notifies other open tabs that this one has written, so they reload their
 * snapshot. Two tabs would otherwise drift apart with nothing to notice it.
 *
 * Deliberately **not** part of `Repository`: it is a property of the browser,
 * not of the store. Putting it in the interface would oblige a React Native or
 * HTTP implementation to fake something it has no equivalent for.
 */
export interface ChangeNotifier {
  announce(): void
  subscribe(onChange: () => void): () => void
}
