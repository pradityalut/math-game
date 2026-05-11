import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import StarRow from './StarRow'
import type { LevelSlot, LevelResult } from '../engine/types'

interface LevelCardProps {
  level: LevelSlot
  result: LevelResult | undefined
  unlocked: boolean
}

export default function LevelCard({ level, result, unlocked }: LevelCardProps) {
  const navigate = useNavigate()

  function handleClick() {
    if (!unlocked) return
    navigate(`/play/${level.tier}/${level.index}`)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!unlocked}
      aria-label={`Level ${level.index}${!unlocked ? ', locked' : result?.solved ? `, ${result.stars} stars` : ''}`}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 rounded-xl p-2',
        'w-full aspect-square transition-all duration-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
        unlocked && !result?.solved && 'cursor-pointer',
        unlocked && result?.solved && 'cursor-pointer',
        !unlocked && 'cursor-not-allowed',
      )}
      style={
        unlocked
          ? {
              background: result?.solved ? '#F5F0E8' : '#FFFFFF',
              border: '1px solid #E8E0D5',
              borderBottom: result?.solved ? '3px solid #C8B8A2' : '3px solid #E8E0D5',
              opacity: 1,
            }
          : {
              background: '#F5F2EE',
              border: '1px solid #EDE7DF',
              borderBottom: '2px solid #EDE7DF',
              opacity: 0.55,
            }
      }
      onMouseDown={(e) => {
        if (!unlocked) return
        e.currentTarget.style.transform = 'translateY(2px)'
        e.currentTarget.style.borderBottomWidth = '1px'
      }}
      onMouseUp={(e) => {
        if (!unlocked) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = result?.solved ? '3px' : '3px'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = result?.solved ? '3px' : '3px'
      }}
    >
      {!unlocked && (
        <svg
          className="w-4 h-4 absolute top-1.5 right-1.5 text-[#C8B8A2]"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span
        className="text-lg font-semibold text-[#1C1917]"
        style={{ fontFamily: "'Fredoka', sans-serif" }}
      >
        {level.index}
      </span>
      {result?.solved && <StarRow stars={result.stars} size="sm" />}
    </button>
  )
}
