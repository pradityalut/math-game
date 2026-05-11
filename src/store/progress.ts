import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LevelResult, PlayerProgress } from '../engine/types'

interface ProgressActions {
  recordSolve: (id: string, stars: 1 | 2 | 3) => void
  recordDailyPlay: (date: string) => void
  isUnlocked: (id: string) => boolean
  getLevelResult: (id: string) => LevelResult | undefined
  resetAll: () => void
}

type ProgressStore = PlayerProgress & ProgressActions

const initial: PlayerProgress = {
  version: 1,
  levels: {},
  dailyStreak: { lastPlayedDate: '', count: 0 },
  settings: { soundOn: true, theme: 'default' },
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initial,

      recordSolve(id, stars) {
        set((s) => {
          const prev = s.levels[id]
          const newResult: LevelResult = {
            solved: true,
            stars: (Math.max(stars, prev?.stars ?? 0) as 0 | 1 | 2 | 3),
            solvedAt: new Date().toISOString(),
          }
          return { levels: { ...s.levels, [id]: newResult } }
        })
      },

      recordDailyPlay(date) {
        set((s) => {
          const streak = s.dailyStreak
          const yesterday = new Date()
          yesterday.setUTCDate(yesterday.getUTCDate() - 1)
          const yesterdayStr = yesterday.toISOString().slice(0, 10)
          const count =
            streak.lastPlayedDate === yesterdayStr ? streak.count + 1 : 1
          return { dailyStreak: { lastPlayedDate: date, count } }
        })
      },

      isUnlocked(_id) {
        return true
      },

      getLevelResult(id) {
        return get().levels[id]
      },

      resetAll() {
        set(initial)
      },
    }),
    {
      name: 'mathdash:progress',
      version: 1,
    }
  )
)
