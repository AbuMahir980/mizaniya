import { describe, expect, it } from 'vitest'
import { runWatch } from './ci-watch.mjs'
import { runPreMerge } from './pre-merge-check.mjs'

/**
 * A fake `gh` built from canned answers, so every path is reachable without
 * GitHub. It also records what it was asked, which is how the tests prove a
 * refusal happened *before* any call went out.
 */
function fakeGh(answers) {
  const calls = []
  const gh = (args) => {
    calls.push(args)
    for (const [match, answer] of answers) {
      if (args.join(' ').includes(match)) {
        if (answer instanceof Error) throw answer
        return typeof answer === 'string' ? answer : JSON.stringify(answer)
      }
    }
    throw new Error(`unexpected gh call: ${args.join(' ')}`)
  }
  return { gh, calls }
}

const collect = () => {
  const lines = []
  return { lines, log: (line) => lines.push(String(line)) }
}

const PR = (over = {}) => ({
  number: 7,
  title: 'a change',
  baseRefName: 'main',
  isDraft: false,
  state: 'OPEN',
  mergeable: 'MERGEABLE',
  ...over,
})

const PASSED = [{ name: 'verify', bucket: 'pass', link: 'https://x/job/1' }]

describe('ci-watch exits zero only when everything is green', () => {
  it('exits zero when every open pull request passed', () => {
    const { gh } = fakeGh([
      ['pr list', [PR()]],
      ['pr checks', PASSED],
    ])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(0)
    expect(lines.join('\n')).toContain('GREEN')
  })

  it('exits zero when there is nothing open at all', () => {
    const { gh } = fakeGh([['pr list', []]])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(0)
    expect(lines).toEqual(['No open pull requests.'])
  })

  it('exits one and names the pull request, the check and its run link when broken', () => {
    const { gh } = fakeGh([
      ['pr list', [PR()]],
      ['pr checks', [{ name: 'verify', bucket: 'fail', link: 'https://x/job/9' }]],
      ['run view', 'nothing of interest in this log'],
    ])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(1)
    const out = lines.join('\n')
    expect(out).toContain('RED')
    expect(out).toContain('#7')
    expect(out).toContain('verify')
    expect(out).toContain('https://x/job/9')
  })

  it('calls it the gate, not a break, when the log says the item is unreviewed', () => {
    const { gh } = fakeGh([
      ['pr list', [PR()]],
      ['pr checks', [{ name: 'peer-ai check', bucket: 'fail', link: 'https://x/job/9' }]],
      ['run view', "ITEM-9 is at verify, so the change isn't verified and reviewed yet."],
    ])
    const { lines, log } = collect()
    // Still not green: a gate is a reason not to merge, just not an alarm.
    expect(runWatch({ gh, log })).toBe(1)
    expect(lines.join('\n')).toContain('GATE')
    expect(lines.join('\n')).not.toContain('RED')
  })
})

describe('ci-watch says so when it cannot do its job', () => {
  /**
   * The silence that reads as all-green. The monitor around this script treats no
   * output as nothing wrong, so a failure to list must print and must exit 2 —
   * distinguishable from exit 1, which only means a pull request is not green.
   */
  it('prints ERROR and exits two when gh cannot be run at all', () => {
    const { gh } = fakeGh([['pr list', new Error('spawnSync gh ENOENT')]])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(2)
    expect(lines[0]).toMatch(/^ERROR {2}cannot list pull requests: spawnSync gh ENOENT/)
  })

  it('prints ERROR and exits two when the list comes back the wrong shape', () => {
    const { gh } = fakeGh([['pr list', { number: 7 }]])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(2)
    expect(lines[0]).toContain('did not come back as a list')
  })

  it('prints one line of a multi-line failure, not the whole stack', () => {
    const { gh } = fakeGh([['pr list', new Error('first line\nsecond line\nthird line')]])
    const { lines, log } = collect()
    runWatch({ gh, log })
    expect(lines[0]).toContain('first line')
    expect(lines[0]).not.toContain('second line')
  })

  /** One unreadable pull request must not end the sweep over the others. */
  it('reports the pull request it could not read and keeps going', () => {
    const { gh } = fakeGh([
      ['pr list', [PR({ number: 1 }), PR({ number: 2 })]],
      ['pr checks 1', 'not json at all'],
      ['pr checks 2', PASSED],
    ])
    const { lines, log } = collect()
    expect(runWatch({ gh, log })).toBe(1)
    const out = lines.join('\n')
    expect(out).toContain('#1')
    expect(out).toContain('GREEN  #2')
  })
})

describe('pre-merge-check refuses anything that is not wholly green', () => {
  it('allows a green pull request and says how many checks passed', () => {
    const { gh } = fakeGh([
      ['pr view', PR()],
      ['pr checks', PASSED],
    ])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(0)
    expect(lines.join('\n')).toContain('ALLOWED')
  })

  /**
   * The case branch protection would never have covered: a pull request stacked
   * onto another branch is merged with the same command and no gate at all.
   */
  it('allows a green pull request based on another branch, and names that base', () => {
    const { gh } = fakeGh([
      ['pr view', PR({ baseRefName: 'feature/underneath' })],
      ['pr checks', PASSED],
    ])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(0)
    const out = lines.join('\n')
    expect(out).toContain('Base is feature/underneath, not main')
    expect(out).toContain('Branch protection would not cover this merge')
    expect(out).toContain('ALLOWED')
  })

  it.each(['fail', 'pending', 'cancel', 'skipping'])('refuses a check in bucket %s', (bucket) => {
    const { gh } = fakeGh([
      ['pr view', PR()],
      ['pr checks', [...PASSED, { name: 'peer-ai check', bucket, link: 'https://x/job/2' }]],
    ])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(1)
    const out = lines.join('\n')
    expect(out).toContain('REFUSED')
    expect(out).toContain('peer-ai check')
    expect(out).toContain(bucket)
  })

  it('refuses when no check has reported, rather than reading it as green', () => {
    const { gh } = fakeGh([
      ['pr view', PR()],
      ['pr checks', []],
    ])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(1)
    expect(lines.join('\n')).toContain('no checks have reported')
  })

  it('refuses a draft even when every check passed', () => {
    const { gh } = fakeGh([
      ['pr view', PR({ isDraft: true })],
      ['pr checks', PASSED],
    ])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(1)
    expect(lines.join('\n')).toContain('still a draft')
  })

  it('refuses a pull request that is not open', () => {
    const { gh } = fakeGh([['pr view', PR({ state: 'MERGED' })]])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(1)
    expect(lines.join('\n')).toContain('is MERGED, not open')
  })

  it('refuses when the pull request cannot be read', () => {
    const { gh } = fakeGh([['pr view', new Error('no such pull request')]])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv: ['7'] })).toBe(1)
    expect(lines.join('\n')).toContain('cannot read pull request #7')
  })
})

describe('the argument is refused before anything is run', () => {
  /**
   * The abuse tests TEST-08 asks for. Each must exit 2 and, more importantly, must
   * not have called gh at all: nothing outside is allowed near an argument list.
   */
  it.each([
    ['nothing', []],
    ['an empty string', ['']],
    ['a word', ['seven']],
    ['a flag', ['--repo']],
    ['a leading dash', ['-7']],
    ['a path appended', ['7/../../etc/passwd']],
    ['a semicolon appended', ['7;rm -rf /']],
    ['a space and another argument', ['7 8']],
    ['a number with a newline', ['7\n8']],
    ['decimals', ['7.0']],
  ])('refuses %s without calling gh', (_label, argv) => {
    const { gh, calls } = fakeGh([['pr view', PR()]])
    const { lines, log } = collect()
    expect(runPreMerge({ gh, log, warn: log, argv })).toBe(2)
    expect(calls).toEqual([])
    expect(lines.join('\n')).toContain('Usage:')
  })
})
