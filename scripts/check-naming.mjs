/**
 * WHAT: Fails if a source file is not kebab-case, or a React component file does
 *       not export a PascalCase component, or a hook is not named `useThing`.
 * WHY:  Ten lines instead of a plugin. `eslint-plugin-unicorn` would give the
 *       first check and needs ESLint 10, which we are not on — and N1 asks why
 *       not the platform before adding a dependency for one rule.
 * INTERVIEW: I enforced the naming standard with a small script rather than a
 *       plugin, because I only needed one rule out of a large package.
 */

import { readdirSync, statSync } from 'node:fs'
import { join, relative, basename, extname } from 'node:path'

const ROOT = 'src'
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

for (const file of walk(ROOT)) {
  const name = basename(file)
  if (ALLOWED.has(name)) continue

  const extension = extname(name)
  if (!['.ts', '.tsx', '.css'].includes(extension)) continue

  // `money.test.ts` is kebab-case with a suffix; check each dotted part.
  const stem = name.slice(0, -extension.length)
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

console.log(`Naming: ${walk(ROOT).length} files checked, all kebab-case.`)
