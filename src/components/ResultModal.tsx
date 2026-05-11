import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRow from './StarRow'
import { renderShareCard } from '../lib/canvas-share'
import type { ShareCardData } from '../engine/types'

interface ResultModalProps {
  timeSec: number
  stars: 0 | 1 | 2 | 3
  nextLevelPath: string | null
  shareData?: ShareCardData
  pointsEarned?: number
  tierTotal?: number
  expired?: boolean
}

const STAR_MESSAGES: Record<0 | 1 | 2 | 3, string> = {
  0: "Time's Up!",
  1: 'Solved it!',
  2: 'Nice one!',
  3: 'Brilliant!',
}

export default function ResultModal({ timeSec, stars, nextLevelPath, shareData, pointsEarned, tierTotal, expired }: ResultModalProps) {
  const navigate = useNavigate()
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  async function handleShare() {
    if (!shareData) return
    setSharing(true)
    try {
      const blob = await renderShareCard(shareData)
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setShared(true)
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'mathdash-result.png'
        a.click()
        URL.revokeObjectURL(url)
        setShared(true)
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1C1917]/40 backdrop-blur-[2px]">
      <div
        className="w-full max-w-sm mx-4 bg-[#FEFCF8] rounded-t-3xl sm:rounded-3xl p-8 space-y-6 border border-[#E8E0D5]"
        style={{
          boxShadow: '0 -4px 0 0 #E8E0D5, 0 -24px 48px rgba(28,25,23,0.15)',
          animation: 'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <p
            className="text-4xl font-bold"
            style={{
              fontFamily: "'Fredoka', sans-serif",
              color: expired ? '#C84B31' : '#1C1917',
            }}
          >
            {STAR_MESSAGES[stars]}
          </p>
          <p className="text-[#78716C] text-sm">
            {expired
              ? "Don't worry — try the next one!"
              : <>Solved in <strong className="text-[#C84B31] font-bold">{timeSec}s</strong></>}
          </p>
          {!expired && pointsEarned !== undefined && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: '#E8F5EE', color: '#2D6A4F', fontFamily: "'Fredoka', sans-serif" }}
              >
                +{pointsEarned} pts
              </span>
              {tierTotal !== undefined && (
                <span
                  className="text-sm text-[#78716C]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Session: <strong className="text-[#1C1917]">{tierTotal}</strong> pts
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stars */}
        <div className="flex justify-center py-1">
          <StarRow stars={stars} size="lg" />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {shareData && (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full py-3 rounded-xl font-semibold text-base cursor-pointer transition-all duration-150 disabled:opacity-50"
              style={{
                fontFamily: "'Fredoka', sans-serif",
                background: '#FAF7F2',
                color: '#1C1917',
                border: '1px solid #E8E0D5',
                borderBottom: '3px solid #C8B8A2',
              }}
              onMouseDown={(e) => { (e.currentTarget.style.transform = 'translateY(2px)'); (e.currentTarget.style.borderBottomWidth = '1px') }}
              onMouseUp={(e) => { (e.currentTarget.style.transform = ''); (e.currentTarget.style.borderBottomWidth = '3px') }}
            >
              {sharing ? 'Generating...' : shared ? '✓ Copied to clipboard' : 'Share Result'}
            </button>
          )}

          {nextLevelPath ? (
            <button
              ref={nextBtnRef}
              autoFocus
              onClick={() => navigate(nextLevelPath)}
              className="w-full py-3 rounded-xl font-semibold text-base text-white cursor-pointer transition-all duration-150"
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '1.05rem',
                background: '#2D6A4F',
                borderBottom: '4px solid #1D4A37',
              }}
              onMouseDown={(e) => { (e.currentTarget.style.transform = 'translateY(3px)'); (e.currentTarget.style.borderBottomWidth = '1px') }}
              onMouseUp={(e) => { (e.currentTarget.style.transform = ''); (e.currentTarget.style.borderBottomWidth = '4px') }}
            >
              Next Level →
            </button>
          ) : (
            <button
              autoFocus
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl font-semibold text-base text-white cursor-pointer transition-all duration-150"
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '1.05rem',
                background: '#2D6A4F',
                borderBottom: '4px solid #1D4A37',
              }}
              onMouseDown={(e) => { (e.currentTarget.style.transform = 'translateY(3px)'); (e.currentTarget.style.borderBottomWidth = '1px') }}
              onMouseUp={(e) => { (e.currentTarget.style.transform = ''); (e.currentTarget.style.borderBottomWidth = '4px') }}
            >
              Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
