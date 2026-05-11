import { mulberry32, hashDateString } from '../lib/prng'
import { allAchievable } from './solver'
import type { Level, Op } from './types'

const NUMBER_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const ALL_OPS: Op[] = ['+', '-', '*', '/']

export function getDailyPuzzle(date: string): Level {
  const seed = hashDateString(date)
  const rng = mulberry32(seed)

  function seededPick<T>(arr: T[]): T {
    return arr[Math.floor(rng() * arr.length)]!
  }

  for (let attempt = 0; attempt < 1000; attempt++) {
    const numbers = Array.from({ length: 4 }, () => seededPick(NUMBER_POOL))
    const achievable = allAchievable(numbers, ALL_OPS)
    const inputSet = new Set(numbers)
    // Easy difficulty: target 6-100, not equal to any single input
    const candidates = achievable.filter((v) => v > 5 && v <= 100 && !inputSet.has(v))
    if (candidates.length === 0) continue
    const target = seededPick(candidates)
    return {
      id: `daily-${date}`,
      tier: '24',
      index: 0,
      target,
      numbers,
      allowedOps: ALL_OPS,
      timeLimitSec: 90,
    }
  }

  return {
    id: `daily-${date}`,
    tier: '24',
    index: 0,
    target: 24,
    numbers: [3, 8, 3, 8],
    allowedOps: ALL_OPS,
    timeLimitSec: 90,
  }
}
