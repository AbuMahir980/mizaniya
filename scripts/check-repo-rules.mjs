/**
 * WHAT: Fails the build if a forbidden third-party name appears in a tracked
 *       file, a tracked path, or a commit message on this branch (repo rule 3).
 * WHY:  **The names cannot live in this file.** Writing the list down here
 *       would commit the exact breach the check exists to catch, so the terms
 *       arrive from the environment — a repository secret in CI — the way rule
 *       1 says every credential does.
 * INTERVIEW: I enforced a rule whose subject matter cannot be written down by
 *       reading the terms from the environment and reporting only line numbers,
 *       because this repo is public and so are its CI logs.
 */

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
   * Loud, never silent.
   *
   * The mechanism below is proved on every run by
   * `scripts/check-repo-rules.test.mjs`, which plants a term and requires a
   * non-zero exit. So this state is not "the check is switched off" — it is
   * "the check has nothing loaded", and the difference is worth saying out
   * loud rather than exiting 0 with a tick beside it.
   */
  const how = `Set ${ENV_VAR} (comma-separated) — in CI, a repository secret.`
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::warning title=Repo rule 3 unenforced::No terms configured. ${how}`)
  }
  console.warn(`\nRepo rule 3: NOT ENFORCED — no terms configured.\n  ${how}\n`)
  process.exit(0)
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
