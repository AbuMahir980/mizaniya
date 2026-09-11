/**
 * WHAT: The only place money is formatted, spoken or divided — kobo in, strings
 *       and rounded kobo out.
 * WHY:  One formatter (H2) and one rounding rule, because money formatted in two
 *       places eventually disagrees, and a figure rounded the wrong way tells
 *       someone they can spend money that is not there.
 * INTERVIEW: I put every money operation behind one module with the rounding
 *       direction encoded in the function name, so a caller has to choose
 *       deliberately between rounding down and rounding up.
 */

// Relative, not aliased, and deliberately so: both files live inside core/
// and move together, so this relationship never changes (ADR-008).
import type { Kobo } from '../types'

/** Construct kobo from whole naira. For seed data and tests, never from input. */
export function naira(whole: number): Kobo {
  if (!Number.isInteger(whole)) {
    throw new RangeError(`naira() takes whole naira, got ${whole}`)
  }
  return (whole * 100) as Kobo
}

/** Construct kobo from an already-integer minor amount. */
export function kobo(minor: number): Kobo {
  if (!Number.isInteger(minor)) {
    throw new RangeError(`Money is an integer number of kobo, got ${minor}`)
  }
  return minor as Kobo
}

const groups = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
})

/**
 * Split an amount into its two display parts.
 *
 * The design sets the kobo part smaller and lighter (tokens.md §4), so the two
 * are rendered as separate spans from one string — the *typography* solves the
 * width problem, not the number. See page specs §3a.
 */
export function splitMoney(amount: Kobo): { naira: string; kobo: string } {
  const negative = amount < 0
  const absolute = Math.abs(amount)
  const whole = Math.trunc(absolute / 100)
  const minor = absolute % 100
  return {
    naira: `${negative ? '-' : ''}₦${groups.format(whole)}`,
    kobo: `.${String(minor).padStart(2, '0')}`,
  }
}

/**
 * The canonical rendering: `₦1,250,000.00`.
 *
 * Always two decimals. A non-zero kobo is never hidden: in a naira-only,
 * hand-entered app a stray `.50` is almost always a typo, and showing it is what
 * makes it findable.
 *
 * **Never renders a bare minus sign for a direction.** A negative value here is
 * an arithmetic result, not a movement — callers showing direction use a word
 * ("over", "owed to you"), per page specs §8.
 */
export function formatMoney(amount: Kobo): string {
  const parts = splitMoney(amount)
  return `${parts.naira}${parts.kobo}`
}

/**
 * What a screen reader says. Never "point zero zero", never a bare minus.
 *
 * `over` turns a negative result into the word the design uses, so the spoken
 * form matches the visible one instead of inventing its own vocabulary.
 */
export function speakMoney(amount: Kobo, options?: { over?: boolean }): string {
  const absolute = Math.abs(amount)
  const whole = Math.trunc(absolute / 100)
  const minor = absolute % 100
  const head = `${groups.format(whole)} naira`
  const body = minor === 0 ? head : `${head} ${minor} kobo`
  if (options?.over || amount < 0) return `${body} over`
  return body
}

/**
 * Money the owner may spend, divided — **rounds down**.
 *
 * Overstating what is safe to spend is the direction that hurts, so the
 * remainder is always dropped rather than rounded to the nearest.
 */
export function perUnitFloor(total: Kobo, units: number): Kobo {
  if (!Number.isInteger(units) || units < 1) {
    throw new RangeError(`Units must be a positive integer, got ${units}`)
  }
  return Math.floor(total / units) as Kobo
}

/**
 * Money the owner must find, divided — **rounds up**.
 *
 * Understating what is needed to reach a target would report "on track" when it
 * is not, so the remainder always pushes the figure up.
 */
export function perUnitCeil(total: Kobo, units: number): Kobo {
  if (!Number.isInteger(units) || units < 1) {
    throw new RangeError(`Units must be a positive integer, got ${units}`)
  }
  return Math.ceil(total / units) as Kobo
}

/**
 * A proportion of an amount, in integer kobo, **dividing last**.
 *
 * This is the one that catches people. The amber threshold is 60% of the planned
 * daily allowance, and taking 60% of the *displayed* allowance gives ₦5,199.99 —
 * a rounded number rounded again. Multiplying first and dividing last gives
 * ₦5,200.00 exactly. Never round a rounded number (page specs §3a).
 */
export function proportionOf(total: Kobo, numerator: number, denominator: number): Kobo {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new RangeError('A proportion is expressed as two integers, not a float')
  }
  if (denominator < 1) throw new RangeError('Denominator must be positive')
  return Math.floor((total * numerator) / denominator) as Kobo
}

export function addMoney(...amounts: Kobo[]): Kobo {
  return amounts.reduce<number>((sum, a) => sum + a, 0) as Kobo
}

export function subtractMoney(from: Kobo, ...amounts: Kobo[]): Kobo {
  return amounts.reduce<number>((sum, a) => sum - a, from) as Kobo
}

/** Never below zero — used where a shortfall is not a negative amount. */
export function clampToZero(amount: Kobo): Kobo {
  return (amount < 0 ? 0 : amount) as Kobo
}
