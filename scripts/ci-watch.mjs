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
import { PEER_AI_GATE_SIGNATURE, splitGate, verdict } from './ci-status.mjs'

/** Long enough for a slow API call, short enough that a hang is noticed. */
const GH_TIMEOUT_MS = 30_000

const quiet = process.argv.includes('--quiet')
const ignorePending = process.argv.includes('--ignore-pending')

function gh(args) {
  // A timeout, because this runs inside a monitor on a loop. Without one a hung
  // gh — a stalled network, a login prompt waiting on input — stops the watch
  // silently and forever, and a stalled watcher looks exactly like a quiet one.
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: GH_TIMEOUT_MS,
  })
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

/**
 * Reads the failing job's log to tell Peer AI's gate waiting on a review from a
 * real break. Answers false whenever it cannot tell, so an unreadable failure is
 * reported as broken rather than quietly downgraded.
 */
function isGateFailure(problem) {
  const jobId = /\/job\/(\d+)/.exec(problem.link ?? '')?.[1]
  if (!jobId) return false
  try {
    return gh(['run', 'view', '--job', jobId, '--log']).includes(PEER_AI_GATE_SIGNATURE)
  } catch {
    return false
  }
}

let red = 0
let gated = 0

/**
 * A watcher that cannot do its job must say so on stdout, not die quietly. The
 * monitor around this script reads its output and treats no output as nothing
 * wrong, so a crash here would look exactly like every pull request being green.
 * Exit 2 rather than 1, so "the watcher is broken" is distinguishable from "a
 * pull request is not green".
 */
let pulls
try {
  pulls = openPullRequests()
} catch (error) {
  console.log(`ERROR  cannot list pull requests: ${error.message.split('\n')[0]}`)
  process.exit(2)
}
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

  const { gate, broken } = splitGate(result.problems, isGateFailure)

  // Only the gate against it: reviews are outstanding, nothing is broken. Still
  // not green, and pre-merge-check still refuses it — but this is not an alarm.
  if (broken.length === 0 && gate.length > 0) {
    gated += 1
    console.log(`GATE   ${label}  waiting on its reviews  — ${pull.title}`)
    for (const problem of gate) {
      console.log(`         ${problem.name} [${problem.bucket}] ${problem.link}`)
    }
    continue
  }

  red += 1
  console.log(`RED    ${label}  ${result.reason}  — ${pull.title}`)
  for (const problem of broken) {
    console.log(`         ${problem.name} [${problem.bucket}] ${problem.link}`)
  }
  for (const problem of gate) {
    console.log(`         ${problem.name} [${problem.bucket}] (gate, waiting on reviews)`)
  }
}

if (red > 0 || gated > 0) {
  const parts = []
  if (red > 0) parts.push(`${red} broken`)
  if (gated > 0) parts.push(`${gated} waiting on reviews`)
  console.log(`\n${parts.join(', ')}, of ${pulls.length} open pull requests.`)
  process.exit(1)
}
