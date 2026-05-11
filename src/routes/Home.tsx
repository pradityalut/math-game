import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../store/progress'
import { useSession } from '../store/session'
import LevelCard from '../components/LevelCard'
import { cn } from '../lib/cn'
import levels from '../data/levels.json'
import type { Tier, LevelSlot } from '../engine/types'

const TIERS: { id: Tier; label: string; color: string; activeStyle: React.CSSProperties }[] = [
  {
    id: 'easy',
    label: 'Easy',
    color: 'text-[#2D6A4F]',
    activeStyle: { background: '#2D6A4F', color: '#fff', borderBottom: '3px solid #1D4A37' },
  },
  {
    id: 'medium',
    label: 'Medium',
    color: 'text-[#D97706]',
    activeStyle: { background: '#D97706', color: '#fff', borderBottom: '3px solid #B45309' },
  },
  {
    id: 'hard',
    label: 'Hard',
    color: 'text-[#C84B31]',
    activeStyle: { background: '#C84B31', color: '#fff', borderBottom: '3px solid #9B3A25' },
  },
  {
    id: '24',
    label: 'Game 24',
    color: 'text-[#5B21B6]',
    activeStyle: { background: '#5B21B6', color: '#fff', borderBottom: '3px solid #3B0F8C' },
  },
]

export default function Home() {
  const [activeTier, setActiveTier] = useState<Tier>('easy')
  const navigate = useNavigate()
  const { getLevelResult, dailyStreak } = useProgress()
  const { getTierScore } = useSession()

  const tierLevels = (levels as LevelSlot[]).filter((l) => l.tier === activeTier)
  const sessionScore = getTierScore(activeTier)

  const totalSolved = (levels as LevelSlot[]).filter(
    (l) => getLevelResult(l.id)?.solved
  ).length

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto px-4 py-8 gap-7">
      {/* Header */}
      <div className="text-center space-y-0.5">
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
            {totalSolved} / 40 levels solved
          </p>
        )}
      </div>

      {/* Daily Challenge */}
      <button
        onClick={() => navigate('/play/24/daily')}
        className="w-full py-4 rounded-2xl text-white font-semibold text-base cursor-pointer transition-all duration-150 flex items-center justify-between px-5"
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: '1.05rem',
          background: '#1A1A2E',
          borderBottom: '4px solid #0A0A1A',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.borderBottomWidth = '1px' }}
        onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderBottomWidth = '4px' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderBottomWidth = '4px' }}
      >
        <span>Daily Challenge</span>
        <span className="text-sm opacity-70 font-normal">
          {dailyStreak.count > 0 ? `${dailyStreak.count} day streak 🔥` : 'Make 24'}
        </span>
      </button>

      {/* Tier Tabs */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: '#EDE7DF', border: '1px solid #D4C8BA' }}
      >
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTier(t.id)}
            className={cn(
              'flex-1 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-150',
              activeTier !== t.id && 'text-[#78716C] hover:text-[#1C1917]',
            )}
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '0.95rem',
              ...(activeTier === t.id ? t.activeStyle : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Session score */}
      {sessionScore > 0 && (
        <div
          className="flex items-center justify-between px-4 py-2 rounded-xl"
          style={{ background: '#E8F5EE', border: '1px solid #B7DFC9' }}
        >
          <span className="text-sm text-[#2D6A4F] font-medium" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Session score
          </span>
          <span className="text-base font-bold text-[#2D6A4F]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {sessionScore} pts
          </span>
        </div>
      )}

      {/* Level Grid */}
      <div className="grid grid-cols-5 gap-2.5">
        {tierLevels.map((level) => (
          <LevelCard
            key={level.id}
            level={level as LevelSlot}
            result={getLevelResult(level.id)}
            unlocked={true}
          />
        ))}
      </div>

      <p className="text-center text-xs text-[#C8B8A2] mt-auto pb-2">
        No sign-up · Progress saved on this device
      </p>
    </div>
  )
}
