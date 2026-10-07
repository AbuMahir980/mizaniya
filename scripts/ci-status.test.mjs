import { describe, expect, it } from 'vitest'
import {
  BLOCKING_BUCKETS,
  SETTLED_BLOCKING_BUCKETS,
  classify,
  isPass,
  verdict,
} from './ci-status.mjs'

const pass = (name) => ({ name, bucket: 'pass', link: `https://example.test/${name}` })

describe('only a pass is a pass', () => {
  it('counts a passing check as green', () => {
    expect(verdict([pass('verify')]).green).toBe(true)
  })

  /**
   * The two that read like success and are not. CLAUDE.md states it directly: a
   * check that was skipped is not a check that passed, and neither is one that was
   * cancelled. This is the test that fails if anyone ever relaxes that.
   */
  it.each(['fail', 'cancel', 'skipping', 'pending'])('refuses a check in bucket %s', (bucket) => {
    const result = verdict([pass('verify'), { name: 'peer-ai check', bucket }])
    expect(result.green).toBe(false)
    expect(result.reason).toContain('peer-ai check')
    expect(result.reason).toContain(bucket)
  })

  it('names every blocking bucket, so the list cannot silently shrink', () => {
    expect(BLOCKING_BUCKETS).toEqual(['fail', 'cancel', 'skipping', 'pending'])
  })

  /** A bucket GitHub has not used before must not fall through as success. */
  it('refuses a bucket it has never seen', () => {
    expect(isPass('something-new')).toBe(false)
    expect(verdict([{ name: 'odd', bucket: 'something-new' }]).green).toBe(false)
  })

  it('refuses a check with no bucket at all', () => {
    expect(verdict([{ name: 'broken' }]).green).toBe(false)
  })
})

describe('no checks is not green', () => {
  /**
   * The case that would otherwise merge an unverified change: counting only
   * failures makes a pull request whose workflows never ran look identical to one
   * that passed.
   */
  it('refuses when nothing has reported', () => {
    const result = verdict([])
    expect(result.green).toBe(false)
    expect(result.reason).toBe('no checks have reported')
  })
})

describe('a gate blocks on pending; an alarm waits', () => {
  it('names the settled blocking buckets, pending excluded', () => {
    expect(SETTLED_BLOCKING_BUCKETS).toEqual(['fail', 'cancel', 'skipping'])
  })

  /**
   * The flaw this exists for: the first monitor alerted the moment CI started,
   * on a pull request with nothing wrong with it. An alarm that fires on every
   * push is an alarm nobody reads by the end of the day.
   */
  it('waits rather than alarms when only pending checks are outstanding', () => {
    const result = verdict(
      [
        { name: 'verify', bucket: 'pending' },
        { name: 'repo rules', bucket: 'pending' },
      ],
      { ignorePending: true },
    )
    expect(result.green).toBe(false)
    expect(result.waiting).toBe(true)
    expect(result.reason).toBe('2 checks still running')
  })

  it('says one check in the singular', () => {
    const result = verdict([{ name: 'verify', bucket: 'pending' }], { ignorePending: true })
    expect(result.reason).toBe('1 check still running')
  })

  it('still alarms on a settled failure sitting beside a pending check', () => {
    const result = verdict(
      [
        { name: 'verify', bucket: 'pending' },
        { name: 'peer-ai check', bucket: 'fail' },
      ],
      { ignorePending: true },
    )
    expect(result.waiting).toBe(false)
    expect(result.reason).toBe('not green: peer-ai check [fail]')
    expect(result.problems.map((p) => p.name)).toEqual(['peer-ai check'])
  })

  /** The gate's own behaviour must not move: a running check is not a pass. */
  it('blocks on pending when pending is not ignored', () => {
    const result = verdict([pass('verify'), { name: 'peer-ai check', bucket: 'pending' }])
    expect(result.green).toBe(false)
    expect(result.waiting).toBe(false)
    expect(result.reason).toContain('pending')
  })

  it('never calls an empty check list waiting, even for an alarm', () => {
    const result = verdict([], { ignorePending: true })
    expect(result.green).toBe(false)
    expect(result.waiting).toBe(false)
    expect(result.reason).toBe('no checks have reported')
  })
})

describe('what it reports back', () => {
  it('lists every problem, not just the first', () => {
    const result = verdict([
      pass('verify'),
      { name: 'peer-ai check', bucket: 'fail', link: 'https://example.test/a' },
      { name: 'repo rules', bucket: 'pending' },
    ])
    expect(result.problems.map((p) => p.name)).toEqual(['peer-ai check', 'repo rules'])
  })

  it('keeps the run link for a failing check, so it can be opened', () => {
    const result = verdict([{ name: 'verify', bucket: 'fail', link: 'https://example.test/run' }])
    expect(result.problems[0]?.link).toBe('https://example.test/run')
  })

  it('counts the buckets it saw', () => {
    const { counts } = classify([pass('a'), pass('b'), { name: 'c', bucket: 'fail' }])
    expect(counts).toEqual({ pass: 2, fail: 1 })
  })

  it('says how many passed when everything is green', () => {
    expect(verdict([pass('a'), pass('b'), pass('c')]).reason).toBe('all 3 checks passed')
  })
})
