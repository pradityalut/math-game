import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface DialogProps {
  children: ReactNode
  className?: string
  isPerfect?: boolean
}

export default function Dialog({ children, className, isPerfect }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1C1917]/40 backdrop-blur-[2px]">
      <div
        className={cn(
          'w-full max-w-sm mx-4 bg-[#FEFCF8] rounded-t-3xl sm:rounded-3xl p-8 space-y-6 border',
          className,
        )}
        style={{
          borderColor: isPerfect ? '#C9FF3D' : '#E8E0D5',
          boxShadow: isPerfect
            ? '0 -4px 0 0 #C9FF3D, 0 -24px 48px rgba(201,255,61,0.12)'
            : '0 -4px 0 0 #E8E0D5, 0 -24px 48px rgba(28,25,23,0.15)',
          animation: 'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </div>
    </div>
  )
}
