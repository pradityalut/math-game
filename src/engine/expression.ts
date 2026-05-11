import type { Token, Op, Paren } from './types'

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false; error: 'syntax' | 'div-zero' | 'non-integer' | 'empty' }

const PRECEDENCE: Record<Op, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

export function tokensToString(tokens: Token[]): string {
  return tokens
    .map((t) => {
      if (t.kind === 'num') return String(t.value)
      if (t.kind === 'op')
        return t.value === '*' ? '×' : t.value === '/' ? '÷' : t.value === '-' ? '−' : '+'
      return t.value
    })
    .join(' ')
}

/**
 * Evaluate a token list using shunting-yard → RPN.
 * Enforces integer-only arithmetic at every intermediate step.
 */
export function evaluate(tokens: Token[]): EvalResult {
  if (tokens.length === 0) return { ok: false, error: 'empty' }

  const output: Token[] = []
  const stack: Token[] = []

  // Shunting-yard
  for (const t of tokens) {
    if (t.kind === 'num') {
      output.push(t)
    } else if (t.kind === 'op') {
      while (stack.length > 0) {
        const top = stack[stack.length - 1]!
        if (top.kind === 'op' && PRECEDENCE[top.value] >= PRECEDENCE[t.value]) {
          output.push(stack.pop()!)
        } else break
      }
      stack.push(t)
    } else if (t.value === '(') {
      stack.push(t)
    } else {
      // ')'
      let foundOpen = false
      while (stack.length > 0) {
        const top = stack.pop()!
        if (top.kind === 'paren' && top.value === '(') {
          foundOpen = true
          break
        }
        output.push(top)
      }
      if (!foundOpen) return { ok: false, error: 'syntax' }
    }
  }
  while (stack.length > 0) {
    const top = stack.pop()!
    if (top.kind === 'paren') return { ok: false, error: 'syntax' }
    output.push(top)
  }

  // Evaluate RPN
  const values: number[] = []
  for (const t of output) {
    if (t.kind === 'num') {
      values.push(t.value)
    } else if (t.kind === 'op') {
      const b = values.pop()
      const a = values.pop()
      if (a === undefined || b === undefined) return { ok: false, error: 'syntax' }
      let r: number
      switch (t.value) {
        case '+': r = a + b; break
        case '-': r = a - b; break
        case '*': r = a * b; break
        case '/':
          if (b === 0) return { ok: false, error: 'div-zero' }
          if (!Number.isInteger(a / b)) return { ok: false, error: 'non-integer' }
          r = a / b
          break
      }
      values.push(r)
    }
  }
  if (values.length !== 1) return { ok: false, error: 'syntax' }
  return { ok: true, value: values[0]! }
}

/**
 * Validate basic syntactic shape (used for live feedback, allows incomplete).
 * Returns true iff the partial expression has matched parens and no two
 * adjacent operators / numbers in invalid positions.
 */
export function isWellFormed(tokens: Token[]): boolean {
  if (tokens.length === 0) return true
  let parenDepth = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!
    const prev = tokens[i - 1]
    if (t.kind === 'paren') {
      if (t.value === '(') parenDepth++
      else parenDepth--
      if (parenDepth < 0) return false
    }
    if (i === 0) {
      if (t.kind === 'op' && t.value !== '-') return false
      continue
    }
    if (!prev) continue
    if (t.kind === 'num') {
      // Number can follow op or '('
      if (prev.kind === 'num') return false
      if (prev.kind === 'paren' && prev.value === ')') return false
    }
    if (t.kind === 'op') {
      // Op must follow num or ')'
      if (prev.kind === 'op') return false
      if (prev.kind === 'paren' && prev.value === '(') return false
    }
    if (t.kind === 'paren' && t.value === '(') {
      // '(' must follow op or another '('
      if (prev.kind === 'num') return false
      if (prev.kind === 'paren' && prev.value === ')') return false
    }
    if (t.kind === 'paren' && t.value === ')') {
      // ')' must follow num or another ')'
      if (prev.kind === 'op') return false
      if (prev.kind === 'paren' && prev.value === '(') return false
    }
  }
  return true
}

export function isComplete(tokens: Token[]): boolean {
  if (tokens.length === 0) return false
  const last = tokens[tokens.length - 1]!
  if (last.kind === 'op') return false
  if (last.kind === 'paren' && last.value === '(') return false
  let depth = 0
  for (const t of tokens) {
    if (t.kind === 'paren' && t.value === '(') depth++
    if (t.kind === 'paren' && t.value === ')') depth--
  }
  return depth === 0
}

export function usedChipIndices(tokens: Token[]): Set<number> {
  const s = new Set<number>()
  for (const t of tokens) if (t.kind === 'num') s.add(t.chipIdx)
  return s
}

export function calcStars(elapsed: number, timeLimitSec: number): 1 | 2 | 3 {
  const pct = (timeLimitSec - elapsed) / timeLimitSec
  if (pct > 0.66) return 3
  if (pct > 0.33) return 2
  return 1
}

export function makeNumToken(value: number, chipIdx: number): Token {
  return { kind: 'num', value, chipIdx }
}
export function makeOpToken(value: Op): Token {
  return { kind: 'op', value }
}
export function makeParenToken(value: Paren): Token {
  return { kind: 'paren', value }
}
