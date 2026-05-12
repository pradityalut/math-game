import { useEffect, useRef, useState } from 'react'

interface TimerBarProps {
  totalSec: number
  running: boolean
  onTick?: (elapsed: number) => void
  onExpire?: () => void
}

export default function TimerBar({ totalSec, running, onTick, onExpire }: TimerBarProps) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    startRef.current = performance.now() - elapsed * 1000

    const tick = (now: number) => {
      const e = (now - (startRef.current ?? now)) / 1000
      const clamped = Math.min(e, totalSec)
      setElapsed(clamped)
      onTick?.(clamped)

      if (clamped >= totalSec) {
        onExpire?.()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const pct = Math.max(0, 1 - elapsed / totalSec)
  const remaining = Math.max(0, Math.ceil(totalSec - elapsed))

  const barColor =
    pct >= 0.66 ? '#7CC6FF' :
    pct >= 0.33 ? '#D97706' :
    '#C84B31'

  const textColor =
    pct >= 0.66 ? '#4A9CC8' :
    pct >= 0.33 ? '#D97706' :
    '#C84B31'

  const hint =
    pct >= 0.66 ? "You've got this!" :
    pct >= 0.33 ? 'Tick tock…' :
    'Last chance!'

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <span
          className="font-semibold tabular-nums text-sm"
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '1rem',
            color: textColor,
          }}
        >
          {remaining}s
        </span>
        <span className="text-xs text-[#A09080]">
          {hint}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-[#E8E0D5] overflow-hidden border border-[#D4C8BA]">
        <div
          className="h-full rounded-full"
          style={{
            transform: `scaleX(${pct})`,
            transformOrigin: 'left',
            backgroundColor: barColor,
            transition: 'background-color 0.5s ease',
          }}
        />
      </div>
    </div>
  )
}
