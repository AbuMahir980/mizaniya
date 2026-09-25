import { describe, expect, it } from 'vitest'
import {
  addDays,
  compareDates,
  cycleFor,
  cycleForTransaction,
  cycleLabel,
  daysBetween,
  daysElapsed,
  daysInMonth,
  daysLeft,
  hijriDate,
  nextCycleStart,
  parseIsoDate,
  paydaysBetween,
  salaryDayIn,
} from './cycle'
import type { IsoDate, Settings } from '../types'

const d = (value: string) => value as IsoDate

/** The seeded owner: paid on the 25th, three-day early window. */
const seeded = { salaryDay: 25, earlyIncomeWindowDays: 3 } as unknown as Settings
const onThe31st = { salaryDay: 31, earlyIncomeWindowDays: 3 } as unknown as Settings
const onThe29th = { salaryDay: 29, earlyIncomeWindowDays: 3 } as unknown as Settings

describe('date primitives', () => {
  it('rejects anything that is not a real date', () => {
    expect(() => parseIsoDate('2026-02-30')).toThrow(RangeError)
    expect(() => parseIsoDate('2026-13-01')).toThrow(RangeError)
    expect(() => parseIsoDate('05/10/2026')).toThrow(RangeError)
  })

  it('knows the length of a month, leap years included', () => {
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2028, 2)).toBe(29)
    expect(daysInMonth(2026, 4)).toBe(30)
  })

  it('adds days across a month and a year boundary', () => {
    expect(addDays(d('2026-09-30'), 1)).toBe('2026-10-01')
    expect(addDays(d('2026-12-31'), 1)).toBe('2027-01-01')
    expect(addDays(d('2027-01-01'), -1)).toBe('2026-12-31')
  })

  it('counts days between dates', () => {
    expect(daysBetween(d('2026-09-25'), d('2026-10-24'))).toBe(29)
    expect(daysBetween(d('2026-10-24'), d('2026-09-25'))).toBe(-29)
    expect(compareDates(d('2026-01-01'), d('2026-01-01'))).toBe(0)
  })
})

describe('salary day, clamped', () => {
  it('clamps the 31st to the last day of a short month', () => {
    expect(salaryDayIn(onThe31st, 2026, 2)).toBe('2026-02-28')
    expect(salaryDayIn(onThe31st, 2026, 4)).toBe('2026-04-30')
    expect(salaryDayIn(onThe31st, 2026, 3)).toBe('2026-03-31')
  })

  it('clamps to 29 February in a leap year, not 28', () => {
    expect(salaryDayIn(onThe31st, 2028, 2)).toBe('2028-02-29')
    expect(salaryDayIn(onThe29th, 2028, 2)).toBe('2028-02-29')
    expect(salaryDayIn(onThe29th, 2026, 2)).toBe('2026-02-28')
  })

  it('never rolls forward into the next month', () => {
    // Rolling to 1 March would leave February with no salary day and March with
    // two, and the sequence of cycles would break.
    expect(salaryDayIn(onThe31st, 2026, 2).startsWith('2026-02')).toBe(true)
  })

  it('refuses an impossible salary day', () => {
    expect(() => salaryDayIn({ salaryDay: 0 } as unknown as Settings, 2026, 1)).toThrow(RangeError)
    expect(() => salaryDayIn({ salaryDay: 32 } as unknown as Settings, 2026, 1)).toThrow(RangeError)
  })
})

describe('the cycle containing a date', () => {
  it('is the seeded 25 September to 24 October', () => {
    const cycle = cycleFor(seeded, d('2026-10-05'))
    expect(cycle.start).toBe('2026-09-25')
    expect(cycle.end).toBe('2026-10-24')
    expect(cycle.length).toBe(30)
  })

  it('starts today when today is the salary day', () => {
    const cycle = cycleFor(seeded, d('2026-09-25'))
    expect(cycle.start).toBe('2026-09-25')
  })

  it('belongs to the previous cycle on the day before the salary day', () => {
    const cycle = cycleFor(seeded, d('2026-09-24'))
    expect(cycle.start).toBe('2026-08-25')
    expect(cycle.end).toBe('2026-09-24')
  })

  it('crosses a year boundary', () => {
    const cycle = cycleFor(seeded, d('2027-01-03'))
    expect(cycle.start).toBe('2026-12-25')
    expect(cycle.end).toBe('2027-01-24')
  })

  it('handles a clamped salary day without losing or doubling a cycle', () => {
    const january = cycleFor(onThe31st, d('2026-02-10'))
    expect(january.start).toBe('2026-01-31')
    expect(january.end).toBe('2026-02-27')

    const february = cycleFor(onThe31st, d('2026-03-01'))
    expect(february.start).toBe('2026-02-28')
    expect(february.end).toBe('2026-03-30')

    // Every day between them belongs to exactly one of the two.
    expect(addDays(january.end, 1)).toBe(february.start)
  })

  it('gives the next cycle start', () => {
    expect(nextCycleStart(seeded, d('2026-10-05'))).toBe('2026-10-25')
  })
})

describe('days left counts today', () => {
  it('is 20 on the worked day', () => {
    expect(daysLeft(seeded, d('2026-10-05'))).toBe(20)
  })

  it('is 1 on the last day of the cycle, never 0', () => {
    expect(daysLeft(seeded, d('2026-10-24'))).toBe(1)
  })

  it('is the full length on the salary day', () => {
    expect(daysLeft(seeded, d('2026-09-25'))).toBe(30)
  })

  it('never returns zero, whatever the date', () => {
    for (let day = 25; day <= 30; day += 1) {
      expect(daysLeft(seeded, d(`2026-09-${day}`))).toBeGreaterThan(0)
    }
  })

  it('counts elapsed days from the start, inclusive', () => {
    expect(daysElapsed(seeded, d('2026-09-25'))).toBe(1)
    expect(daysElapsed(seeded, d('2026-10-05'))).toBe(11)
  })
})

describe('the early-income window', () => {
  it('attributes income 3 days early to the cycle it precedes', () => {
    const cycle = cycleForTransaction(seeded, d('2026-09-22'), 'income')
    expect(cycle.start).toBe('2026-09-25')
  })

  it('does not attribute income 4 days early', () => {
    const cycle = cycleForTransaction(seeded, d('2026-09-21'), 'income')
    expect(cycle.start).toBe('2026-08-25')
  })

  it('is inclusive at exactly one day early', () => {
    expect(cycleForTransaction(seeded, d('2026-09-24'), 'income').start).toBe('2026-09-25')
  })

  it('applies to income only — an expense belongs to the cycle it fell in', () => {
    // The money really was spent then, so it stays where it was spent.
    expect(cycleForTransaction(seeded, d('2026-09-23'), 'expense').start).toBe('2026-08-25')
    expect(cycleForTransaction(seeded, d('2026-09-23'), 'repaid').start).toBe('2026-08-25')
  })

  it('needs no rule for late payment — it is already inside the cycle', () => {
    expect(cycleForTransaction(seeded, d('2026-09-28'), 'income').start).toBe('2026-09-25')
  })
})

describe('counting paydays', () => {
  it('finds the 5 paydays before the rent is due', () => {
    // 25 Oct, 25 Nov, 25 Dec, 25 Jan, 25 Feb. The 25 March payday falls after
    // the due date and is excluded.
    expect(paydaysBetween(seeded, d('2026-10-05'), d('2027-03-01'))).toBe(5)
  })

  it('excludes the start date and includes the end date', () => {
    expect(paydaysBetween(seeded, d('2026-09-25'), d('2026-10-25'))).toBe(1)
    expect(paydaysBetween(seeded, d('2026-09-24'), d('2026-10-24'))).toBe(1)
  })

  it('is zero when the range is empty or backwards', () => {
    expect(paydaysBetween(seeded, d('2026-10-05'), d('2026-10-05'))).toBe(0)
    expect(paydaysBetween(seeded, d('2027-03-01'), d('2026-10-05'))).toBe(0)
  })

  it('counts a clamped payday exactly once', () => {
    expect(paydaysBetween(onThe31st, d('2026-01-31'), d('2026-03-31'))).toBe(2)
  })
})

describe('naming a cycle', () => {
  it('uses the start date, never a bare month', () => {
    expect(cycleLabel(cycleFor(seeded, d('2026-10-05')))).toBe('25 Sept – 24 Oct')
  })

  it('still reads correctly when a cycle spans two calendar months', () => {
    const early = { salaryDay: 3, earlyIncomeWindowDays: 3 } as unknown as Settings
    expect(cycleLabel(cycleFor(early, d('2026-09-15')))).toBe('3 Sept – 2 Oct')
  })
})

describe('the Hijri date', () => {
  it('is 24 Rabi II 1448 on 5 October 2026', () => {
    expect(hijriDate(d('2026-10-05'))).toMatch(/^24 Rabi. II 1448$/)
  })

  it('drops the AH suffix and keeps the calendar pinned', () => {
    expect(hijriDate(d('2026-10-05'))).not.toMatch(/AH/)
  })
})
