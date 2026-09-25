import { CATEGORY_TYPES, DEBT_TYPES } from '@mizaniya/core/types'
import type {
  Id,
  Instant,
  IsoDate,
  Kobo,
  PaymentMethod,
  SavingsDestination,
  Transaction,
  TransactionType,
  Unstamped,
} from '@mizaniya/core/types'

/** The eight, in the words the owner uses for them (D7, O4). */
export const MOVEMENT_LABELS: Record<TransactionType, string> = {
  expense: 'Spent',
  income: 'Received',
  'savings-in': 'Moved to savings',
  'savings-out': 'Took from savings',
  borrowed: 'I borrowed',
  repaid: 'I repaid',
  lent: 'I lent',
  'repayment-received': 'They repaid me',
}

/** Expense first: it is the default, and the common case by a distance. */
export const MOVEMENT_ORDER: TransactionType[] = [
  'expense',
  'income',
  'savings-in',
  'savings-out',
  'borrowed',
  'repaid',
  'lent',
  'repayment-received',
]

export function needsCategory(type: TransactionType): boolean {
  return (CATEGORY_TYPES as readonly string[]).includes(type)
}

export function needsCounterparty(type: TransactionType): boolean {
  return (DEBT_TYPES as readonly string[]).includes(type)
}

export function takesDestination(type: TransactionType): boolean {
  return type === 'savings-in' || type === 'savings-out'
}

export interface MovementDraft {
  /** As typed, so what the owner sees is what they entered. */
  typed: string
  type: TransactionType
  date: IsoDate
  categoryId?: Id
  debtId?: Id
  savingsDestination?: SavingsDestination
  paymentMethod?: PaymentMethod
  note?: string
}

export function emptyDraft(today: IsoDate): MovementDraft {
  // Expense and today, so the common case is three taps: ⊕, a chip, Save.
  return { typed: '', type: 'expense', date: today }
}

/**
 * Naira as typed, to integer kobo.
 *
 * Returns `undefined` rather than 0 for anything unparseable, so "not a number"
 * and "zero" stay distinguishable — they get different messages.
 */
export function parseAmount(typed: string): Kobo | undefined {
  const cleaned = typed.replace(/[₦,\s]/g, '')
  if (cleaned === '') return undefined
  if (!/^\d*\.?\d{0,2}$/.test(cleaned)) return undefined

  const value = Number.parseFloat(cleaned)
  if (!Number.isFinite(value)) return undefined
  return Math.round(value * 100) as Kobo
}

export type DraftProblem =
  | { field: 'amount'; message: string }
  | { field: 'category'; message: string }
  | { field: 'counterparty'; message: string }

/**
 * What is stopping this from being saved, or nothing.
 *
 * One problem at a time, in the order the owner meets the fields. Listing every
 * fault at once on a sheet this small turns a correction into a wall.
 */
export function problemWith(draft: MovementDraft): DraftProblem | undefined {
  const amount = parseAmount(draft.typed)

  if (draft.typed.trim() === '') return { field: 'amount', message: 'Enter an amount.' }
  if (amount === undefined) return { field: 'amount', message: 'Amounts are numbers only.' }
  if (amount <= 0) return { field: 'amount', message: 'Enter an amount.' }

  if (needsCategory(draft.type) && !draft.categoryId) {
    return { field: 'category', message: 'Choose a category.' }
  }
  if (needsCounterparty(draft.type) && !draft.debtId) {
    return { field: 'counterparty', message: 'Choose who this is with.' }
  }
  return undefined
}

/**
 * The movement, once there is nothing wrong with the draft.
 *
 * Throws rather than returning a half-built transaction: the caller has already
 * asked `problemWith`, and a function that can return something invalid invites
 * someone to skip the check.
 */
export function toTransaction(
  draft: MovementDraft,
  ctx: { id: string; at: Instant },
): Unstamped<Transaction> {
  const problem = problemWith(draft)
  if (problem) throw new Error(`Draft is not ready to save: ${problem.message}`)

  const amount = parseAmount(draft.typed) as Kobo

  return {
    id: ctx.id as Id,
    date: draft.date,
    type: draft.type,
    amount,
    ...(needsCategory(draft.type) && draft.categoryId ? { categoryId: draft.categoryId } : {}),
    ...(needsCounterparty(draft.type) && draft.debtId ? { debtId: draft.debtId } : {}),
    ...(takesDestination(draft.type) && draft.savingsDestination
      ? { savingsDestination: draft.savingsDestination }
      : {}),
    ...(draft.paymentMethod ? { paymentMethod: draft.paymentMethod } : {}),
    ...(draft.note?.trim() ? { note: draft.note.trim() } : {}),
    createdAt: ctx.at,
  }
}
