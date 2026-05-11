import { useMemo } from 'react'
import { useProgress } from '../store/progress'
import Play from './Play'
import { getDailyPuzzle } from '../engine/daily'
import { todayUTC } from '../lib/prng'

export default function DailyPlay() {
  const today = todayUTC()
  const level = useMemo(() => getDailyPuzzle(today), [today])
  const { recordDailyPlay } = useProgress()

  function handleSolve() {
    recordDailyPlay(today)
  }

  return <Play levelOverride={level} onSolve={handleSolve} />
}
