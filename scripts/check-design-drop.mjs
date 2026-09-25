import { execFileSync } from 'node:child_process'

const title = process.env.PR_TITLE ?? ''
const base = process.env.BASE_REF

if (!base) {
  console.log('Design drop: no base ref, so nothing to compare. Skipped.')
  process.exit(0)
}

const changed = execFileSync('git', ['diff', '--name-only', `origin/${base}...HEAD`], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)

/**
 * The designer's files. Everything else under `docs/design/` is ours to edit.
 *
 * **`docs/open-items.md` is deliberately not here.** It is the channel both
 * sides write in — questions from this side, answers from theirs — so guarding
 * it would make asking a question require a design pull request. The canvas,
 * the brand sheet, `tokens.md` and the previews are the real signal that a
 * drop has been swept up by accident.
 */
const theirs = changed.filter(
  (path) =>
    path.startsWith('docs/design/canvas/') ||
    path.startsWith('docs/design/brand/') ||
    path === 'docs/design/tokens.md' ||
    // Added 2026-09-25. `motion.md` is authoritative design output the same way
    // `tokens.md` is, and it was missing from this list on the day it arrived —
    // so the guard would have stayed silent while a drop was swept into a
    // feature commit. The list itself is the hole: anything named individually
    // has to be added by hand and nobody remembers. Hence the check below.
    path === 'docs/design/motion.md' ||
    (path.startsWith('docs/design/') && path.endsWith('.png')),
)

/**
 * The list above names files one by one, so it goes stale every time the
 * designer produces something new. `motion.md` proved that on the day it landed.
 *
 * So this fails when a markdown file appears directly in `docs/design/` and is
 * not accounted for — either as theirs above, or as one of ours below. It turns
 * a silent hole into a build failure that says what to do.
 */
const ours = new Set(['README.md'])
const unlisted = changed.filter((path) => {
  if (!/^docs\/design\/[^/]+\.md$/.test(path)) return false
  if (theirs.includes(path)) return false
  const name = path.slice('docs/design/'.length)
  return !ours.has(name) && !name.startsWith('PROPOSED-')
})

if (unlisted.length > 0) {
  console.error('\nA design file is not covered by this guard.\n')
  for (const path of unlisted) console.error(`    ${path}`)
  console.error(
    '\n  Add it to `theirs` in scripts/check-design-drop.mjs, or to `ours` if it\n' +
      '  is not the designer\'s. Until then the guard is silent about it, which\n' +
      '  is worse than not having a guard at all.\n',
  )
  process.exit(1)
}

if (theirs.length === 0) {
  console.log('Design drop: no design files touched.')
  process.exit(0)
}

// A design drop says so in its title, and carries nothing else.
if (/^design\b/i.test(title)) {
  console.log(`Design drop: ${theirs.length} design file(s), in a design pull request.`)
  process.exit(0)
}

console.error('\nA design drop belongs in its own pull request.\n')
console.error(`  This one is titled "${title}" and changes ${theirs.length} design file(s):\n`)
for (const path of theirs.slice(0, 12)) console.error(`    ${path}`)
if (theirs.length > 12) console.error(`    …and ${theirs.length - 12} more`)
console.error(
  '\n  The designer works in the same worktree, so `git add -A` sweeps their\n' +
    '  work into whatever is being committed. Stage by path, and put the\n' +
    '  design changes in a pull request whose title starts with "design".\n',
)
process.exit(1)
