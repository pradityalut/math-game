import { useMemo } from 'react'
import { useProgress } from '../store/progress'
import Play from './Play'
import { getDailyPuzzle } from '../engine/daily'
import { todayUTC } from '../lib/prng'

export default function DailyPlay() {
  const today = todayUTC()
  const { recordDailyPlay, dailyStreak } = useProgress()
  const level = useMemo(() => {
    const base = getDailyPuzzle(today)
    return dailyStreak.count >= 10 ? { ...base, timeLimitSec: 60 } : base
  }, [today, dailyStreak.count])

  function handleSolve() {
    recordDailyPlay(today)
  }

  return <Play levelOverride={level} onSolve={handleSolve} />
}
