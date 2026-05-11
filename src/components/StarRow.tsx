import { cn } from '../lib/cn'

interface StarRowProps {
  stars: 0 | 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRow({ stars, size = 'md' }: StarRowProps) {
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-5xl' }

  return (
    <div className={cn('flex gap-1 items-center', sizes[size])}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="transition-all duration-300"
          style={{
            color: i <= stars ? '#D97706' : '#D4C8BA',
            transitionDelay: `${(i - 1) * 120}ms`,
            display: 'inline-block',
            transform: i <= stars ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}
