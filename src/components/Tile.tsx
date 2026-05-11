import { cn } from '../lib/cn'

interface TileProps {
  value: number
  isSelected: boolean
  isUsed?: boolean
  onClick: () => void
}

export default function Tile({ value, isSelected, isUsed = false, onClick }: TileProps) {
  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      aria-pressed={isSelected}
      className={cn(
        'relative flex items-center justify-center rounded-xl select-none',
        'h-16 w-16 sm:h-20 sm:w-20',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
        'cursor-pointer transition-all duration-100 ease-out',
        isUsed && 'opacity-0 pointer-events-none scale-75',
        !isUsed && !isSelected && [
          'bg-[#F0EBE3] text-[#1C1917]',
          'border-b-4 border-[#C8B8A2]',
          'hover:-translate-y-0.5 hover:border-b-[5px]',
          'active:translate-y-1 active:border-b-0 active:border-b-[1px]',
        ],
        isSelected && [
          'bg-[#1A1A2E] text-white',
          'border-b-4 border-[#0A0A1A]',
          'scale-105',
        ],
      )}
      style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: '1.6rem',
        fontWeight: 600,
        minWidth: 64,
        minHeight: 64,
      }}
    >
      {value}
    </button>
  )
}
