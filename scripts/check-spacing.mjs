/**
 * WHAT: Fails the build on an off-grid spacing value.
 * WHY:  `tokens.md` §5 is **a 2px grid** since 23 September. The theme's scale
 *       only has even keys, so `p-11` cannot be written — but an arbitrary
 *       `p-[11px]` slips straight past it, and that is the hole the scale was
 *       replaced to close.
 * INTERVIEW: I guarded the design system's grid against Tailwind's arbitrary
 *       values, because the token scale can only enforce what someone chooses
 *       to spell as a token.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

/**
 * Spacing only — padding, margin, gap and offsets.
 *
 * Sizes are deliberately out: a 25px mark and a 31px wordmark are brand
 * geometry, which `brand/README.md` owns and §5 explicitly does not.
 */
const SPACING = String.raw`p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left`
const ARBITRARY = new RegExp(String.raw`(?<![\w-])-?(${SPACING})-\[(\d+)px\]`, 'g')

/** 1–4px is optical, not spacing — a hairline offset, a glyph nudge (§5). */
const OPTICAL = 4

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const problems = []

const root = process.argv[2] ?? 'src'

for (const file of walk(root)) {
  if (!['.ts', '.tsx'].includes(extname(file))) continue

  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(ARBITRARY)) {
        const px = Number(match[2])
        if (px <= OPTICAL || px % 2 === 0) continue
        problems.push(
          `${relative('.', file)}:${index + 1} — ${match[0]} is off the 2px grid (tokens.md §5)`,
        )
      }
    })
}

if (problems.length > 0) {
  console.error('\nSpacing (tokens.md §5 — a 2px grid):\n')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(
    `\n${problems.length} problem${problems.length === 1 ? '' : 's'}.` +
      '\nEvery spacing value is even. 1–4px is optical and belongs to the component.\n',
  )
  process.exit(1)
}

console.log('Spacing: every value on the 2px grid.')
