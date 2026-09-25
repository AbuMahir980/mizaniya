import { describe, expect, it } from 'vitest'
import { stamp, stampAll } from './stamp'
import type { Category, Id, Instant, Unstamped } from '../types'

const EARLIER = '2026-09-01T00:00:00.000Z' as Instant
const LATER = '2026-09-24T09:00:00.000Z' as Instant

const food: Unstamped<Category> = {
  id: 'c-food' as Id,
  name: 'Food and groceries',
  type: 'expense',
  rollsOver: true,
  sortOrder: 0,
}

describe('stamp', () => {
  it('adds the instant it is given', () => {
    expect(stamp<Category>(food, LATER).updatedAt).toBe(LATER)
  })

  it('leaves everything else exactly as it was', () => {
    const { updatedAt: _ignored, ...rest } = stamp<Category>(food, LATER)
    expect(rest).toEqual(food)
  })

  it('overwrites a timestamp that is already there, rather than keeping it', () => {
    /**
     * The whole point. `{ ...category, name: 'New' }` is the ordinary way to
     * edit an object and it carries the **old** timestamp forward. If stamping
     * preserved that, the row would silently stop winning the comparisons it
     * should win — which is a wrong answer no test would notice, because
     * nothing throws and every figure still adds up.
     */
    const stale = { ...food, updatedAt: EARLIER } as Unstamped<Category>
    expect(stamp<Category>(stale, LATER).updatedAt).toBe(LATER)
  })

  it('does not mutate what it was given', () => {
    const before = { ...food }
    stamp<Category>(food, LATER)
    expect(food).toEqual(before)
    expect('updatedAt' in food).toBe(false)
  })
})

describe('stampAll', () => {
  it('gives every row the same instant', () => {
    const rows = stampAll<Category>([food, { ...food, id: 'c-transport' as Id }], LATER)
    expect(rows.map((row) => row.updatedAt)).toEqual([LATER, LATER])
  })

  it('returns an empty list unchanged', () => {
    expect(stampAll<Category>([], LATER)).toEqual([])
  })
})
