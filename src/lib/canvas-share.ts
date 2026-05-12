import type { ShareCardData } from '../engine/types'

const STAR = '★'
const EMPTY_STAR = '☆'

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const W = 1200
  const H = 630

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(W, H)
      : (() => {
          const c = document.createElement('canvas')
          c.width = W
          c.height = H
          return c
        })()

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!ctx) throw new Error('Canvas context unavailable')

  const isPerfect = data.stars === 3

  // Background — warm paper
  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, W, H)

  // Top accent bar (tier color) — 16px for bold presence
  ctx.fillStyle = tierColor(data.tier)
  ctx.fillRect(0, 0, W, 16)

  // Win Lime accent stripe for perfect solve
  if (isPerfect) {
    ctx.fillStyle = '#C9FF3D'
    ctx.fillRect(0, 16, W, 6)
  }

  ctx.textAlign = 'center'

  // Brand
  ctx.fillStyle = '#1C1917'
  ctx.font = '700 72px Fredoka, system-ui, sans-serif'
  ctx.fillText('MathDash', W / 2, 120)

  // Tier badge
  ctx.fillStyle = '#78716C'
  ctx.font = '500 28px Nunito, system-ui, sans-serif'
  ctx.fillText(`${data.tier.toUpperCase()} · made ${data.target}`, W / 2, 165)

  // Target number — Live Coral for social vibrancy
  ctx.fillStyle = '#FF6A3D'
  ctx.font = '700 180px Fredoka, system-ui, sans-serif'
  ctx.fillText(String(data.target), W / 2, 350)

  // Stars — Win Lime for perfect, Amber otherwise
  const stars = STAR.repeat(data.stars) + EMPTY_STAR.repeat(3 - data.stars)
  ctx.fillStyle = isPerfect ? '#C9FF3D' : '#D97706'
  ctx.font = '600 80px system-ui, sans-serif'
  ctx.fillText(stars, W / 2, 445)

  // Time
  ctx.fillStyle = '#1C1917'
  ctx.font = '600 36px Nunito, system-ui, sans-serif'
  ctx.fillText(`Solved in ${data.timeSec}s`, W / 2, 510)

  // Expression (truncate gracefully if too long)
  ctx.fillStyle = '#78716C'
  ctx.font = '500 26px Nunito, system-ui, sans-serif'
  const exprText =
    data.expression.length > 60
      ? data.expression.slice(0, 57) + '...'
      : data.expression
  ctx.fillText(exprText, W / 2, 555)

  // Footer
  ctx.fillStyle = '#A09080'
  ctx.font = '500 24px Nunito, system-ui, sans-serif'
  ctx.fillText('mathdash.app', W / 2, 605)

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: 'image/png' })
  }

  return new Promise((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob failed'))
    }, 'image/png')
  })
}

function tierColor(tier: string): string {
  switch (tier) {
    case 'easy':
      return '#2D6A4F'
    case 'medium':
      return '#D97706'
    case 'hard':
      return '#C84B31'
    case '24':
      return '#5B21B6'
    default:
      return '#1A1A2E'
  }
}
