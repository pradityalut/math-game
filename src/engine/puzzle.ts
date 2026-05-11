import type { Op, Tier } from './types'
import { allAchievable, hasSolution } from './solver'

const ALL_OPS: Op[] = ['+', '-', '*', '/']
const NUMBER_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const POOL_24 = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function generatePuzzle(tier: Tier): { numbers: number[]; target: number; allowedOps: Op[] } {
  if (tier === '24') {
    // 4 numbers from 1-9, target always 24
    for (let attempt = 0; attempt < 500; attempt++) {
      const numbers = Array.from({ length: 4 }, () => pickRandom(POOL_24))
      if (hasSolution(numbers, 24, ALL_OPS)) {
        return { numbers, target: 24, allowedOps: ALL_OPS }
      }
    }
    return { numbers: [3, 8, 3, 8], target: 24, allowedOps: ALL_OPS }
  }

  // Easy and Medium: target capped at 100; Hard: target up to 999
  const maxTarget = tier === 'hard' ? 999 : 100

  for (let attempt = 0; attempt < 200; attempt++) {
    const numbers = Array.from({ length: 4 }, () => pickRandom(NUMBER_POOL))
    const achievable = allAchievable(numbers)
    const inputSet = new Set(numbers)
    const candidates = achievable.filter((v) => v > 5 && v <= maxTarget && !inputSet.has(v))
    if (candidates.length === 0) continue
    const target = pickRandom(candidates)
    return { numbers, target, allowedOps: ALL_OPS }
  }

  return { numbers: [3, 7, 8, 12], target: 24, allowedOps: ALL_OPS }
}
