import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LevelResult, PlayerProgress } from '../engine/types'
import * as audio from '../lib/audio'

interface ProgressActions {
  recordSolve: (id: string, stars: 1 | 2 | 3) => void
  recordDailyPlay: (date: string) => void
  markVisited: (id: string) => void
  isUnlocked: (id: string) => boolean
  getLevelResult: (id: string) => LevelResult | undefined
  resetAll: () => void
  toggleSfx: () => void
  toggleBgm: () => void
}

type ProgressStore = PlayerProgress & ProgressActions

const initial: PlayerProgress = {
  version: 2,
  levels: {},
  dailyStreak: { lastPlayedDate: '', count: 0 },
  settings: { sfxOn: true, bgmOn: false, theme: 'default' },
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
            visited: true,
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

      markVisited(id) {
        set((s) => {
          const existing = s.levels[id]
          if (existing?.visited || existing?.solved) return s
          return {
            levels: {
              ...s.levels,
              [id]: { solved: false, visited: true, stars: 0, solvedAt: '' },
            },
          }
        })
      },

      isUnlocked(id) {
        const result = get().levels[id]
        return result?.visited === true || result?.solved === true
      },

      getLevelResult(id) {
        return get().levels[id]
      },

      resetAll() {
        set(initial)
      },

      toggleSfx() {
        set((s) => ({ settings: { ...s.settings, sfxOn: !s.settings.sfxOn } }))
      },

      toggleBgm() {
        set((s) => {
          const next = !s.settings.bgmOn
          if (next) audio.startBgm()
          else audio.stopBgm()
          return { settings: { ...s.settings, bgmOn: next } }
        })
      },
    }),
    {
      name: 'mathdash:progress',
      version: 2,
      migrate(persisted: unknown, fromVersion: number) {
        const p = persisted as Record<string, unknown>
        if (fromVersion < 2) {
          const settings = (p.settings ?? {}) as Record<string, unknown>
          const soundOn = typeof settings.soundOn === 'boolean' ? settings.soundOn : true
          const { soundOn: _removed, ...rest } = settings
          void _removed
          p.settings = { ...rest, sfxOn: soundOn, bgmOn: false }
        }
        return p as unknown as PlayerProgress
      },
    }
  )
)
