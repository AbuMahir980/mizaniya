import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

const ENV_VAR = 'MIZANIYA_FORBIDDEN_TERMS'

/** Files with no text to read. Everything else is scanned, lockfile included. */
const BINARY = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.icns',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.gz', '.mp4', '.webm', '.mp3',
])

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

const terms = (process.env[ENV_VAR] ?? '')
  .split(',')
  .map((term) => term.trim().toLowerCase())
  .filter((term) => term.length > 0)

if (terms.length === 0) {
  /**
   * Nothing loaded is a failure, not a warning.
   *
   * This exited 0 with a warning for the first month of the repository's life,
   * and the warning scrolled past inside a green run nobody read to the end —
   * so rule 3 went unenforced from the first commit until the day the secret
   * was finally set, and there was a live violation waiting the whole time.
   * That is issue #111, and the lesson is that the degrade-to-warning path is
   * what hid it. A check that could not run did not pass.
   *
   * The mechanism itself is proved on every run by
   * `scripts/check-repo-rules.test.mjs`, which plants an invented term and
   * requires a non-zero exit. So this branch is not guarding against a broken
   * scanner — it is guarding against a scanner with nothing to scan for.
   *
   * Two ways to reach here legitimately, and both should stop the merge:
   *   - the secret was renamed or deleted, which is the regression worth
   *     catching loudly;
   *   - the pull request comes from a fork, which GitHub deliberately gives no
   *     secrets. The check genuinely cannot run there, and the honest outcome
   *     is a red mark a maintainer has to clear, not a green one that implies
   *     the names were checked.
   */
  const how = `Set ${ENV_VAR} (comma-separated) — in CI, the FORBIDDEN_TERMS repository secret.`
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::error title=Repo rule 3 cannot run::No terms configured. ${how}`)
  }
  console.error(
    `\nRepo rule 3: CANNOT RUN — no terms configured.\n  ${how}\n` +
      '  This is a failure, not a warning: a check with nothing loaded has not\n' +
      '  passed, it has been skipped, and the two look identical in a green run.\n',
  )
  process.exit(1)
}

/** Only the position, never the match: this repo is public and so are its logs. */
const hits = []

for (const path of git(['ls-files', '-z']).split('\0').filter(Boolean)) {
  const lower = path.toLowerCase()
  if (terms.some((term) => lower.includes(term))) {
    hits.push(`${path} — the path itself`)
  }

  if (BINARY.has(extname(path).toLowerCase())) continue

  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    continue // Deleted between listing and reading, or genuinely unreadable.
  }

  text.split('\n').forEach((line, index) => {
    const haystack = line.toLowerCase()
    if (terms.some((term) => haystack.includes(term))) {
      hits.push(`${path}:${index + 1}`)
    }
  })
}

/**
 * Commit messages too — rule 3 names them, and a squash merge carries the
 * branch's subjects into `main` where they are permanent.
 */
const base = process.env.GITHUB_BASE_REF
if (base) {
  try {
    const log = git(['log', '--format=%H%x1f%B%x1e', `origin/${base}..HEAD`])
    for (const entry of log.split('\x1e').filter((part) => part.trim())) {
      const [sha, message] = entry.split('\x1f')
      if (terms.some((term) => message.toLowerCase().includes(term))) {
        hits.push(`commit ${sha.trim().slice(0, 8)} — the message`)
      }
    }
  } catch {
    // A shallow clone cannot see the range. Say so rather than passing quietly.
    console.warn('Repo rule 3: commit messages not checked — the base ref is unreachable.')
  }
}

if (hits.length > 0) {
  console.error('\nRepo rule 3 — no employer, client or third-party project names.\n')
  console.error('  A forbidden term appears at:\n')
  for (const hit of hits) console.error(`    ${hit}`)
  console.error(
    `\n${hits.length} occurrence${hits.length === 1 ? '' : 's'}.` +
      '\nThe term is deliberately not printed: this repository is public and so is this log.\n',
  )
  process.exit(1)
}

console.log(`Repo rule 3: clean — ${terms.length} term${terms.length === 1 ? '' : 's'} checked.`)
