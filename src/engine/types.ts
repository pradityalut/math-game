export type Op = '+' | '-' | '*' | '/'
export type Paren = '(' | ')'

export type Token =
  | { kind: 'num'; value: number; chipIdx: number }
  | { kind: 'op'; value: Op }
  | { kind: 'paren'; value: Paren }

export type Tier = 'easy' | 'medium' | 'hard' | '24'

export interface LevelSlot {
  id: string
  tier: Tier
  index: number
  timeLimitSec: number
}

export interface Level extends LevelSlot {
  target: number
  numbers: number[]
  allowedOps: Op[]
}

export interface LevelResult {
  solved: boolean
  stars: 0 | 1 | 2 | 3
  solvedAt: string
}

export interface PlayerProgress {
  version: 1
  levels: Record<string, LevelResult>
  dailyStreak: { lastPlayedDate: string; count: number }
  settings: { soundOn: boolean; theme: string }
}

export interface ShareCardData {
  levelId: string
  tier: Tier
  target: number
  timeSec: number
  stars: 0 | 1 | 2 | 3
  expression: string
}
