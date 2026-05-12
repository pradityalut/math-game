import { cn } from '../lib/cn'

interface NumberChipProps {
  value: number
  used: boolean
  onClick: () => void
}

export default function NumberChip({ value, used, onClick }: NumberChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      aria-label={`Number ${value}${used ? ', already used' : ''}`}
      className={cn(
        'flex items-center justify-center rounded-xl select-none',
        'h-12 w-12 sm:h-14 sm:w-14',
        'transition-all duration-100 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
        used
          ? 'opacity-30 cursor-not-allowed'
          : 'cursor-pointer',
      )}
      style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: '1.25rem',
        fontWeight: 600,
        background: used ? '#F5F0E8' : '#FFFFFF',
        color: '#1C1917',
        border: '1px solid #E8E0D5',
        borderBottom: used ? '1px solid #E8E0D5' : '3px solid #C8B8A2',
      }}
      onMouseDown={(e) => {
        if (used) return
        e.currentTarget.style.transform = 'translateY(2px)'
        e.currentTarget.style.borderBottomWidth = '1px'
      }}
      onMouseUp={(e) => {
        if (used) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = '3px'
      }}
      onMouseLeave={(e) => {
        if (used) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = '3px'
      }}
    >
      {value}
    </button>
  )
}
