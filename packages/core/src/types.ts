// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * An integer number of kobo. Never a float, never naira (H1).
 * ₦1,250,000.00 is 125_000_000 kobo.
 */
export type Kobo = number & { readonly __brand: 'Kobo' }

/**
 * A calendar date, `YYYY-MM-DD` — not an instant (ADR-003).
 * "The day I spent this" is a calendar fact. Storing it as a timestamp lets a
 * transaction appear to move to the previous day when the device timezone
 * shifts, which is a silent one-day error in exactly the figures that matter.
 */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

/**
 * An instant, ISO 8601 with a timezone. Used only for bookkeeping —
 * `createdAt`, `exportedAt` — never for anything a cycle calculation reads.
 */
export type Instant = string & { readonly __brand: 'Instant' }

/** Opaque identifier. Sortable by creation time. */
export type Id = string & { readonly __brand: 'Id' }

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * A category's type decides whether its allocation is protected from
 * safe-to-spend: anything that is not `expense` is protected by default (D1).
 */
export type CategoryType = 'income' | 'expense' | 'savings' | 'debt-payment'

/**
 * The eight movements. Amounts are always positive; **direction comes from the
 * type**, never from a minus sign (H5).
 *
 * Labels shown to the owner are plain speech (D7, O4):
 *   income              → "Income"
 *   expense             → "Expense"
 *   savings-in          → "Move to savings"
 *   savings-out         → "Take from savings"
 *   borrowed            → "I borrowed"
 *   repaid              → "I repaid"
 *   lent                → "I lent"
 *   repayment-received  → "They repaid me"
 */
export type TransactionType =
  | 'income'
  | 'expense'
  | 'savings-in'
  | 'savings-out'
  | 'borrowed'
  | 'repaid'
  | 'lent'
  | 'repayment-received'

/** The four debt movements, which are the ones that carry a counterparty. */
export const DEBT_TYPES = ['borrowed', 'repaid', 'lent', 'repayment-received'] as const
export type DebtTransactionType = (typeof DEBT_TYPES)[number]

/** Movements that must name a category. */
export const CATEGORY_TYPES = ['income', 'expense', 'savings-in', 'savings-out'] as const

export type SavingsDestination =
  | 'bank-vault'
  | 'cowrywise'
  | 'piggyvest'
  | 'cash-at-home'
  | 'ajo'

export type PaymentMethod = 'bank-transfer' | 'cash' | 'card' | 'wallet'

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Settings {
  /** Shown on a printed debt record. Optional — the app works without it. */
  ownerName?: string

  /** 1–31. In a short month it clamps to the last day, never rolls forward (D4). */
  salaryDay: number

  /** Expected take-home per cycle. The plan is measured against this. */
  takeHome: Kobo

  /** Amber below this proportion of the planned daily allowance. Default 0.6 (D15). */
  amberRatio: number

  /** Income arriving this many days early counts to the cycle it precedes. Default 3 (D4). */
  earlyIncomeWindowDays: number

  zakat: {
    /** Asked for, never assumed. Absent means "fall back to the first record, and say so" (D6). */
    hawlStart?: IsoDate
    /** User-editable; a local-first app has no price feed. */
    nisab?: Kobo
    /** Whether money owed to the owner counts. Undefined means "not yet asked" (D3). */
    includeReceivables?: boolean
  }

  /** Drives the export nudge, which counts unexported changes rather than days (D12). */
  lastExportedAt?: Instant

  /** Set by the repository on every write. See `Unstamped`. */
  updatedAt: Instant
}

export interface Category {
  id: Id
  name: string
  type: CategoryType
  /** Unspent allowance carries into the next cycle (D2). */
  rollsOver: boolean
  /**
   * Overrides the protection derived from `type` (D1). Undefined means "use the
   * default", which is `type !== 'expense'`.
   */
  protectedOverride?: boolean
  /** Archived categories vanish from new plans but stay in history. */
  archivedAt?: IsoDate
  sortOrder: number
  /** Set by the repository on every write. See `Unstamped`. */
  updatedAt: Instant
}

/** One planned amount, for one category, in one cycle. */
export interface PlanEntry {
  id: Id
  /** The cycle's first day. This is the cycle's identity. */
  cycleStart: IsoDate
  categoryId: Id
  planned: Kobo
  /** Set by the repository on every write. See `Unstamped`. */
  updatedAt: Instant
}

export interface Transaction {
  id: Id
  /** The calendar day the money moved. Decides which cycle it belongs to. */
  date: IsoDate
  type: TransactionType
  /** Always positive. Direction is carried by `type` (H5). */
  amount: Kobo
  /** Required for income, expense and both savings movements. */
  categoryId?: Id
  /** Required for the four debt movements. */
  debtId?: Id
  savingsDestination?: SavingsDestination
  paymentMethod?: PaymentMethod
  note?: string
  createdAt: Instant
  /**
   * Set by the repository on every write. Distinct from `createdAt`: one says
   * when the record was first made, the other when it last changed. Sync needs
   * the second, and a corrected amount changes only the second.
   */
  updatedAt: Instant
}

/**
 * One counterparty, one record — for the whole life of the relationship.
 *
 * There is deliberately **no direction field**. The balance is derived from the
 * transactions and may cross zero, which is exactly what a rotating ajo does:
 * you lend before your turn and borrow after it (D9). A stored direction would
 * have to be corrected at the crossing, and nothing would notice if it were not.
 */
export interface Debt {
  id: Id
  counterpartyName: string
  openedOn: IsoDate
  /** The agreed repayment per cycle, if there is one. */
  scheduleAmount?: Kobo
  /** Free text: "₦30,000 monthly until cleared". */
  terms?: string
  /** Optional list of names, for the written record (D10, Qur'an 2:282). */
  witnesses: string[]
  /** Set when the balance reaches zero and the owner closes it. */
  closedAt?: IsoDate
  /** Set by the repository on every write. See `Unstamped`. */
  updatedAt: Instant
}

export interface Goal {
  id: Id
  name: string
  target: Kobo
  /** Absent means "no deadline" — progress is shown, no projected gap. */
  dueDate?: IsoDate
  /** The savings category whose movements fund this goal. */
  categoryId: Id
  createdOn: IsoDate
  /** Set by the repository on every write. See `Unstamped`. */
  updatedAt: Instant
}

// ---------------------------------------------------------------------------
// Sync bookkeeping
// ---------------------------------------------------------------------------

/**
 * An entity as a **caller** supplies it — without `updatedAt`.
 *
 * `updatedAt` is set by the repository, never by a screen, and the type says so
 * rather than trusting anyone to remember. The alternative was to let callers
 * pass it, and the failure mode there is silent: `{ ...category, name: 'Food' }`
 * is the ordinary way to edit an object in React, and it carries the *old*
 * timestamp forward. Nothing would fail, and the row would simply stop winning
 * the comparisons it should win.
 */
export type Unstamped<T> = Omit<T, 'updatedAt'>

/** The entities that can be deleted. `Settings` is a singleton and cannot. */
export type DeletableEntity = 'category' | 'plan' | 'transaction' | 'debt' | 'goal'

/**
 * A record that something used to exist — a tombstone.
 *
 * **Why deletion cannot simply remove the row.** With one database, it can:
 * the row is gone and nothing else needs to know. With two, "I deleted this"
 * and "I have not heard about this yet" look identical, so a sync does the safe
 * thing and puts the row back. The deleted category reappears, and deleting it
 * again does not help.
 *
 * These live in their **own table**, deliberately, rather than as a `deletedAt`
 * column on each entity. A column would mean `Snapshot` contained deleted rows,
 * and then every derivation and every selector would have to filter them out —
 * where one forgotten filter shows deleted records or counts deleted money. In
 * a separate table, the arrays hold only live rows, **no calculation in `core/`
 * changes at all**, and a forgotten filter cannot leak what is not there.
 */
export interface Deletion {
  entity: DeletableEntity
  id: Id
  deletedAt: Instant
}

// ---------------------------------------------------------------------------
// The complete dataset
// ---------------------------------------------------------------------------

/**
 * Everything the app holds. This is what lives in memory (ADR-001), and what an
 * export writes out.
 */
export interface Snapshot {
  settings: Settings
  // Deletions are deliberately absent. An import replaces everything (ADR-005),
  // so afterwards the device matches the file exactly and a tombstone has
  // nothing left to tell anyone. They are local sync state, not user data.

  categories: Category[]
  plans: PlanEntry[]
  transactions: Transaction[]
  debts: Debt[]
  goals: Goal[]
}

/**
 * The export file format.
 *
 * `schemaVersion` is the whole point: an older file migrates forward, a newer
 * one is refused with a plain explanation rather than half-loaded (ADR-005).
 */
export interface ExportFile {
  app: 'mizaniya'
  schemaVersion: number
  exportedAt: Instant
  data: Snapshot
}

/** Bump on any change to the shapes above, and add a migration. */
export const SCHEMA_VERSION = 2
