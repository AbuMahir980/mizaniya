import { describe, expect, it } from 'vitest'
import {
  addMoney,
  clampToZero,
  formatMoney,
  kobo,
  naira,
  perUnitCeil,
  perUnitFloor,
  proportionOf,
  speakMoney,
  splitMoney,
  subtractMoney,
} from './money'

describe('construction', () => {
  it('rejects fractional naira and fractional kobo', () => {
    expect(() => naira(1.5)).toThrow(RangeError)
    expect(() => kobo(0.5)).toThrow(RangeError)
  })

  it('naira converts to kobo', () => {
    expect(naira(450_000)).toBe(45_000_000)
  })
})

describe('formatting', () => {
  it('always shows two decimals', () => {
    expect(formatMoney(naira(7_500))).toBe('₦7,500.00')
    expect(formatMoney(naira(1_250_000))).toBe('₦1,250,000.00')
    expect(formatMoney(kobo(0))).toBe('₦0.00')
  })

  it('never hides a non-zero kobo', () => {
    expect(formatMoney(kobo(750_050))).toBe('₦7,500.50')
  })

  it('splits into the parts the design sizes separately', () => {
    expect(splitMoney(naira(7_500))).toEqual({ naira: '₦7,500', kobo: '.00' })
  })
})

describe('speaking', () => {
  it('says naira, not the symbol, and never point zero zero', () => {
    expect(speakMoney(naira(7_500))).toBe('7,500 naira')
  })

  it('announces a non-zero kobo', () => {
    expect(speakMoney(kobo(750_050))).toBe('7,500 naira 50 kobo')
  })

  it('uses the word "over" rather than a minus sign', () => {
    expect(speakMoney(kobo(-230_000))).toBe('2,300 naira over')
    expect(speakMoney(naira(2_300), { over: true })).toBe('2,300 naira over')
  })
})

describe('rounding direction', () => {
  it('money you may spend rounds down', () => {
    // The planned daily allowance: ₦260,000.00 over 30 days.
    expect(formatMoney(perUnitFloor(naira(260_000), 30))).toBe('₦8,666.66')
  })

  it('money you must find rounds up', () => {
    // ₦425,000.00 still needed for rent, across 5 remaining paydays.
    expect(formatMoney(perUnitCeil(naira(425_000), 5))).toBe('₦85,000.00')
  })

  it('rounds up rather than to the nearest when finding money', () => {
    expect(perUnitCeil(kobo(1_001), 10)).toBe(101)
    expect(perUnitFloor(kobo(1_009), 10)).toBe(100)
  })

  it('refuses to divide by zero days', () => {
    expect(() => perUnitFloor(naira(100), 0)).toThrow(RangeError)
  })
})

describe('never round a rounded number', () => {
  it('the amber threshold is ₦5,200.00, computed by dividing last', () => {
    const spendable = naira(260_000)
    expect(formatMoney(proportionOf(spendable, 6, 10 * 30))).toBe('₦5,200.00')
  })

  it('and would be ₦5,199.99 if taken from the displayed allowance', () => {
    const displayedAllowance = perUnitFloor(naira(260_000), 30)
    expect(formatMoney(proportionOf(displayedAllowance, 6, 10))).toBe('₦5,199.99')
  })

  it('rejects a float proportion, which is how the error creeps in', () => {
    expect(() => proportionOf(naira(100), 0.6 as unknown as number, 1)).toThrow(RangeError)
  })
})

describe('the worked scenario from docs/seed-data.md', () => {
  const takeHome = naira(450_000)
  const spent = naira(110_000)
  const saved = naira(90_000)
  const debtPaid = naira(30_000)
  const protectedRemaining = naira(70_000)

  it('cash left is ₦220,000.00', () => {
    expect(formatMoney(subtractMoney(takeHome, spent, saved, debtPaid))).toBe(
      '₦220,000.00',
    )
  })

  it('safe to spend is ₦150,000.00 in total and ₦7,500.00 a day', () => {
    const cashLeft = subtractMoney(takeHome, spent, saved, debtPaid)
    const safe = subtractMoney(cashLeft, protectedRemaining)
    expect(formatMoney(safe)).toBe('₦150,000.00')
    expect(formatMoney(perUnitFloor(safe, 20))).toBe('₦7,500.00')
  })

  it('the amber variant lands at ₦5,000.00 a day, below the threshold', () => {
    const cashLeft = subtractMoney(takeHome, naira(160_000), saved, debtPaid)
    const safe = subtractMoney(cashLeft, protectedRemaining)
    const perDay = perUnitFloor(safe, 20)
    expect(formatMoney(perDay)).toBe('₦5,000.00')
    expect(perDay).toBeLessThan(proportionOf(naira(260_000), 6, 300))
  })

  it('the expense split sums to ₦110,000.00', () => {
    const split = [14_000, 38_250, 40_000, 4_750, 5_000, 8_000, 0, 0].map(naira)
    expect(formatMoney(addMoney(...split))).toBe('₦110,000.00')
  })

  it('the rent projection is ₦850,000.00, leaving ₦50,000.00 short', () => {
    const saved_ = naira(475_000)
    const projected = addMoney(saved_, ...Array<number>(5).fill(0).map(() => naira(75_000)))
    expect(formatMoney(projected)).toBe('₦850,000.00')
    expect(formatMoney(subtractMoney(naira(900_000), projected))).toBe('₦50,000.00')
  })

  it('and closing that gap needs ₦85,000.00 a payday', () => {
    const stillNeeded = subtractMoney(naira(900_000), naira(475_000))
    expect(formatMoney(perUnitCeil(stillNeeded, 5))).toBe('₦85,000.00')
  })
})

describe('clamping', () => {
  it('a shortfall never shows as a negative allowance', () => {
    expect(clampToZero(kobo(-500))).toBe(0)
    expect(clampToZero(naira(5))).toBe(500)
  })
})
