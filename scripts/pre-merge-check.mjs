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
 *
 * `runPreMerge` takes its command runner and its output as arguments, and the file
 * only runs itself when invoked directly, so the refusals can be asserted from a
 * test without reaching GitHub.
 */

import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { verdict } from './ci-status.mjs'

/** Long enough for a slow API call, short enough that a hang is noticed. */
export const GH_TIMEOUT_MS = 30_000

export function ghRunner(args) {
  // A timeout, so a hung gh refuses the merge rather than hanging the gate open.
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: GH_TIMEOUT_MS,
  })
}

/** @returns {number} 0 allowed, 1 refused, 2 asked wrongly. */
export function runPreMerge({ gh = ghRunner, log = console.log, warn = console.error, argv = [] }) {
  const number = argv[0]

  // Digits only, before the value reaches an argument list. SEC-30 holds anyway,
  // because gh is given its arguments as a list and never a shell, but a number is
  // the only thing this takes and anything else is a mistake worth naming.
  if (!number || !/^\d+$/.test(number)) {
    warn('Usage: node scripts/pre-merge-check.mjs <pr-number>')
    return 2
  }

  let pull
  try {
    pull = JSON.parse(
      gh(['pr', 'view', number, '--json', 'number,title,baseRefName,isDraft,state,mergeable']),
    )
  } catch (error) {
    warn(`REFUSED  cannot read pull request #${number}: ${error.message.split('\n')[0]}`)
    return 1
  }

  if (pull.state !== 'OPEN') {
    warn(`REFUSED  #${number} is ${pull.state}, not open.`)
    return 1
  }

  let checks = []
  try {
    checks = JSON.parse(gh(['pr', 'checks', number, '--json', 'name,bucket,link']))
  } catch {
    // A failing check makes `gh pr checks` exit non-zero too, so this is not
    // evidence of either outcome. verdict() refuses an empty list.
  }
  if (!Array.isArray(checks)) checks = []

  const result = verdict(checks)

  log(`#${pull.number} → ${pull.baseRefName}  — ${pull.title}`)
  if (pull.baseRefName !== 'main') {
    log(`  Base is ${pull.baseRefName}, not main. Branch protection would not cover this merge.`)
  }

  if (!result.green) {
    warn(`REFUSED  ${result.reason}`)
    for (const problem of result.problems) {
      warn(`         ${problem.name} [${problem.bucket}] ${problem.link ?? ''}`)
    }
    return 1
  }

  if (pull.isDraft) {
    warn('REFUSED  still a draft. Mark it ready, then run this again.')
    return 1
  }

  log(`ALLOWED  ${result.reason}.`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runPreMerge({ argv: process.argv.slice(2) }))
}
