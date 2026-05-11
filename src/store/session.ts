import { create } from 'zustand'
import type { Tier } from '../engine/types'

interface SessionStore {
  tierScores: Partial<Record<Tier, number>>
  addScore: (tier: Tier, points: number) => void
  resetTier: (tier: Tier) => void
  getTierScore: (tier: Tier) => number
}

export const useSession = create<SessionStore>()((set, get) => ({
  tierScores: {},

  addScore(tier, points) {
    set((s) => ({
      tierScores: {
        ...s.tierScores,
        [tier]: (s.tierScores[tier] ?? 0) + points,
      },
    }))
  },

  resetTier(tier) {
    set((s) => ({ tierScores: { ...s.tierScores, [tier]: 0 } }))
  },

  getTierScore(tier) {
    return get().tierScores[tier] ?? 0
  },
}))
