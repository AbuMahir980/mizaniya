/**
 * The decision, kept apart from the network so it can be tested without GitHub.
 *
 * `gh pr checks --json` reports each check in a `bucket`. Only `pass` is a pass:
 * `skipping` and `cancel` are the two that read like success and are not, and
 * CLAUDE.md says so outright — a check that was skipped or cancelled has not
 * passed. `pending` is not a failure but it is not permission to merge either.
 */

export const BLOCKING_BUCKETS = ['fail', 'cancel', 'skipping', 'pending']

/**
 * The subset that is a *settled* problem. A merge gate blocks on `pending` too —
 * a check still running has not passed. An alarm must not fire on it, or it cries
 * wolf every time CI starts and the real failures stop being read.
 */
export const SETTLED_BLOCKING_BUCKETS = ['fail', 'cancel', 'skipping']

/** A bucket this script has never seen is treated as blocking, not as a pass. */
export function isPass(bucket) {
  return bucket === 'pass'
}

/**
 * The line Peer AI's gate prints when a work item simply has not been reviewed yet.
 * That failure means "waiting on the reviewer", not "the code is broken", and the
 * two were indistinguishable in this script's output until the owner had to ask
 * twice which one he was looking at.
 */
export const PEER_AI_GATE_SIGNATURE = "isn't verified and reviewed yet"

/**
 * Split settled problems into the gate waiting and something actually broken.
 *
 * `isGateFailure` does the looking-up, so this stays pure and testable. It must
 * answer false when it cannot tell: calling a real failure a gate is the one
 * mistake here that loses information, and neither caller may merge on either.
 */
export function splitGate(problems, isGateFailure) {
  const gate = []
  const broken = []
  for (const problem of problems) {
    if (problem.bucket === 'fail' && isGateFailure(problem)) gate.push(problem)
    else broken.push(problem)
  }
  return { gate, broken }
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
export function verdict(checks, { ignorePending = false } = {}) {
  if (checks.length === 0) {
    return { green: false, waiting: false, reason: 'no checks have reported', problems: [], counts: {} }
  }

  const result = classify(checks)
  if (result.green) {
    return { ...result, waiting: false, reason: `all ${checks.length} checks passed` }
  }

  const settled = result.problems.filter((p) => p.bucket !== 'pending')

  // Nothing settled against it, only checks still running. A gate still refuses;
  // an alarm stays quiet and waits for them to land.
  if (ignorePending && settled.length === 0) {
    const pending = result.problems.length
    return {
      ...result,
      green: false,
      waiting: true,
      reason: `${pending} check${pending === 1 ? '' : 's'} still running`,
    }
  }

  const worst = (ignorePending ? settled : result.problems)
    .map((p) => `${p.name} [${p.bucket}]`)
    .join(', ')
  return { ...result, problems: ignorePending ? settled : result.problems, waiting: false, reason: `not green: ${worst}` }
}
