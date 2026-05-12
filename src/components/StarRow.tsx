import { cn } from '../lib/cn'

interface StarRowProps {
  stars: 0 | 1 | 2 | 3
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export default function StarRow({ stars, size = 'md' }: StarRowProps) {
  const sizes = { xs: 'text-[10px] gap-0.5', sm: 'text-base', md: 'text-2xl', lg: 'text-5xl' }

  const isPerfect = stars === 3

  return (
    <div
      className={cn('flex gap-1 items-center', sizes[size])}
      style={isPerfect ? { filter: 'drop-shadow(0 0 8px #C9FF3D99)' } : undefined}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="transition-all duration-300"
          style={{
            color: i <= stars ? (isPerfect ? '#C9FF3D' : '#D97706') : '#D4C8BA',
            transitionDelay: `${(i - 1) * 120}ms`,
            display: 'inline-block',
            transform: i <= stars ? (isPerfect ? 'scale(1.2)' : 'scale(1.1)') : 'scale(1)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}
