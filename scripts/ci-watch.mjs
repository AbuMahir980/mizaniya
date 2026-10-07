#!/usr/bin/env node
/**
 * Every open pull request's check state, one block each. Exits non-zero when any
 * is not green, so it works as a one-shot answer and inside a polling monitor.
 *
 * Usage: node scripts/ci-watch.mjs [--quiet] [--ignore-pending]
 *
 * `--ignore-pending` is for an alarm rather than a gate: a check still running is
 * reported as WAITING and does not make the run fail. Without it, every push would
 * alert the moment CI started, and the alerts that matter would stop being read.
 */

import { execFileSync } from 'node:child_process'
import { verdict } from './ci-status.mjs'

const quiet = process.argv.includes('--quiet')
const ignorePending = process.argv.includes('--ignore-pending')

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function openPullRequests() {
  const raw = gh(['pr', 'list', '--state', 'open', '--json', 'number,title,baseRefName,isDraft'])
  return JSON.parse(raw)
}

function checksFor(number) {
  try {
    return JSON.parse(gh(['pr', 'checks', String(number), '--json', 'name,bucket,link']))
  } catch {
    // `gh pr checks` exits non-zero when a check is failing as well as when it
    // cannot answer, so a throw here is not evidence of either. Treat it as no
    // checks reported, which verdict() already refuses.
    return []
  }
}

let red = 0

const pulls = openPullRequests()
if (pulls.length === 0 && !quiet) console.log('No open pull requests.')

for (const pull of pulls) {
  const result = verdict(checksFor(pull.number), { ignorePending })
  const label = `#${pull.number} → ${pull.baseRefName}${pull.isDraft ? ' (draft)' : ''}`

  if (result.green) {
    if (!quiet) console.log(`GREEN  ${label}  ${result.reason}  — ${pull.title}`)
    continue
  }

  if (result.waiting) {
    if (!quiet) console.log(`WAIT   ${label}  ${result.reason}  — ${pull.title}`)
    continue
  }

  red += 1
  console.log(`RED    ${label}  ${result.reason}  — ${pull.title}`)
  for (const problem of result.problems) {
    console.log(`         ${problem.name} [${problem.bucket}] ${problem.link}`)
  }
}

if (red > 0) {
  console.log(`\n${red} of ${pulls.length} open pull requests are not green.`)
  process.exit(1)
}
