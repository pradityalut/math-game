import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface DialogProps {
  children: ReactNode
  className?: string
}

export default function Dialog({ children, className }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1C1917]/40 backdrop-blur-[2px]">
      <div
        className={cn(
          'w-full max-w-sm mx-4 bg-[#FEFCF8] rounded-t-3xl sm:rounded-3xl p-8 space-y-6 border border-[#E8E0D5]',
          className,
        )}
        style={{
          boxShadow: '0 -4px 0 0 #E8E0D5, 0 -24px 48px rgba(28,25,23,0.15)',
          animation: 'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
