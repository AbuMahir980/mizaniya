#!/usr/bin/env node
/**
 * WHAT: Says how far behind upstream this vendored copy of Peer AI is, and which
 *       of the changed files the phase you are about to run actually reads.
 * WHY:  A vendored copy is invisible to git — no remote, no branch, nothing that
 *       goes stale in a way anyone can see. Four defects sat fixed upstream for
 *       two days here while this copy quietly worked around them.
 * INTERVIEW: I made a vendored dependency report its own staleness, because the
 *       failure mode of vendoring is that nothing tells you there is an update.
 *
 * Usage:  node peer-ai/check-upstream.mjs
 * Exit:   0 up to date, or could not check · 1 behind
 *
 * Needs no credentials — Peer AI is public. Needs no git history for the copy,
 * which has none by design.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

const pin = JSON.parse(read(join(HERE, '.upstream')) ?? 'null')
if (!pin?.repo || !pin?.commit) {
  console.error('peer-ai/.upstream is missing or incomplete.')
  console.error('It records which upstream commit this copy was taken from.')
  console.error('Without it nothing can tell whether the copy is stale.')
  process.exit(1)
}

const { repo, commit, ref = 'main' } = pin
const api = `https://api.github.com/repos/${repo}/compare/${commit}...${ref}`

let data
try {
  const response = await fetch(api, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'peer-ai-check-upstream' },
  })
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
  data = await response.json()
} catch (error) {
  // Deliberately exit 0. Being offline is not the same as being behind, and a
  // check that blocks offline work gets removed rather than fixed. It is loud
  // about not having checked, which is the part that matters.
  console.log('COULD NOT CHECK — no answer from GitHub.')
  console.log(`  ${error instanceof Error ? error.message : String(error)}`)
  console.log('  This is not "up to date". Run it again when you have a network.')
  process.exit(0)
}

const behind = data.ahead_by ?? 0

if (behind === 0) {
  console.log(`Up to date with ${repo}@${ref} (${commit.slice(0, 7)}).`)
  process.exit(0)
}

const changed = (data.files ?? []).map((f) => f.filename)

/**
 * Which changed files does the phase you are about to run actually read?
 *
 * "Twelve files changed" is a number nobody acts on. "Two of them are the file
 * your next phase is about to follow" is a reason to stop.
 */
const state = JSON.parse(read(join(ROOT, '.peer-ai-state.json')) ?? 'null')
const phaseFile = state?.phaseFile?.replace(/^peer-ai\//, '')
const alwaysRead = [
  'shared/rules/shared.md',
  'shared/rules/workflow-driver.md',
  'frontend/rules/frontend.md',
  'backend/rules/backend.md',
  'shared/workflow-state.md',
  'templates/.peer-ai-state.json',
  'AGENTS.md',
]

const relevant = changed.filter((f) => f === phaseFile || alwaysRead.includes(f))

console.log(`BEHIND by ${behind} commit${behind === 1 ? '' : 's'} — ${repo}@${ref}`)
console.log(`  this copy: ${commit.slice(0, 7)}    upstream: ${(data.commits?.at(-1)?.sha ?? '').slice(0, 7)}`)
console.log('')

for (const c of data.commits ?? []) {
  console.log(`  ${c.sha.slice(0, 7)}  ${c.commit.message.split('\n')[0]}`)
}

console.log('')
if (relevant.length > 0) {
  console.log('  CHANGED, AND READ BY THE PHASE YOU ARE ABOUT TO RUN:')
  for (const f of relevant) {
    console.log(`    ${f}${f === phaseFile ? '   <- the active phase file' : ''}`)
  }
  console.log('')
  console.log('  Pull before running it, or you will follow a file that has been corrected.')
} else {
  console.log(`  ${changed.length} file(s) changed, none read by the active phase (${phaseFile ?? 'unknown'}).`)
  console.log('  Safe to continue, but pull at the next phase boundary.')
}

console.log('')
console.log('  To pull: merge upstream into the copy, then re-run BOTH post-pull scripts')
console.log('  (apply-phase-config, strip-model-switching) and re-read the AGENTS.md box.')
console.log('  Update peer-ai/.upstream to the new commit when done.')

process.exit(1)
