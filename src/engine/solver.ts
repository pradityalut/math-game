import type { Op } from './types'

const ALL_OPS: Op[] = ['+', '-', '*', '/']

const EPS = 1e-9

function applyOp(a: number, b: number, op: Op): number | null {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/':
      if (Math.abs(b) < EPS) return null
      return a / b
  }
}

export function solve(
  numbers: number[],
  target: number,
  ops: Op[] = ALL_OPS
): string[] | null {
  if (numbers.length === 1) {
    return Math.abs((numbers[0] ?? 0) - target) < EPS ? [] : null
  }

  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i === j) continue
      const a = numbers[i]!
      const b = numbers[j]!
      const rest = numbers.filter((_, idx) => idx !== i && idx !== j)

      for (const op of ops) {
        const r = applyOp(a, b, op)
        if (r === null) continue

        const path = solve([r, ...rest], target, ops)
        if (path !== null) {
          return [`${a} ${op} ${b} = ${r}`, ...path]
        }
      }
    }
  }

  return null
}

export function hasSolution(
  numbers: number[],
  target: number,
  ops: Op[] = ALL_OPS
): boolean {
  return solve(numbers, target, ops) !== null
}

export function allAchievable(numbers: number[], ops: Op[] = ALL_OPS): number[] {
  const results = new Set<number>()

  function search(nums: number[]) {
    if (nums.length === 1) {
      const v = nums[0]!
      if (Number.isInteger(v) && v > 0) results.add(v)
      return
    }
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue
        const a = nums[i]!
        const b = nums[j]!
        const rest = nums.filter((_, k) => k !== i && k !== j)
        for (const op of ops) {
          const r = applyOp(a, b, op)
          if (r === null) continue
          search([r, ...rest])
        }
      }
    }
  }

  search(numbers)
  return Array.from(results)
}
