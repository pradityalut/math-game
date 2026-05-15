import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../store/progress'
import { useSession } from '../store/session'
import LevelCard from '../components/LevelCard'
import SoundToggles from '../components/SoundToggles'
import SupportCard from '../components/SupportCard'
import { Button, Tabs, Card } from '../components/ui'
import type { TabSpec } from '../components/ui'
import levels from '../data/levels.json'
import type { Tier, LevelSlot } from '../engine/types'

const TIERS: TabSpec<Tier>[] = [
  {
    id: 'easy',
    label: 'Easy',
    activeStyle: { background: '#2D6A4F', color: '#fff', borderBottom: '3px solid #1D4A37' },
  },
  {
    id: 'medium',
    label: 'Medium',
    activeStyle: { background: '#D97706', color: '#fff', borderBottom: '3px solid #B45309' },
  },
  {
    id: 'hard',
    label: 'Hard',
    activeStyle: { background: '#C84B31', color: '#fff', borderBottom: '3px solid #9B3A25' },
  },
  {
    id: '24',
    label: 'Game 24',
    activeStyle: { background: '#5B21B6', color: '#fff', borderBottom: '3px solid #3B0F8C' },
  },
]

export default function Home() {
  const [activeTier, setActiveTier] = useState<Tier>('easy')
  const navigate = useNavigate()
  const { getLevelResult, dailyStreak, isUnlocked } = useProgress()
  const { getTierScore } = useSession()

  const tierLevels = (levels as LevelSlot[]).filter((l) => l.tier === activeTier)
  const sessionScore = getTierScore(activeTier)

  const totalSolved = (levels as LevelSlot[]).filter(
    (l) => getLevelResult(l.id)?.solved
  ).length

  return (
    <div className="min-h-dvh px-4 md:px-8 py-8">
      <div className="grid grid-cols-12">
        <div className="col-span-12 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6 flex flex-col gap-7">
          {/* Header */}
          <div className="relative text-center space-y-0.5">
            <div className="absolute right-0 top-0">
              <SoundToggles />
            </div>
            <h1
              className="text-5xl font-bold text-[#1C1917]"
              style={{ fontFamily: "'Fredoka', sans-serif", letterSpacing: '-0.5px' }}
            >
              MathDash
            </h1>
            <p className="text-[#78716C] text-sm font-medium">
              Combine numbers · Hit the target
            </p>
            {totalSolved > 0 && (
              <p className="text-xs text-[#A09080] pt-0.5">
                {totalSolved} / {levels.length} levels solved
              </p>
            )}
          </div>

          {/* Daily Challenge */}
          <Button
            variant="dark"
            size="lg"
            fullWidth
            onClick={() => navigate('/play/24/daily')}
            className="flex items-center justify-between"
          >
            <span>Daily Challenge</span>
            <span className="text-sm opacity-70 font-normal">
              {dailyStreak.count > 0 ? `${dailyStreak.count} day streak 🔥` : 'Click to Play'}
            </span>
          </Button>

          {/* Tier Tabs */}
          <Tabs<Tier> value={activeTier} onChange={setActiveTier} tabs={TIERS} />

          {/* Session score */}
          {sessionScore > 0 && (
            <Card tone="success" className="flex items-center justify-between px-4 py-2">
              <span
                className="text-sm text-[#2D6A4F] font-medium"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Session score
              </span>
              <span
                className="text-base font-bold text-[#2D6A4F]"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                {sessionScore} pts
              </span>
            </Card>
          )}

          {/* Level Grid */}
          <div className="grid grid-cols-4 gap-3">
            {tierLevels.map((level) => (
              <LevelCard
                key={level.id}
                level={level as LevelSlot}
                result={getLevelResult(level.id)}
                unlocked={level.index === 1 || isUnlocked(level.id)}
              />
            ))}
          </div>
          <SupportCard />

          <p className="text-center text-xs text-[#C8B8A2] mt-auto pb-2">
            No sign-up · Progress saved on this device
          </p>
        </div>
      </div>
    </div>
  )
}
