import { describe, expect, it } from 'vitest'
import {
  buildCvss31Vector,
  calculateCvss31,
  defaultCvss31Metrics,
} from '../src/lib/cvss31'

describe('CVSS 3.1 calculator', () => {
  it('builds a vector with metrics in standard order', () => {
    expect(buildCvss31Vector(defaultCvss31Metrics)).toBe(
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    )
  })

  it('scores the reference critical vector as 9.8', () => {
    const result = calculateCvss31(defaultCvss31Metrics)

    expect(result.score).toBe(9.8)
    expect(result.rating).toBe('CRITICAL')
  })

  it('scores a low-privilege vector as high', () => {
    const result = calculateCvss31({ ...defaultCvss31Metrics, PR: 'L' })

    expect(result.score).toBe(8.8)
    expect(result.rating).toBe('HIGH')
  })

  it('recalculates a physical attack vector to a medium rating', () => {
    const result = calculateCvss31({ ...defaultCvss31Metrics, AV: 'P' })

    expect(result.score).toBe(6.8)
    expect(result.rating).toBe('MEDIUM')
  })

  it('returns no impact when all impact metrics are none', () => {
    const result = calculateCvss31({
      ...defaultCvss31Metrics,
      C: 'N',
      I: 'N',
      A: 'N',
    })

    expect(result.score).toBe(0)
    expect(result.rating).toBe('NONE')
  })
})