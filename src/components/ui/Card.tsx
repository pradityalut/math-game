import type { HTMLAttributes, CSSProperties } from 'react'
import { cn } from '../../lib/cn'

export type CardTone = 'surface' | 'paper' | 'success' | 'muted'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone
}

const TONES: Record<CardTone, CSSProperties> = {
  surface: { background: '#FFFFFF', border: '1px solid #E8E0D5' },
  paper: { background: '#FAF7F2', border: '1px solid #E8E0D5' },
  success: { background: '#E8F5EE', border: '1px solid #B7DFC9' },
  muted: { background: '#EDE7DF', border: '1px solid #D4C8BA' },
}

export default function Card({ tone = 'surface', className, style, children, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-xl', className)}
      style={{ ...TONES[tone], ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
