/**
 * The decision, kept apart from the network so it can be tested without GitHub.
 *
 * `gh pr checks --json` reports each check in a `bucket`. Only `pass` is a pass:
 * `skipping` and `cancel` are the two that read like success and are not, and
 * CLAUDE.md says so outright — a check that was skipped or cancelled has not
 * passed. `pending` is not a failure but it is not permission to merge either.
 */

export const BLOCKING_BUCKETS = ['fail', 'cancel', 'skipping', 'pending']

/** A bucket this script has never seen is treated as blocking, not as a pass. */
export function isPass(bucket) {
  return bucket === 'pass'
}

/**
 * @param {{name: string, bucket: string, link?: string}[]} checks
 * @returns {{green: boolean, problems: {name: string, bucket: string, link: string}[], counts: Record<string, number>}}
 */
export function classify(checks) {
  const counts = {}
  const problems = []

  for (const check of checks) {
    const bucket = check.bucket ?? 'unknown'
    counts[bucket] = (counts[bucket] ?? 0) + 1
    if (!isPass(bucket)) {
      problems.push({ name: check.name, bucket, link: check.link ?? '' })
    }
  }

  return { green: problems.length === 0, problems, counts }
}

/**
 * No checks at all is not green. A pull request whose workflows never ran looks
 * identical to one that passed if you only count failures, and that is exactly
 * how an unverified change merges.
 */
export function verdict(checks) {
  if (checks.length === 0) {
    return { green: false, reason: 'no checks have reported', problems: [], counts: {} }
  }

  const result = classify(checks)
  if (result.green) return { ...result, reason: `all ${checks.length} checks passed` }

  const worst = result.problems
    .map((p) => `${p.name} [${p.bucket}]`)
    .join(', ')
  return { ...result, reason: `not green: ${worst}` }
}
