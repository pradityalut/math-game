import { describe, it, expect } from 'vitest'
import { solve, hasSolution } from './solver'

describe('solver', () => {
  it('finds a solution for classic 3,8,3,8 → 24', () => {
    const path = solve([3, 8, 3, 8], 24)
    expect(path).not.toBeNull()
  })

  it('finds a solution for simple addition', () => {
    const path = solve([3, 4, 5, 12], 12)
    expect(path).not.toBeNull()
  })

  it('returns null when no solution exists', () => {
    expect(solve([1, 1, 1, 1], 99)).toBeNull()
  })

  it('respects restricted ops', () => {
    // 6 / 2 = 3, needs division
    const withDiv = solve([6, 2], 3, ['+', '-', '*', '/'])
    const withoutDiv = solve([6, 2], 3, ['+', '-', '*'])
    expect(withDiv).not.toBeNull()
    expect(withoutDiv).toBeNull()
  })

  it('hasSolution mirrors solve truthiness', () => {
    expect(hasSolution([3, 8, 3, 8], 24)).toBe(true)
    expect(hasSolution([1, 1, 1, 1], 99)).toBe(false)
  })
})
