import { describe, it, expect } from 'vitest'
import {
  evaluate,
  isWellFormed,
  isComplete,
  usedChipIndices,
  calcStars,
  makeNumToken,
  makeOpToken,
  makeParenToken,
} from './expression'
import type { Token } from './types'

const N = makeNumToken
const O = makeOpToken
const P = makeParenToken

describe('evaluate', () => {
  it('adds two numbers', () => {
    const r = evaluate([N(3, 0), O('+'), N(4, 1)])
    expect(r).toEqual({ ok: true, value: 7 })
  })

  it('respects multiplication precedence', () => {
    // 2 + 3 * 4 = 14
    const r = evaluate([N(2, 0), O('+'), N(3, 1), O('*'), N(4, 2)])
    expect(r).toEqual({ ok: true, value: 14 })
  })

  it('respects parentheses', () => {
    // (2 + 3) * 4 = 20
    const r = evaluate([P('('), N(2, 0), O('+'), N(3, 1), P(')'), O('*'), N(4, 2)])
    expect(r).toEqual({ ok: true, value: 20 })
  })

  it('handles nested parens', () => {
    // ((1 + 2) * 3) + 4 = 13
    const r = evaluate([
      P('('), P('('), N(1, 0), O('+'), N(2, 1), P(')'), O('*'), N(3, 2), P(')'), O('+'), N(4, 3),
    ])
    expect(r).toEqual({ ok: true, value: 13 })
  })

  it('rejects non-integer division', () => {
    const r = evaluate([N(5, 0), O('/'), N(2, 1)])
    expect(r).toEqual({ ok: false, error: 'non-integer' })
  })

  it('rejects divide-by-zero', () => {
    const r = evaluate([N(5, 0), O('/'), N(0, 1)])
    expect(r).toEqual({ ok: false, error: 'div-zero' })
  })

  it('rejects unbalanced parens', () => {
    const r = evaluate([P('('), N(1, 0), O('+'), N(2, 1)])
    expect(r).toEqual({ ok: false, error: 'syntax' })
  })

  it('rejects empty input', () => {
    const r = evaluate([])
    expect(r).toEqual({ ok: false, error: 'empty' })
  })

  it('Numble target test: 5,4,4,4 → 28 via (5*4)+4+4', () => {
    const r = evaluate([N(5, 0), O('*'), N(4, 1), O('+'), N(4, 2), O('+'), N(4, 3)])
    expect(r).toEqual({ ok: true, value: 28 })
  })
})

describe('isWellFormed', () => {
  it('accepts empty', () => { expect(isWellFormed([])).toBe(true) })
  it('rejects two numbers in a row', () => {
    expect(isWellFormed([N(3, 0), N(4, 1)])).toBe(false)
  })
  it('rejects two operators in a row', () => {
    expect(isWellFormed([N(3, 0), O('+'), O('-')])).toBe(false)
  })
  it('rejects close paren before open', () => {
    expect(isWellFormed([P(')'), N(3, 0)])).toBe(false)
  })
  it('accepts partial expression', () => {
    expect(isWellFormed([N(3, 0), O('+')])).toBe(true)
  })
})

describe('isComplete', () => {
  it('rejects trailing operator', () => {
    expect(isComplete([N(3, 0), O('+')])).toBe(false)
  })
  it('rejects unbalanced parens', () => {
    expect(isComplete([P('('), N(3, 0)])).toBe(false)
  })
  it('accepts balanced complete expression', () => {
    expect(isComplete([N(3, 0), O('+'), N(4, 1)])).toBe(true)
  })
})

describe('usedChipIndices', () => {
  it('tracks chip indices', () => {
    const tokens: Token[] = [N(5, 0), O('+'), N(4, 2), O('*'), N(4, 3)]
    expect(Array.from(usedChipIndices(tokens)).sort()).toEqual([0, 2, 3])
  })
})

describe('calcStars', () => {
  it('3 stars when >66% time left', () => { expect(calcStars(10, 60)).toBe(3) })
  it('2 stars when 33-66% time left', () => { expect(calcStars(35, 60)).toBe(2) })
  it('1 star when <33% time left', () => { expect(calcStars(55, 60)).toBe(1) })
})
