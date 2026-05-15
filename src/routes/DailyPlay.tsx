import { useMemo } from 'react'
import { useProgress } from '../store/progress'
import Play from './Play'
import { getDailyPuzzle } from '../engine/daily'
import { todayUTC } from '../lib/prng'

export default function DailyPlay() {
  const today = todayUTC()
  const { recordDailyPlay, dailyStreak } = useProgress()
  const level = useMemo(() => {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    const isActive = dailyStreak.lastPlayedDate === today || dailyStreak.lastPlayedDate === yesterdayStr
    const activeCount = isActive ? dailyStreak.count : 0
    const base = getDailyPuzzle(today)
    return activeCount >= 10 ? { ...base, timeLimitSec: 60 } : base
  }, [today, dailyStreak.lastPlayedDate, dailyStreak.count])

  function handleSolve() {
    recordDailyPlay(today)
  }

  return <Play levelOverride={level} onSolve={handleSolve} />
}
