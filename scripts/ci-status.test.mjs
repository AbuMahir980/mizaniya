import { describe, expect, it } from 'vitest'
import { BLOCKING_BUCKETS, classify, isPass, verdict } from './ci-status.mjs'

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
