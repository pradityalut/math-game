import type { Token } from '../engine/types'
import { cn } from '../lib/cn'

interface SubmitFeedback {
  value: number
  correct: boolean
}

interface ExpressionFieldProps {
  tokens: Token[]
  state: 'idle' | 'valid' | 'invalid'
  submitFeedback?: SubmitFeedback | null
}

const OP_GLYPH: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

export default function ExpressionField({ tokens, state, submitFeedback }: ExpressionFieldProps) {
  const isEmpty = tokens.length === 0

  return (
    <div
      className={cn(
        'w-full min-h-[3.75rem] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-colors duration-150',
      )}
      style={{
        background: '#FFFFFF',
        border:
          state === 'invalid'
            ? '2px solid #C84B31'
            : state === 'valid'
            ? '2px solid #2D6A4F'
            : '2px solid #E8E0D5',
      }}
      aria-live="polite"
      aria-label="Current expression"
    >
      <div
        className="flex-1 flex flex-wrap items-center gap-1.5"
        style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '1.25rem' }}
      >
        {isEmpty ? (
          <span
            className="text-[#A09080] font-normal"
            style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem' }}
          >
            Tap a number to start building your expression…
          </span>
        ) : (
          tokens.map((t, i) => (
            <span
              key={i}
              className="tabular-nums"
              style={{
                color:
                  t.kind === 'op' ? '#4A5568' :
                  t.kind === 'paren' ? '#A09080' :
                  '#1C1917',
                fontWeight: t.kind === 'num' ? 600 : 500,
                animation: 'popIn 150ms ease-out',
              }}
            >
              {t.kind === 'num' ? t.value : t.kind === 'op' ? OP_GLYPH[t.value] : t.value}
            </span>
          ))
        )}
      </div>

      {submitFeedback != null && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
          style={{
            background: submitFeedback.correct ? '#E6F4EE' : '#FCE7E1',
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          <span className="text-xs font-medium" style={{ color: submitFeedback.correct ? '#2D6A4F' : '#C84B31' }}>=</span>
          <span
            className="text-base font-bold tabular-nums"
            style={{ color: submitFeedback.correct ? '#2D6A4F' : '#C84B31' }}
          >
            {submitFeedback.value}
          </span>
        </div>
      )}
    </div>
  )
}
