import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProgress } from '../store/progress'
import { useSession } from '../store/session'
import NumberChip from '../components/NumberChip'
import ExpressionField from '../components/ExpressionField'
import TimerBar from '../components/TimerBar'
import ResultModal from '../components/ResultModal'
import {
  evaluate,
  isWellFormed,
  isComplete,
  usedChipIndices,
  calcStars,
  makeNumToken,
  makeOpToken,
  makeParenToken,
  tokensToString,
} from '../engine/expression'
import { generatePuzzle } from '../engine/puzzle'
import type { Level, LevelSlot, Op, Paren, Token, ShareCardData } from '../engine/types'
import levels from '../data/levels.json'
import { cn } from '../lib/cn'

interface PlayProps {
  levelOverride?: Level
  onSolve?: () => void
}

const OP_LABELS: Record<Op, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

export default function Play({ levelOverride, onSolve }: PlayProps) {
  const { tier, level: levelIdx } = useParams()
  const navigate = useNavigate()
  const { recordSolve } = useProgress()
  const { addScore, getTierScore } = useSession()

  const slot: LevelSlot | undefined = levelOverride
    ? undefined
    : (levels as LevelSlot[]).find((l) => l.tier === tier && l.index === Number(levelIdx))

  const [generatedPuzzle, setGeneratedPuzzle] = useState<Pick<Level, 'numbers' | 'target' | 'allowedOps'> | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)

  const level: Level | undefined = levelOverride
    ?? (slot && generatedPuzzle ? { ...slot, ...generatedPuzzle } : undefined)

  const [tokens, setTokens] = useState<Token[]>([])
  const [running, setRunning] = useState(false)
  const [expired, setExpired] = useState(false)
  const [solved, setSolved] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [shareData, setShareData] = useState<ShareCardData | null>(null)
  const [submitFlash, setSubmitFlash] = useState<null | 'incomplete'>(null)
  const [submitFeedback, setSubmitFeedback] = useState<{ value: number; correct: boolean } | null>(null)

  const elapsedRef = useRef(0)

  const usedChips = useMemo(() => usedChipIndices(tokens), [tokens])
  const wellFormed = useMemo(() => isWellFormed(tokens), [tokens])
  const complete = useMemo(() => isComplete(tokens), [tokens])

  const liveResult = useMemo(() => {
    if (tokens.length === 0) return null
    if (!complete) return null
    const r = evaluate(tokens)
    return r.ok ? r.value : null
  }, [tokens, complete])

  const allUsed = level ? usedChips.size === level.numbers.length : false
  const fieldState: 'idle' | 'valid' | 'invalid' =
    !wellFormed ? 'invalid'
      : complete && level && liveResult === level.target && allUsed ? 'valid'
      : 'idle'

  // Generate a random puzzle whenever the slot changes (skip for levelOverride / daily)
  useEffect(() => {
    if (levelOverride) return
    if (!slot) { navigate('/'); return }
    setGeneratedPuzzle(generatePuzzle(slot.tier))
    setTokens([])
    setRunning(false)
    setExpired(false)
    setSolved(false)
    setElapsedSec(0)
    elapsedRef.current = 0
    setPointsEarned(0)
  }, [slot?.id, levelOverride])

  // Reset UI state when daily level loads
  useEffect(() => {
    if (!levelOverride) return
    setTokens([])
    setRunning(false)
    setExpired(false)
    setSolved(false)
    setElapsedSec(0)
    elapsedRef.current = 0
    setPointsEarned(0)
  }, [levelOverride?.id])

  function startIfNeeded() {
    if (!running && !solved && !expired) setRunning(true)
  }

  function handleTick(e: number) { elapsedRef.current = e; setElapsedSec(e) }
  function handleExpire() { setRunning(false); setExpired(true) }

  function pushToken(t: Token) {
    startIfNeeded()
    if (solved || expired) return
    setSubmitFlash(null)
    setSubmitFeedback(null)
    setTokens((prev) => [...prev, t])
  }

  function handleNumber(idx: number, value: number) {
    if (usedChips.has(idx)) return
    pushToken(makeNumToken(value, idx))
  }

  function handleOp(op: Op) {
    pushToken(makeOpToken(op))
  }

  function handleParen(p: Paren) {
    pushToken(makeParenToken(p))
  }

  function handleBackspace() {
    if (solved || expired) return
    setSubmitFlash(null)
    setSubmitFeedback(null)
    setTokens((prev) => prev.slice(0, -1))
  }

  function handleClear() {
    if (solved || expired) return
    setSubmitFlash(null)
    setSubmitFeedback(null)
    setTokens([])
  }

  function handleSubmit() {
    if (solved || expired || !level) return

    if (!complete || !wellFormed) {
      setSubmitFlash('incomplete')
      setTimeout(() => setSubmitFlash(null), 600)
      return
    }
    if (!allUsed) {
      setSubmitFlash('incomplete')
      setTimeout(() => setSubmitFlash(null), 600)
      return
    }

    const r = evaluate(tokens)
    if (!r.ok || r.value !== level.target) {
      setSubmitFeedback({ value: r.ok ? r.value : 0, correct: false })
      return
    }

    const elapsed = elapsedRef.current
    const s = calcStars(elapsed, level.timeLimitSec)
    const pts = Math.max(0, Math.round(level.timeLimitSec - elapsed))
    setRunning(false)
    setSolved(true)
    setPointsEarned(pts)
    recordSolve(level.id, s)
    if (!level.id.startsWith('daily')) addScore(level.tier, pts)
    onSolve?.()
    setShareData({
      levelId: level.id,
      tier: level.tier,
      target: level.target,
      timeSec: Math.round(elapsed * 10) / 10,
      stars: s,
      expression: `${tokensToString(tokens)} = ${level.target}`,
    })
  }

  const nextLevelPath = useCallback(() => {
    if (!level || level.id.startsWith('daily')) return null
    if (level.index >= 10) return null
    return `/play/${level.tier}/${level.index + 1}`
  }, [level])

  if (!level) return null

  const tierLabel = level.id.startsWith('daily')
    ? 'Daily Challenge'
    : level.tier === '24'
    ? `Game 24 · ${level.index}`
    : `${level.tier.charAt(0).toUpperCase() + level.tier.slice(1)} · ${level.index}`

  const submitDisabled = !complete || !wellFormed || !allUsed || solved || expired

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto px-4 py-5 gap-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer text-sm font-medium py-2 -ml-1 pr-2"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Menu
        </button>

        <span
          className="text-xs font-semibold uppercase tracking-wider text-[#78716C] px-3 py-1.5 rounded-full"
          style={{ background: '#EDE7DF', fontFamily: "'Nunito', sans-serif" }}
        >
          {tierLabel}
        </span>

        <span
          className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-full"
          style={{
            fontFamily: "'Fredoka', sans-serif",
            background: elapsedSec / level.timeLimitSec > 0.75 ? '#FCE7E1' : '#EDE7DF',
            color: elapsedSec / level.timeLimitSec > 0.75 ? '#C84B31' : '#1C1917',
            minWidth: 60,
            textAlign: 'center',
          }}
        >
          {Math.max(0, Math.ceil(level.timeLimitSec - elapsedSec))}s
        </span>
      </div>

      {/* Timer */}
      <TimerBar
        totalSec={level.timeLimitSec}
        running={running}
        onTick={handleTick}
        onExpire={handleExpire}
      />

      {/* Target + Numbers */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div
            className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#A09080] mb-0.5"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Target
          </div>
          <div
            className="text-7xl font-bold leading-none text-[#C84B31]"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            {level.target}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#A09080]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Numbers
          </span>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {level.numbers.map((n, idx) => (
              <NumberChip
                key={idx}
                value={n}
                used={usedChips.has(idx)}
                onClick={() => handleNumber(idx, n)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Expression field */}
      <div className={cn(submitFeedback && !submitFeedback.correct && 'animate-[shake_400ms_ease]')}>
        <ExpressionField
          tokens={tokens}
          state={fieldState}
          submitFeedback={submitFeedback}
        />
      </div>

      {/* Operators row */}
      <div className="grid grid-cols-6 gap-2">
        {(['+', '-', '*', '/'] as Op[])
          .filter((op) => level.allowedOps.includes(op))
          .map((op) => (
            <KeyButton key={op} label={OP_LABELS[op]} onClick={() => handleOp(op)} />
          ))}
        <KeyButton label="(" onClick={() => handleParen('(')} />
        <KeyButton label=")" onClick={() => handleParen(')')} />
      </div>

      {/* Backspace + Clear */}
      <div className="grid grid-cols-2 gap-2">
        <KeyButton label="⌫" onClick={handleBackspace} disabled={tokens.length === 0} />
        <KeyButton label="Clear" onClick={handleClear} disabled={tokens.length === 0} />
      </div>

      {/* Helper text */}
      <p
        className="text-xs text-[#A09080] leading-relaxed"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        Use <strong className="text-[#1C1917]">all {level.numbers.length} numbers</strong> exactly once. Tap operators and parentheses to build the expression. Every intermediate result must be a whole number.
      </p>

      {/* Bottom action bar */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={handleSubmit}
          disabled={submitDisabled}
          className={cn(
            'flex-1 py-3 rounded-xl font-bold text-base text-white transition-all duration-100',
            !submitDisabled && 'cursor-pointer',
          )}
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '1.05rem',
            background: submitDisabled ? '#D4C8BA' : '#2D6A4F',
            borderBottom: submitDisabled
              ? '4px solid #C8B8A2'
              : '4px solid #1D4A37',
          }}
          onMouseDown={(e) => {
            if (submitDisabled) return
            e.currentTarget.style.transform = 'translateY(3px)'
            e.currentTarget.style.borderBottomWidth = '1px'
          }}
          onMouseUp={(e) => {
            if (submitDisabled) return
            e.currentTarget.style.transform = ''
            e.currentTarget.style.borderBottomWidth = '4px'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.borderBottomWidth = '4px'
          }}
        >
          {submitFlash === 'incomplete' ? 'Use all numbers' : 'Submit'}
        </button>
      </div>

      {/* Expired */}
      {expired && !solved && (
        <ResultModal
          expired
          stars={0}
          timeSec={Math.round(elapsedSec * 10) / 10}
          nextLevelPath={nextLevelPath()}
        />
      )}

      {/* Solved */}
      {solved && shareData && (
        <ResultModal
          timeSec={Math.round(elapsedSec * 10) / 10}
          stars={calcStars(elapsedSec, level.timeLimitSec) as 1 | 2 | 3}
          nextLevelPath={nextLevelPath()}
          shareData={shareData}
          pointsEarned={!level.id.startsWith('daily') ? pointsEarned : undefined}
          tierTotal={!level.id.startsWith('daily') ? getTierScore(level.tier) : undefined}
        />
      )}
    </div>
  )
}

interface KeyButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

function KeyButton({ label, onClick, disabled = false }: KeyButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center rounded-xl select-none',
        'h-12 transition-all duration-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
      )}
      style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#4A5568',
        background: '#FFFFFF',
        border: '1px solid #E8E0D5',
        borderBottom: disabled ? '1px solid #E8E0D5' : '3px solid #C8B8A2',
      }}
      onMouseDown={(e) => {
        if (disabled) return
        e.currentTarget.style.transform = 'translateY(2px)'
        e.currentTarget.style.borderBottomWidth = '1px'
      }}
      onMouseUp={(e) => {
        if (disabled) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = '3px'
      }}
      onMouseLeave={(e) => {
        if (disabled) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = '3px'
      }}
    >
      {label}
    </button>
  )
}
