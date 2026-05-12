import { useEffect, useState } from 'react'
import { Card, Button } from './ui'

const STORAGE_KEY = 'mathdash:support-dismissed-until'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const DONATE_URL = 'https://lynk.id/praaad'

export default function SupportCard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const dismissed = raw ? Date.now() < parseInt(raw, 10) : false
    if (!dismissed) setVisible(true)
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SEVEN_DAYS_MS))
    setVisible(false)
  }

  function donate() {
    window.open(DONATE_URL, '_blank', 'noopener,noreferrer')
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SEVEN_DAYS_MS))
    setVisible(false)
  }

  return (
    <Card tone="paper" className="relative px-4 py-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss support card"
        className="absolute top-2 right-2 p-1 rounded-md text-[#C8B8A2] hover:text-[#78716C] transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
          style={{ background: '#FEE2E2' }}
          aria-hidden="true"
        >
          <svg className="w-5 h-5 text-[#C84B31]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21s-7.5-4.5-9.5-9.5C1 8 3.5 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6 3 4.5 6.5C19.5 16.5 12 21 12 21z" />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold text-[#1C1917] leading-snug"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            Suka MathDash?
          </p>
          <p
            className="text-xs text-[#78716C] mt-0.5 leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Dukung pengembang biar tetap semangat bikin puzzle baru.
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        fullWidth
        onClick={donate}
        className="mt-3 flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5 text-[#C84B31]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.5-4.5-9.5-9.5C1 8 3.5 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6 3 4.5 6.5C19.5 16.5 12 21 12 21z" />
        </svg>
        <span>Support creator</span>
      </Button>
    </Card>
  )
}
