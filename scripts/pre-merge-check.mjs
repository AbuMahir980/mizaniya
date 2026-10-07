#!/usr/bin/env node
/**
 * The gate in front of every merge, whatever the base branch.
 *
 * Branch protection only ever guards the default branch, and it is off here. A
 * pull request stacked onto another branch is merged with the same command and
 * the same consequences, so it is held to the same bar: every check passed, none
 * pending, none skipped, none cancelled.
 *
 * Usage: node scripts/pre-merge-check.mjs <pr-number>
 */

import { execFileSync } from 'node:child_process'
import { verdict } from './ci-status.mjs'

/** Long enough for a slow API call, short enough that a hang is noticed. */
const GH_TIMEOUT_MS = 30_000

const number = process.argv[2]

if (!number || !/^\d+$/.test(number)) {
  console.error('Usage: node scripts/pre-merge-check.mjs <pr-number>')
  process.exit(2)
}

function gh(args) {
  // A timeout, so a hung gh refuses the merge rather than hanging the gate open.
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: GH_TIMEOUT_MS,
  })
}

let pull
try {
  pull = JSON.parse(
    gh(['pr', 'view', number, '--json', 'number,title,baseRefName,isDraft,state,mergeable']),
  )
} catch (error) {
  console.error(`REFUSED  cannot read pull request #${number}: ${error.message}`)
  process.exit(1)
}

if (pull.state !== 'OPEN') {
  console.error(`REFUSED  #${number} is ${pull.state}, not open.`)
  process.exit(1)
}

let checks = []
try {
  checks = JSON.parse(gh(['pr', 'checks', number, '--json', 'name,bucket,link']))
} catch {
  // A failing check makes `gh pr checks` exit non-zero too, so this is not
  // evidence of either outcome. verdict() refuses an empty list.
}

const result = verdict(checks)

console.log(`#${pull.number} → ${pull.baseRefName}  — ${pull.title}`)
if (pull.baseRefName !== 'main') {
  console.log(`  Base is ${pull.baseRefName}, not main. Branch protection would not cover this merge.`)
}

if (!result.green) {
  console.error(`REFUSED  ${result.reason}`)
  for (const problem of result.problems) {
    console.error(`         ${problem.name} [${problem.bucket}] ${problem.link}`)
  }
  process.exit(1)
}

if (pull.isDraft) {
  console.error('REFUSED  still a draft. Mark it ready, then run this again.')
  process.exit(1)
}

console.log(`ALLOWED  ${result.reason}.`)
