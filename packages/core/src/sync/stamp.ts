import type { Instant, Unstamped } from '../types'

/**
 * Adds the `updatedAt` a caller is not allowed to set itself.
 *
 * `at` is passed in rather than read from the clock, because `core/` never reads
 * the clock (ADR-003) — and because a test that cannot fix the time cannot assert
 * anything useful about which of two writes won.
 *
 * The cast is unavoidable and narrow: TypeScript cannot see that
 * `Omit<T, 'updatedAt'> & { updatedAt: Instant }` is `T`, though it is by
 * construction. Nothing else about the row is touched.
 */
export function stamp<T extends { updatedAt: Instant }>(row: Unstamped<T>, at: Instant): T {
  return { ...row, updatedAt: at } as T
}

/** `stamp`, over a list. */
export function stampAll<T extends { updatedAt: Instant }>(
  rows: Unstamped<T>[],
  at: Instant,
): T[] {
  return rows.map((row) => stamp<T>(row, at))
}
