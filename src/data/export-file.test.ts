import { describe, expect, it } from 'vitest'
import { readExportText, serialiseExport, MIGRATIONS } from './export-file'
import { SCHEMA_VERSION } from '@/core/types'

/**
 * A file written by schema 1: no `updatedAt` on anything, because the field did
 * not exist. Written out longhand rather than built from the current types —
 * the point of this suite is what an **old** file looks like, and a fixture
 * derived from today's types would silently follow them forward and stop being
 * the thing under test.
 */
const V1_EXPORTED_AT = '2026-09-20T07:30:00.000Z'

const v1File = {
  app: 'mizaniya',
  schemaVersion: 1,
  exportedAt: V1_EXPORTED_AT,
  data: {
    settings: {
      salaryDay: 25,
      takeHome: 45_000_000,
      amberRatio: 0.6,
      earlyIncomeWindowDays: 3,
      zakat: {},
    },
    categories: [
      { id: 'c-food', name: 'Food and groceries', type: 'expense', rollsOver: true, sortOrder: 0 },
    ],
    plans: [{ id: 'p1', cycleStart: '2026-09-25', categoryId: 'c-food', planned: 9_000_000 }],
    transactions: [
      {
        id: 't1',
        date: '2026-09-25',
        type: 'expense',
        amount: 1_200_000,
        categoryId: 'c-food',
        createdAt: '2026-09-25T09:00:00.000Z',
      },
    ],
    debts: [
      {
        id: 'd-friend',
        counterpartyName: 'A. Friend',
        openedOn: '2026-07-01',
        scheduleAmount: 3_000_000,
        witnesses: [],
      },
    ],
    goals: [
      {
        id: 'g-rent',
        name: 'Annual rent',
        target: 90_000_000,
        categoryId: 'c-food',
        createdOn: '2026-08-24',
      },
    ],
  },
}

const readV1 = () => readExportText(JSON.stringify(v1File))

describe('the chain has a first step', () => {
  it('carries a migration to the current version', () => {
    // If this fails, every file already on someone's disk has become unreadable.
    expect(MIGRATIONS.map((m) => m.to)).toContain(SCHEMA_VERSION)
  })
})

describe('a file written by schema 1', () => {
  it('still imports — the criterion most likely to be missed', () => {
    const result = readV1()
    if (!result.ok) throw new Error(`refused: ${JSON.stringify(result.refusal)}`)
    expect(result.fileVersion).toBe(1)
  })

  it('reports the version the file was, not the version it became', () => {
    const result = readV1()
    if (!result.ok) throw new Error('expected ok')
    expect(result.fileVersion).toBe(1)
    expect(result.fileVersion).not.toBe(SCHEMA_VERSION)
  })

  it('gives every row an updatedAt, taken from when the file was written', () => {
    const result = readV1()
    if (!result.ok) throw new Error('expected ok')
    const { settings, categories, plans, transactions, debts, goals } = result.data

    /**
     * `exportedAt` rather than "now". It is not when each row truly last
     * changed — nothing can recover that — but it is the best available upper
     * bound, and it is **the same for every row**, so no row in an old file
     * spuriously beats another at the first sync.
     */
    expect(settings.updatedAt).toBe(V1_EXPORTED_AT)
    for (const row of [...categories, ...plans, ...transactions, ...debts, ...goals]) {
      expect(row.updatedAt).toBe(V1_EXPORTED_AT)
    }
  })

  it('leaves every figure and date exactly as the file had them', () => {
    const result = readV1()
    if (!result.ok) throw new Error('expected ok')
    // A migration that adds a field must not quietly alter money.
    expect(result.data.transactions[0]!.amount).toBe(1_200_000)
    expect(result.data.transactions[0]!.date).toBe('2026-09-25')
    expect(result.data.transactions[0]!.createdAt).toBe('2026-09-25T09:00:00.000Z')
    expect(result.data.plans[0]!.planned).toBe(9_000_000)
    expect(result.data.settings.takeHome).toBe(45_000_000)
  })

  it('does not confuse createdAt with updatedAt', () => {
    const result = readV1()
    if (!result.ok) throw new Error('expected ok')
    const movement = result.data.transactions[0]!
    // One says when the record was made, the other when it last changed. A
    // migration that collapsed them would look right and break edit tracking.
    expect(movement.createdAt).not.toBe(movement.updatedAt)
  })
})

describe('what it still refuses', () => {
  it('refuses a version it has no step for, rather than guessing', () => {
    const ancient = serialiseExport({ ...v1File, schemaVersion: 0 } as never)
    const result = readExportText(ancient)
    if (result.ok) throw new Error('expected a refusal')
    expect(result.refusal.reason).toBe('malformed')
  })

  it('refuses a file from the future, and says which versions', () => {
    const newer = serialiseExport({ ...v1File, schemaVersion: 99 } as never)
    const result = readExportText(newer)
    if (result.ok) throw new Error('expected a refusal')
    if (result.refusal.reason !== 'too-new') throw new Error('expected too-new')
    expect(result.refusal.fileVersion).toBe(99)
    expect(result.refusal.appVersion).toBe(SCHEMA_VERSION)
  })

  it('refuses a file that is not ours', () => {
    const result = readExportText(JSON.stringify({ app: 'something-else', schemaVersion: 1 }))
    if (result.ok) throw new Error('expected a refusal')
    expect(result.refusal.reason).toBe('not-mizaniya')
  })

  it('refuses contents that are broken, even at a version it can migrate', () => {
    /**
     * This is the check the reordering had to preserve. Migrations now run
     * before validation, so the validation has to be what stands between a
     * migrated file and the database — not a check that already ran.
     */
    const broken = JSON.parse(JSON.stringify(v1File)) as typeof v1File
    ;(broken.data.transactions[0] as { amount: number }).amount = -5
    const result = readExportText(JSON.stringify(broken))
    if (result.ok) throw new Error('expected a refusal — a negative amount is not importable')
    expect(result.refusal.reason).toBe('malformed')
  })

  it('refuses unparseable text without throwing', () => {
    const result = readExportText('{ not json')
    if (result.ok) throw new Error('expected a refusal')
    expect(result.refusal.reason).toBe('malformed')
  })
})
