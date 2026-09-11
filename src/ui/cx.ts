/**
 * WHAT: Joins class names, dropping anything falsy.
 * WHY:  Six lines instead of a dependency. `clsx` is excellent and this is the
 *       whole of what we need from it, so N1's question — "why not the platform?"
 *       — answers itself.
 * INTERVIEW: I wrote the six-line version rather than adding a package for it,
 *       because every dependency has to earn its place in the bundle.
 */

export type ClassValue = string | false | null | undefined

export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
