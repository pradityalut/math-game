import { cn } from '../lib/cn'
import type { Op } from '../engine/types'

const OP_LABELS: Record<Op, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

interface OperatorBarProps {
  allowedOps: Op[]
  selectedOp: Op | null
  onSelect: (op: Op) => void
}

export default function OperatorBar({ allowedOps, selectedOp, onSelect }: OperatorBarProps) {
  return (
    <div className="flex gap-3 justify-center">
      {allowedOps.map((op) => (
        <button
          key={op}
          onClick={() => onSelect(op)}
          aria-pressed={selectedOp === op}
          aria-label={`Operator ${OP_LABELS[op]}`}
          className={cn(
            'flex items-center justify-center rounded-xl cursor-pointer select-none',
            'h-13 w-13 sm:h-15 sm:w-15',
            'transition-all duration-100 ease-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
            selectedOp === op
              ? 'bg-[#1A1A2E] text-white border-b-4 border-[#0A0A1A] scale-105'
              : [
                  'bg-white text-[#4A5568] border border-[#E8E0D5]',
                  'border-b-4 border-b-[#C8B8A2]',
                  'hover:-translate-y-0.5',
                  'active:translate-y-1 active:border-b active:border-b-[#C8B8A2]',
                ],
          )}
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            minWidth: 52,
            minHeight: 52,
          }}
        >
          {OP_LABELS[op]}
        </button>
      ))}
    </div>
  )
}
