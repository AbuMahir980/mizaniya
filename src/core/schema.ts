/**
 * WHAT: Runtime validation for every type in `types.ts`, and the guard an
 *       imported file must pass before a single row of it is written.
 * WHY:  TypeScript vanishes at compile time. A file chosen from disk is data
 *       from outside the app, so the only thing standing between a corrupt or
 *       hand-edited file and the owner's records is a check that actually runs.
 * INTERVIEW: I validated imported data at the boundary with a runtime schema,
 *       because static types cannot protect you from a file a user picks.
 */

import { z } from 'zod'
import { SCHEMA_VERSION, DEBT_TYPES, CATEGORY_TYPES } from './types'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** A whole number of kobo, never negative, never a float (H1, H5). */
export const koboSchema = z.number().int().nonnegative()

/** `YYYY-MM-DD`, and a real date — 2026-02-30 is rejected. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a calendar date, YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  }, 'Not a real date')

export const instantSchema = z.string().datetime({ offset: true })
export const idSchema = z.string().min(1).max(64)

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const categoryTypeSchema = z.enum(['income', 'expense', 'savings', 'debt-payment'])

export const transactionTypeSchema = z.enum([
  'income',
  'expense',
  'savings-in',
  'savings-out',
  'borrowed',
  'repaid',
  'lent',
  'repayment-received',
])

export const savingsDestinationSchema = z.enum([
  'bank-vault',
  'cowrywise',
  'piggyvest',
  'cash-at-home',
  'ajo',
])

export const paymentMethodSchema = z.enum(['bank-transfer', 'cash', 'card', 'wallet'])

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  ownerName: z.string().min(1).max(120).optional(),
  salaryDay: z.number().int().min(1).max(31),
  takeHome: koboSchema,
  amberRatio: z.number().min(0).max(1).default(0.6),
  earlyIncomeWindowDays: z.number().int().min(0).max(10).default(3),
  zakat: z
    .object({
      hawlStart: isoDateSchema.optional(),
      nisab: koboSchema.optional(),
      includeReceivables: z.boolean().optional(),
    })
    .default({}),
  lastExportedAt: instantSchema.optional(),
})

export const categorySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(60),
  type: categoryTypeSchema,
  rollsOver: z.boolean(),
  protectedOverride: z.boolean().optional(),
  archivedAt: isoDateSchema.optional(),
  sortOrder: z.number().int(),
})

export const planEntrySchema = z.object({
  id: idSchema,
  cycleStart: isoDateSchema,
  categoryId: idSchema,
  planned: koboSchema,
})

/**
 * A movement names a category or a counterparty, depending on its type — and
 * never neither. Enforcing it here means an import cannot introduce a debt
 * payment with no debt attached, which would sit in the data looking valid and
 * quietly break every balance derived from it.
 */
export const transactionSchema = z
  .object({
    id: idSchema,
    date: isoDateSchema,
    type: transactionTypeSchema,
    amount: koboSchema.refine((value) => value > 0, 'An amount must be greater than zero'),
    categoryId: idSchema.optional(),
    debtId: idSchema.optional(),
    savingsDestination: savingsDestinationSchema.optional(),
    paymentMethod: paymentMethodSchema.optional(),
    note: z.string().max(500).optional(),
    createdAt: instantSchema,
  })
  .superRefine((transaction, ctx) => {
    const needsCategory = (CATEGORY_TYPES as readonly string[]).includes(transaction.type)
    const needsDebt = (DEBT_TYPES as readonly string[]).includes(transaction.type)

    if (needsCategory && !transaction.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: `A ${transaction.type} movement must name a category`,
      })
    }
    if (needsDebt && !transaction.debtId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['debtId'],
        message: `A ${transaction.type} movement must name a counterparty`,
      })
    }
    if (transaction.savingsDestination && !transaction.type.startsWith('savings-')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['savingsDestination'],
        message: 'Only a savings movement carries a destination',
      })
    }
  })

export const debtSchema = z.object({
  id: idSchema,
  counterpartyName: z.string().min(1).max(120),
  openedOn: isoDateSchema,
  scheduleAmount: koboSchema.optional(),
  terms: z.string().max(500).optional(),
  witnesses: z.array(z.string().min(1).max(120)).default([]),
  closedAt: isoDateSchema.optional(),
})

export const goalSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(60),
  target: koboSchema,
  dueDate: isoDateSchema.optional(),
  categoryId: idSchema,
  createdOn: isoDateSchema,
})

// ---------------------------------------------------------------------------
// The dataset and the export file
// ---------------------------------------------------------------------------

export const snapshotSchema = z.object({
  settings: settingsSchema,
  categories: z.array(categorySchema),
  plans: z.array(planEntrySchema),
  transactions: z.array(transactionSchema),
  debts: z.array(debtSchema),
  goals: z.array(goalSchema),
})

export const exportFileSchema = z.object({
  app: z.literal('mizaniya'),
  schemaVersion: z.number().int().positive(),
  exportedAt: instantSchema,
  data: snapshotSchema,
})

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export type ImportRefusal =
  | { reason: 'not-mizaniya' }
  | { reason: 'too-new'; fileVersion: number; appVersion: number }
  | { reason: 'malformed'; issues: string[] }

export type ImportCheck =
  | { ok: true; file: z.infer<typeof exportFileSchema>; migrationsNeeded: number }
  | { ok: false; refusal: ImportRefusal }

/**
 * Decides whether a parsed file may be imported. It changes nothing — the
 * caller runs migrations and writes in a single transaction (ADR-005).
 *
 * A file from a newer version is refused outright rather than partially read.
 * Loading what we recognise and ignoring the rest would silently discard the
 * owner's data while appearing to succeed, which is the worst outcome available.
 */
export function checkImport(parsed: unknown): ImportCheck {
  const result = exportFileSchema.safeParse(parsed)

  if (!result.success) {
    const looksForeign =
      typeof parsed !== 'object' || parsed === null || !('app' in parsed) ||
      (parsed as { app?: unknown }).app !== 'mizaniya'

    if (looksForeign) return { ok: false, refusal: { reason: 'not-mizaniya' } }

    return {
      ok: false,
      refusal: {
        reason: 'malformed',
        issues: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      },
    }
  }

  if (result.data.schemaVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      refusal: {
        reason: 'too-new',
        fileVersion: result.data.schemaVersion,
        appVersion: SCHEMA_VERSION,
      },
    }
  }

  return {
    ok: true,
    file: result.data,
    migrationsNeeded: SCHEMA_VERSION - result.data.schemaVersion,
  }
}
