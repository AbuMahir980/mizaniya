import { describe, expect, it } from 'vitest'
import {
  MOVEMENT_LABELS,
  MOVEMENT_ORDER,
  emptyDraft,
  needsCategory,
  needsCounterparty,
  parseAmount,
  problemWith,
  takesDestination,
  toTransaction,
  type MovementDraft,
} from './movement-draft'
import { naira } from '@/core/money/money'
import type { Id, Instant, IsoDate } from '@/core/types'

const TODAY = '2026-10-05' as IsoDate
const AT = '2026-10-05T09:00:00.000Z' as Instant
const ctx = { id: 'new-id', at: AT }

function draftOf(over: Partial<MovementDraft> = {}): MovementDraft {
  return { ...emptyDraft(TODAY), ...over }
}

describe('the defaults do the work', () => {
  it('opens as an expense, dated today', () => {
    const draft = emptyDraft(TODAY)
    // So the common case is ⊕ → a chip → Save.
    expect(draft.type).toBe('expense')
    expect(draft.date).toBe(TODAY)
    expect(draft.typed).toBe('')
  })

  it('names all eight movements in the owner’s words (D7, O4)', () => {
    expect(MOVEMENT_ORDER).toHaveLength(8)
    expect(MOVEMENT_LABELS.repaid).toBe('I repaid')
    expect(MOVEMENT_LABELS['repayment-received']).toBe('They repaid me')
    // "Spent", not "Expense". Nobody says "I made an expense".
    expect(MOVEMENT_LABELS.expense).toBe('Spent')
  })
})

describe('parsing what was typed', () => {
  it('reads plain naira as kobo', () => {
    expect(parseAmount('2000')).toBe(naira(2_000))
    expect(parseAmount('2000.50')).toBe(200_050)
  })

  it('ignores the naira sign, commas and spaces', () => {
    expect(parseAmount('₦2,000')).toBe(naira(2_000))
    expect(parseAmount(' 2 000 ')).toBe(naira(2_000))
  })

  it('is undefined — not zero — for anything it cannot read', () => {
    // "Not a number" and "zero" get different messages, so they must stay
    // distinguishable here.
    expect(parseAmount('abc')).toBeUndefined()
    expect(parseAmount('')).toBeUndefined()
    expect(parseAmount('1.234')).toBeUndefined()
  })
})

describe('what stops a save', () => {
  it('asks for an amount before anything else', () => {
    expect(problemWith(draftOf())).toEqual({ field: 'amount', message: 'Enter an amount.' })
  })

  it('separates “not a number” from “nothing entered”', () => {
    expect(problemWith(draftOf({ typed: 'abc' }))?.message).toBe('Amounts are numbers only.')
    expect(problemWith(draftOf({ typed: '0' }))?.message).toBe('Enter an amount.')
  })

  it('wants a category for the four category movements', () => {
    for (const type of ['expense', 'income', 'savings-in', 'savings-out'] as const) {
      expect(needsCategory(type)).toBe(true)
      expect(problemWith(draftOf({ typed: '2000', type }))?.field).toBe('category')
    }
  })

  it('wants a counterparty for the four debt movements', () => {
    for (const type of ['borrowed', 'repaid', 'lent', 'repayment-received'] as const) {
      expect(needsCounterparty(type)).toBe(true)
      expect(problemWith(draftOf({ typed: '2000', type }))?.field).toBe('counterparty')
    }
  })

  it('reports one problem at a time, in the order the fields are met', () => {
    // Amount and category both missing: only the amount is reported, because a
    // wall of faults on a sheet this small turns a correction into a chore.
    const both = problemWith(draftOf({ typed: '' }))
    expect(both?.field).toBe('amount')
  })

  it('is satisfied once the draft is complete', () => {
    const ready = draftOf({ typed: '2000', categoryId: 'c-food' as Id })
    expect(problemWith(ready)).toBeUndefined()
  })
})

describe('the movement it becomes', () => {
  it('carries the category for a category movement, and no debt', () => {
    const t = toTransaction(draftOf({ typed: '2,000', categoryId: 'c-food' as Id }), ctx)

    expect(t.amount).toBe(naira(2_000))
    expect(t.categoryId).toBe('c-food')
    expect('debtId' in t).toBe(false)
    expect(t.date).toBe(TODAY)
    expect(t.createdAt).toBe(AT)
  })

  it('carries the counterparty for a debt movement, and no category', () => {
    const t = toTransaction(
      draftOf({ typed: '30000', type: 'repaid', debtId: 'd-friend' as Id }),
      ctx,
    )

    expect(t.type).toBe('repaid')
    expect(t.debtId).toBe('d-friend')
    expect('categoryId' in t).toBe(false)
  })

  it('carries a destination only for savings movements', () => {
    expect(takesDestination('savings-in')).toBe(true)
    expect(takesDestination('expense')).toBe(false)

    const saved = toTransaction(
      draftOf({
        typed: '75000',
        type: 'savings-in',
        categoryId: 'c-rent' as Id,
        savingsDestination: 'bank-vault',
      }),
      ctx,
    )
    expect(saved.savingsDestination).toBe('bank-vault')

    // A destination left over from a previous type is not carried through.
    const spent = toTransaction(
      draftOf({ typed: '2000', categoryId: 'c-food' as Id, savingsDestination: 'ajo' }),
      ctx,
    )
    expect('savingsDestination' in spent).toBe(false)
  })

  it('drops an empty note rather than storing whitespace', () => {
    const t = toTransaction(draftOf({ typed: '2000', categoryId: 'c' as Id, note: '   ' }), ctx)
    expect('note' in t).toBe(false)
  })

  it('refuses to build a movement from a draft that is not ready', () => {
    // A function that can return something invalid invites skipping the check.
    expect(() => toTransaction(draftOf({ typed: '' }), ctx)).toThrow(/not ready/)
  })
})
