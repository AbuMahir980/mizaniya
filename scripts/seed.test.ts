import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  ANCHOR_CYCLE_START,
  SeedMismatch,
  build,
  checkSeed,
  cycleStartOn,
  monthsBetween,
  resetIds,
  shiftMonths,
} from './seed-scenario'
import { buildExportFile } from '../src/data/export-file'
import { checkImport } from '../src/core/schema'
import { naira } from '../src/core/money/money'
import type { Instant } from '../src/core/types'

function seeded(months = 0) {
  resetIds()
  return build(months, true)
}

describe('the seed matches the document', () => {
  it('passes its own assertions', () => {
    expect(() => checkSeed(seeded(), 0)).not.toThrow()
  })

  /**
   * The one that matters. An assertion that has only ever passed is
   * indistinguishable from one that is switched off, so this breaks a figure
   * on purpose and requires the refusal.
   */
  it('refuses when one expense is edited', () => {
    const snapshot = seeded()
    // Inside the cycle, deliberately. The first expense in the array is the
    // previous cycle's food row, which `checkSeed` is right to ignore — and
    // picking it by accident is how this test passed for the wrong reason.
    const anExpense = snapshot.transactions.find(
      (t) => t.type === 'expense' && t.date >= shiftMonths(ANCHOR_CYCLE_START, 0),
    )!
    anExpense.amount = naira(9_999)

    expect(() => checkSeed(snapshot, 0)).toThrow(SeedMismatch)
    expect(() => checkSeed(snapshot, 0)).toThrow(/₦110,000\.00/)
  })

  it('refuses when an expense moves to another category', () => {
    const snapshot = seeded()
    // The total still comes to ₦110,000.00 — only the split is wrong, which is
    // exactly the edit a sum-only check would wave through.
    const health = snapshot.transactions.find((t) => t.categoryId === 'c-health')!
    health.categoryId = 'c-sadaqah' as typeof health.categoryId

    expect(() => checkSeed(snapshot, 0)).toThrow(SeedMismatch)
  })

  it('refuses when an opening movement drifts into the cycle', () => {
    const snapshot = seeded()
    const opening = snapshot.transactions.find((t) => t.note === 'Opening balance')!
    opening.date = shiftMonths('2026-09-26', 0)

    expect(() => checkSeed(snapshot, 0)).toThrow(SeedMismatch)
  })

  it('refuses when the plan no longer sums to the take-home', () => {
    const snapshot = seeded()
    snapshot.plans[0]!.planned = naira(1)

    expect(() => checkSeed(snapshot, 0)).toThrow(/450,000/)
  })
})

describe('checked against docs/seed-data.md itself', () => {
  /** `| 1 | Fri 25 Sep | Income | — | Salary | ₦450,000.00 |` */
  function documentedMovements() {
    const doc = readFileSync('docs/seed-data.md', 'utf8')
    const section = doc.slice(doc.indexOf('### The 23 movements'))
    const table = section.slice(0, section.indexOf('\n\n', section.indexOf('|')))

    const MONTHS: Record<string, string> = { Sep: '09', Oct: '10' }
    const rows: { date: string; type: string; amount: number }[] = []

    for (const line of table.split('\n')) {
      const cells = line.split('|').map((cell) => cell.trim())
      if (cells.length < 7 || !/^\d+$/.test(cells[1] ?? '')) continue

      const [, , date, type, , , amount] = cells as string[]
      const [, day, month] = /(\d+)\s+(\w+)/.exec(date!)!
      rows.push({
        date: `2026-${MONTHS[month!]}-${day!.padStart(2, '0')}`,
        type: type!,
        amount: Math.round(Number(amount!.replace(/[₦,]/g, '')) * 100),
      })
    }
    return rows
  }

  const TYPE: Record<string, string> = {
    Income: 'income',
    Expense: 'expense',
    'Move to savings': 'savings-in',
    'I repaid': 'repaid',
  }

  it('finds all 23 rows in the document', () => {
    expect(documentedMovements()).toHaveLength(23)
  })

  it('seeds exactly the movements the document lists, row for row', () => {
    const documented = documentedMovements()
    const start = shiftMonths(ANCHOR_CYCLE_START, 0)
    const seededRows = seeded()
      .transactions.filter((t) => t.date >= start)
      .map((t) => ({ date: t.date as string, type: t.type as string, amount: t.amount as number }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount)

    const expected = documented
      .map((row) => ({ ...row, type: TYPE[row.type] ?? row.type }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount)

    expect(seededRows).toEqual(expected)
  })
})

describe('the file it writes', () => {
  it('is an export the app would actually accept', () => {
    // Through the real validator, not a shape written out again here: if the
    // schema moves, the seed stops being importable and this says so.
    const file = buildExportFile(seeded(), '2026-10-05T09:00:00.000Z' as Instant)
    const result = checkImport(JSON.parse(JSON.stringify(file)))

    expect(result.ok).toBe(true)
  })

  it('is still valid when seeded empty, which is a real state and not an error', () => {
    resetIds()
    const file = buildExportFile(build(0, false), '2026-10-05T09:00:00.000Z' as Instant)

    expect(checkImport(JSON.parse(JSON.stringify(file))).ok).toBe(true)
  })
})

describe('shifting the scenario to the current cycle', () => {
  it('moves whole months, so the salary day stays the 25th', () => {
    for (const months of [-13, -1, 0, 1, 7]) {
      expect(shiftMonths(ANCHOR_CYCLE_START, months).endsWith('-25')).toBe(true)
    }
  })

  it('still passes every assertion after the shift', () => {
    const months = monthsBetween(ANCHOR_CYCLE_START, cycleStartOn(new Date('2026-09-23')))
    expect(months).toBe(-1)
    expect(() => checkSeed(seeded(months), months)).not.toThrow()
  })

  it('clamps rather than rolling over a short month', () => {
    // 30 September shifted to February is the 28th, not the 2nd of March.
    expect(shiftMonths('2026-09-30', 5)).toBe('2027-02-28')
  })
})
