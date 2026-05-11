import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

export interface TabSpec<T extends string> {
  id: T
  label: string
  activeStyle?: CSSProperties
}

interface TabsProps<T extends string> {
  value: T
  onChange: (v: T) => void
  tabs: TabSpec<T>[]
  className?: string
}

export default function Tabs<T extends string>({ value, onChange, tabs, className }: TabsProps<T>) {
  return (
    <div
      className={cn('flex rounded-xl p-1 gap-1', className)}
      style={{ background: '#EDE7DF', border: '1px solid #D4C8BA' }}
      role="tablist"
    >
      {tabs.map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex-1 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-150',
              !active && 'text-[#78716C] hover:text-[#1C1917]',
            )}
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '0.95rem',
              ...(active ? t.activeStyle : {}),
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
