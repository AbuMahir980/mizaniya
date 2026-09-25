import { afterEach, describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const GUARD = resolve('scripts/check-repo-rules.mjs')
/** Invented, and nowhere in this repository. */
const TERM = 'northwind-tradingco'

const made = []

afterEach(() => {
  while (made.length > 0) rmSync(made.pop(), { recursive: true, force: true })
})

/** A throwaway git repository with the given tracked files. */
function repoWith(files) {
  const dir = mkdtempSync(join(tmpdir(), 'mizaniya-rule3-'))
  made.push(dir)
  execFileSync('git', ['init', '-q'], { cwd: dir })

  for (const [path, contents] of Object.entries(files)) {
    const full = join(dir, path)
    mkdirSync(join(full, '..'), { recursive: true })
    writeFileSync(full, contents)
  }
  execFileSync('git', ['add', '-A'], { cwd: dir })
  return dir
}

/**
 * `spawnSync`, not `execFileSync`, for both streams on both paths: the guard
 * reports findings and the unconfigured warning on **stderr**, and a helper
 * that reads only stdout would have made the quiet case look silent when it is
 * not.
 */
function run(dir, env = {}) {
  const result = spawnSync('node', [GUARD], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, MIZANIYA_FORBIDDEN_TERMS: '', GITHUB_ACTIONS: '', ...env },
  })
  return { code: result.status, output: `${result.stdout}${result.stderr}` }
}

describe('the guard fires', () => {
  it('fails when a forbidden term is in a tracked file', () => {
    const dir = repoWith({ 'docs/notes.md': `Built this at ${TERM} last year.\n` })
    const { code, output } = run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM })

    expect(code).toBe(1)
    expect(output).toContain('docs/notes.md:1')
  })

  it('fails when the term is only in a filename', () => {
    const dir = repoWith({ [`${TERM}-migration.md`]: 'nothing in here\n' })
    const { code, output } = run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM })

    expect(code).toBe(1)
    expect(output).toContain('the path itself')
  })

  it('matches regardless of case, because a name is a name', () => {
    const dir = repoWith({ 'src/app.ts': `// see ${TERM.toUpperCase()}\n` })
    const { code } = run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM })

    expect(code).toBe(1)
  })

  it('never prints the term itself — this repo is public, and so are its logs', () => {
    const dir = repoWith({ 'docs/notes.md': `Built this at ${TERM}.\n` })
    const { output } = run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM })

    expect(output.toLowerCase()).not.toContain(TERM)
    expect(output).toContain('deliberately not printed')
  })
})

describe('the guard stays quiet when it should', () => {
  it('passes a repository with nothing to find', () => {
    const dir = repoWith({ 'docs/notes.md': 'An ordinary line about rent.\n' })
    const { code, output } = run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM })

    expect(code).toBe(0)
    expect(output).toContain('clean')
  })

  it('ignores an untracked file, because only what is committed is public', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mizaniya-rule3-'))
    made.push(dir)
    execFileSync('git', ['init', '-q'], { cwd: dir })
    writeFileSync(join(dir, 'scratch.md'), `${TERM}\n`)

    expect(run(dir, { MIZANIYA_FORBIDDEN_TERMS: TERM }).code).toBe(0)
  })
})

describe('unconfigured is announced, not assumed', () => {
  it('exits 0 but says the rule is NOT ENFORCED', () => {
    const dir = repoWith({ 'docs/notes.md': `${TERM}\n` })
    const { code, output } = run(dir)

    // Passing is the right exit code — there is nothing to compare against.
    expect(code).toBe(0)
    // Saying nothing would not be. This is the line that stops a green tick
    // from meaning more than it does.
    expect(output).toContain('NOT ENFORCED')
  })

  it('annotates the run in GitHub Actions so it is visible without the log', () => {
    const dir = repoWith({ 'docs/notes.md': 'ordinary\n' })
    const { output } = run(dir, { GITHUB_ACTIONS: 'true' })

    expect(output).toContain('::warning title=Repo rule 3 unenforced::')
  })
})
