import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRow from './StarRow'
import { Button, Dialog, Badge } from './ui'
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
  3: 'Perfect! 🔥',
}

export default function ResultModal({ timeSec, stars, nextLevelPath, shareData, pointsEarned, tierTotal, expired }: ResultModalProps) {
  const navigate = useNavigate()
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const isPerfect = stars === 3

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
    <Dialog isPerfect={isPerfect}>
      {/* Header */}
      <div className="text-center space-y-1">
        <p
          className="text-4xl font-bold"
          style={{
            fontFamily: "'Fredoka', sans-serif",
            color: expired ? '#C84B31' : isPerfect ? '#1C1917' : '#1C1917',
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
            <Badge tone="success">+{pointsEarned} pts</Badge>
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
          <Button
            variant="secondary"
            fullWidth
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? 'Generating...' : shared ? '✓ Copied to clipboard' : 'Share Result'}
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          autoFocus
          onClick={() => navigate(nextLevelPath ?? '/')}
        >
          {nextLevelPath ? 'Next Level →' : 'Back to Menu'}
        </Button>
      </div>
    </Dialog>
  )
}
