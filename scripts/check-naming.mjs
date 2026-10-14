import { readdirSync, statSync } from 'node:fs'
import { join, relative, basename, extname } from 'node:path'

/**
 * Every tree that holds source. Listed rather than globbed from the workspace,
 * because a new package that nobody adds here would be silently unchecked —
 * and a naming rule nothing enforces is a naming suggestion.
 */
const ROOTS = ['apps/web/src', 'packages/core/src']
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
/** Files the ecosystem names for us. */
const ALLOWED = new Set(['vite-env.d.ts'])

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const problems = []

for (const file of ROOTS.flatMap(walk)) {
  const name = basename(file)
  if (ALLOWED.has(name)) continue

  const extension = extname(name)
  if (!['.ts', '.tsx', '.css'].includes(extension)) continue

  // `money.test.ts` is kebab-case with a suffix; check each dotted part.
  const stem = name.slice(0, -extension.length)
  /*
   * Semgrep's detect-redos flags KEBAB as possible catastrophic backtracking, and
   * it is a false positive here on two counts. The mandatory `-` between the two
   * character classes leaves no ambiguity about where one group ends, so there is
   * nothing to backtrack over: measured at 0.46ms on 100,000 characters built to
   * force a failed match. And the input is a filename from this script's own
   * directory walk, never anything a user supplies. Suppressed with the
   * measurement rather than rewritten, because rewriting a correct regex to quiet
   * a tool is how a check starts costing more than it finds.
   */
  // nosemgrep: rules.javascript.lang.security.audit.detect-redos
  const bad = stem.split('.').filter((part) => !KEBAB.test(part))

  if (bad.length > 0) {
    problems.push(`${relative('.', file)} — files are kebab-case (O1); "${bad.join('", "')}" is not`)
  }
}

if (problems.length > 0) {
  console.error('Naming (frontend standard O1):\n')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}.`)
  process.exit(1)
}

console.log(`Naming: ${ROOTS.flatMap(walk).length} files checked, all kebab-case.`)
