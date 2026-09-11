/**
 * WHAT: The salary cycle — where it starts and ends, how many days are left, and
 *       how many paydays fall between two dates.
 * WHY:  Calendar dates rather than instants, and `now` passed in rather than read,
 *       so a timezone can never shift a cycle boundary by a day and every figure
 *       can be tested against a fixed date.
 * INTERVIEW: I modelled the budgeting period as calendar arithmetic with the
 *       current date injected, because a cycle that moves with the device's clock
 *       or timezone is one nobody can reproduce a bug in.
 */

import type { IsoDate, Settings, TransactionType } from '../types'

/** A cycle is identified by its start date. Never by a bare month name (D4). */
export interface Cycle {
  /** First day, inclusive. */
  start: IsoDate
  /** Last day, inclusive — the day before the next salary day. */
  end: IsoDate
  /** Total days, start and end included. */
  length: number
}

interface Parts {
  year: number
  month: number // 1-12
  day: number
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseIsoDate(value: IsoDate | string): Parts {
  const match = ISO.exec(value)
  if (!match) throw new RangeError(`Expected a calendar date, YYYY-MM-DD, got "${value}"`)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(`"${value}" is not a real date`)
  }
  return { year, month, day }
}

export function toIsoDate({ year, month, day }: Parts): IsoDate {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0')
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}` as IsoDate
}

export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one. UTC throughout: there
  // is no daylight saving in UTC, so a date cannot shift under the arithmetic.
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function toUtcMillis(parts: Parts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day)
}

function fromUtcMillis(millis: number): Parts {
  const date = new Date(millis)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

const DAY_MS = 86_400_000

export function addDays(date: IsoDate, days: number): IsoDate {
  return toIsoDate(fromUtcMillis(toUtcMillis(parseIsoDate(date)) + days * DAY_MS))
}

/** Whole days from `a` to `b`. Negative when `b` is earlier. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((toUtcMillis(parseIsoDate(b)) - toUtcMillis(parseIsoDate(a))) / DAY_MS)
}

export function compareDates(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * The salary day in a given month, **clamped** to the last day.
 *
 * A salary day of the 31st becomes 28 February, or 29 in a leap year, and 30 in
 * April. It does **not** roll forward to the 1st of the next month: that would
 * leave February with no salary day and March with two, and the sequence of
 * cycles would break (D4).
 */
export function salaryDayIn(settings: Settings, year: number, month: number): IsoDate {
  assertSalaryDay(settings.salaryDay)
  return toIsoDate({ year, month, day: Math.min(settings.salaryDay, daysInMonth(year, month)) })
}

function assertSalaryDay(day: number): void {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new RangeError(`Salary day must be a whole number between 1 and 31, got ${day}`)
  }
}

function previousMonth({ year, month }: { year: number; month: number }) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

function nextMonth({ year, month }: { year: number; month: number }) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

/** The cycle containing a date. */
export function cycleFor(settings: Settings, date: IsoDate): Cycle {
  const parts = parseIsoDate(date)
  const thisMonthsSalaryDay = salaryDayIn(settings, parts.year, parts.month)

  const start =
    compareDates(date, thisMonthsSalaryDay) >= 0
      ? thisMonthsSalaryDay
      : (() => {
          const previous = previousMonth(parts)
          return salaryDayIn(settings, previous.year, previous.month)
        })()

  const startParts = parseIsoDate(start)
  const following = nextMonth(startParts)
  const nextStart = salaryDayIn(settings, following.year, following.month)

  return {
    start,
    end: addDays(nextStart, -1),
    length: daysBetween(start, nextStart),
  }
}

/** The first day of the cycle after the one containing `date`. */
export function nextCycleStart(settings: Settings, date: IsoDate): IsoDate {
  return addDays(cycleFor(settings, date).end, 1)
}

/**
 * Days remaining in the cycle, **counting today**.
 *
 * On the last day of a cycle the answer is 1, never 0 — you can still spend
 * today. That is also what stops safe-to-spend dividing by zero, so the
 * guarantee lives here rather than as a check somewhere downstream.
 */
export function daysLeft(settings: Settings, now: IsoDate): number {
  return Math.max(1, daysBetween(now, cycleFor(settings, now).end) + 1)
}

export function daysElapsed(settings: Settings, now: IsoDate): number {
  return daysBetween(cycleFor(settings, now).start, now) + 1
}

/**
 * Which cycle a movement belongs to.
 *
 * **Income** dated up to `earlyIncomeWindowDays` before a cycle starts is
 * attributed to that cycle — paid on Friday the 23rd for a cycle starting the
 * 25th still belongs to the 25th's cycle (D4).
 *
 * Only income. An expense dated before the cycle belongs to the earlier one,
 * because the money really was spent then. And only *early* payment needs a
 * rule: money arriving late is already inside the cycle that has begun.
 */
export function cycleForTransaction(
  settings: Settings,
  date: IsoDate,
  type: TransactionType,
): Cycle {
  const containing = cycleFor(settings, date)
  if (type !== 'income') return containing

  const window = settings.earlyIncomeWindowDays ?? 3
  const upcoming = addDays(containing.end, 1)
  const daysUntilNextCycle = daysBetween(date, upcoming)

  if (daysUntilNextCycle >= 1 && daysUntilNextCycle <= window) {
    return cycleFor(settings, upcoming)
  }
  return containing
}

/**
 * How many salary days fall **strictly after** `after` and **on or before**
 * `until`. This is the basis of every projection (D5).
 *
 * Seeded check: after 5 October, on or before 1 March — 25 Oct, 25 Nov, 25 Dec,
 * 25 Jan, 25 Feb — is 5. The 25 March payday falls after the due date and is
 * correctly excluded.
 */
export function paydaysBetween(settings: Settings, after: IsoDate, until: IsoDate): number {
  assertSalaryDay(settings.salaryDay)
  if (compareDates(after, until) >= 0) return 0

  let count = 0
  // Only year and month matter here — the day comes from salaryDayIn, clamped.
  const from = parseIsoDate(after)
  let cursor: { year: number; month: number } = { year: from.year, month: from.month }

  // Walk months rather than days: at most a few dozen iterations for a goal
  // years away, and no accumulation error.
  for (let guard = 0; guard < 1200; guard += 1) {
    const payday = salaryDayIn(settings, cursor.year, cursor.month)
    if (compareDates(payday, until) > 0) break
    if (compareDates(payday, after) > 0) count += 1
    cursor = nextMonth(cursor)
  }
  return count
}

/**
 * How a cycle is named on screen: by its start date, never a bare month name.
 *
 * An early salary day makes a cycle span two calendar months — 3 September to
 * 2 October is "September" to a human and is not September — so calling it by a
 * month would attribute every figure in it to the wrong place (D4).
 */
export function cycleLabel(cycle: Cycle, locale = 'en-GB'): string {
  const format = (iso: IsoDate) => {
    const { year, month, day } = parseIsoDate(iso)
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)))
  }
  return `${format(cycle.start)} – ${format(cycle.end)}`
}

/**
 * The Hijri date beside the Gregorian one.
 *
 * Pinned to `islamic-umalqura`, never the bare `islamic` alias: that is a
 * "best available" name each engine resolves for itself, and they disagree by a
 * day. A religious date that differs depending on which phone you open it on is
 * worse than no date, and nobody would ever notice.
 */
export function hijriDate(date: IsoDate, locale = 'en-GB'): string {
  const { year, month, day } = parseIsoDate(date)
  return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .replace(/\s*AH$/, '')
}
