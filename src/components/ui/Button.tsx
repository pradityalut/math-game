import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

interface VariantSpec {
  background: string
  color: string
  border?: string
  shadow: string
  shadowColor: string
  depth: number
}

const VARIANTS: Record<ButtonVariant, VariantSpec> = {
  primary: {
    background: '#2D6A4F',
    color: '#FFFFFF',
    shadowColor: '#1D4A37',
    shadow: '4px solid #1D4A37',
    depth: 4,
  },
  dark: {
    background: '#1A1A2E',
    color: '#FFFFFF',
    shadowColor: '#0A0A1A',
    shadow: '4px solid #0A0A1A',
    depth: 4,
  },
  secondary: {
    background: '#FAF7F2',
    color: '#1C1917',
    border: '1px solid #E8E0D5',
    shadowColor: '#C8B8A2',
    shadow: '3px solid #C8B8A2',
    depth: 3,
  },
  ghost: {
    background: 'transparent',
    color: '#1C1917',
    shadowColor: 'transparent',
    shadow: '0 solid transparent',
    depth: 0,
  },
}

const SIZES: Record<ButtonSize, { py: string; px: string; fontSize: string }> = {
  sm: { py: 'py-2', px: 'px-3', fontSize: '0.9rem' },
  md: { py: 'py-3', px: 'px-5', fontSize: '1rem' },
  lg: { py: 'py-4', px: 'px-5', fontSize: '1.05rem' },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, style, children, disabled, ...rest },
  ref,
) {
  const v = VARIANTS[variant]
  const s = SIZES[size]

  const baseStyle: CSSProperties = {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: s.fontSize,
    background: v.background,
    color: v.color,
    borderBottom: v.shadow,
    ...(v.border ? { border: v.border, borderBottom: v.shadow } : {}),
    ...style,
  }

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'rounded-xl font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]',
        fullWidth && 'w-full',
        s.py,
        s.px,
        className,
      )}
      style={baseStyle}
      onMouseDown={(e) => {
        if (disabled || v.depth === 0) return
        e.currentTarget.style.transform = `translateY(${v.depth - 1}px)`
        e.currentTarget.style.borderBottomWidth = '1px'
      }}
      onMouseUp={(e) => {
        if (v.depth === 0) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = `${v.depth}px`
      }}
      onMouseLeave={(e) => {
        if (v.depth === 0) return
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderBottomWidth = `${v.depth}px`
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
