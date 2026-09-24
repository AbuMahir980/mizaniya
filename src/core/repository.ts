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
  Deletion,
  Goal,
  Id,
  IsoDate,
  PlanEntry,
  Settings,
  Instant,
  Snapshot,
  Transaction,
  Unstamped,
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

/**
 * Every write takes `Unstamped<T>` and the instant to stamp it with.
 *
 * **Why the caller cannot pass `updatedAt` itself.** `{ ...category, name: 'Food' }`
 * is the ordinary way to edit an object, and it carries the *old* timestamp
 * forward. Nothing would fail; the row would simply stop winning the comparisons
 * it should win — a silent fault in sync, which is the worst shape available. So
 * the type refuses it.
 *
 * **Why the instant is a parameter rather than a clock inside the repository.**
 * Nothing in this codebase reads the clock where it could be told the time
 * (ADR-003): `core/` takes `now`, `buildExportFile` takes `exportedAt`,
 * `useToday()` hands the app `at` and calls it *"the instant, for stamping
 * records"*. A repository that read `Date.now()` privately would also make the
 * stored row and the in-memory row differ by a few milliseconds for no reason —
 * because `write` commits to storage first and updates memory second, and the
 * caller must be able to produce **exactly** the row that was stored. Passing the
 * instant means `stamp(row, at)` and `put(row, at)` agree by construction.
 *
 * **`import` is the exception and takes fully stamped rows.** A file's timestamps
 * are the truth about when those rows last changed. Re-stamping them on import
 * would make every row look edited at the moment of restore, and at the next sync
 * a restored backup would beat newer data that is genuinely newer.
 */
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
    put(settings: Unstamped<Settings>, at: Instant): Promise<void>
  }

  categories: {
    list(): Promise<Category[]>
    put(category: Unstamped<Category>, at: Instant): Promise<void>
    delete(id: Id, at: Instant): Promise<void>
  }

  plans: {
    listByCycle(cycleStart: IsoDate): Promise<PlanEntry[]>
    put(entry: Unstamped<PlanEntry>, at: Instant): Promise<void>
    bulkPut(entries: Unstamped<PlanEntry>[], at: Instant): Promise<void>
    delete(id: Id, at: Instant): Promise<void>
  }

  transactions: {
    /** Omit the range to list everything. */
    list(range?: DateRange): Promise<Transaction[]>
    put(transaction: Unstamped<Transaction>, at: Instant): Promise<void>
    bulkPut(transactions: Unstamped<Transaction>[], at: Instant): Promise<void>
    delete(id: Id, at: Instant): Promise<void>
  }

  debts: {
    list(): Promise<Debt[]>
    put(debt: Unstamped<Debt>, at: Instant): Promise<void>
    delete(id: Id, at: Instant): Promise<void>
  }

  goals: {
    list(): Promise<Goal[]>
    put(goal: Unstamped<Goal>, at: Instant): Promise<void>
    delete(id: Id, at: Instant): Promise<void>
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

  /**
   * Tombstones — what was deleted, and when.
   *
   * Read-only here, because nothing writes one directly: a tombstone is a
   * consequence of `delete`, and a second way to create one is a second way for
   * the two to disagree. Pruning arrives with the retention policy, in the
   * endpoint spec (ADR-010).
   */
  deletions: {
    list(): Promise<Deletion[]>
  }

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
