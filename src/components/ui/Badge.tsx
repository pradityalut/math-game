import type { HTMLAttributes, CSSProperties } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'success' | 'muted' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  display?: 'fredoka' | 'nunito'
}

const TONES: Record<BadgeTone, CSSProperties> = {
  success: { background: '#E8F5EE', color: '#2D6A4F' },
  muted: { background: '#F0EBE3', color: '#78716C' },
  warning: { background: '#FEF3C7', color: '#D97706' },
  danger: { background: '#FEE2E2', color: '#C84B31' },
}

export default function Badge({
  tone = 'muted',
  display = 'fredoka',
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full', className)}
      style={{
        ...TONES[tone],
        fontFamily: display === 'fredoka' ? "'Fredoka', sans-serif" : "'Nunito', sans-serif",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
