/**
 * WHAT: Fails a pull request that changes `docs/design/` without being a design
 *       drop.
 * WHY:  The designer works in the same worktree, and `git add -A` has twice
 *       swept a whole design drop into a feature commit — `tokens.md`, 67
 *       artboards and the open-items reply, filed under "feat(core)" and then
 *       "fix(onboarding)". Both times the designer noticed and I did not.
 *       Discipline failed twice, so this is the mechanical version of it.
 * INTERVIEW: After making the same staging mistake twice, I replaced the
 *       resolution to be careful with a check that fails the build.
 */

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
    (path.startsWith('docs/design/') && path.endsWith('.png')),
)

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
