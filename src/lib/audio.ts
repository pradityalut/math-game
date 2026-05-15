/**
 * Singleton Web Audio API module. SFX are synthesized at runtime; BGM is
 * streamed from /audio/bgm.mp3 via HTMLAudioElement.
 *
 * Callers are responsible for checking settings.sfxOn before calling SFX
 * functions. BGM functions are self-gated via internal state.
 */

let ctx: AudioContext | null = null
let bgmEl: HTMLAudioElement | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
    }
    return ctx
  } catch {
    return null
  }
}

/** Resume a suspended AudioContext after a user gesture (mobile autoplay policy). */
export function resumeContext(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume()
}

/**
 * Play a short synthesized beep.
 *
 * @param freq - Frequency in Hz
 * @param durMs - Duration in milliseconds
 * @param gain - Peak gain (0–1)
 * @param type - Oscillator wave type
 */
function blip(freq: number, durMs: number, gain: number, type: OscillatorType = 'sine'): void {
  const c = getCtx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const g = c.createGain()
    const dur = durMs / 1000
    osc.type = type
    osc.frequency.value = freq
    g.gain.setValueAtTime(gain, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    osc.connect(g).connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + dur)
  } catch {
    // ignore — audio not critical
  }
}

/** Normal countdown tick (seconds 10–4). */
export function playTick(): void {
  blip(880, 60, 0.15)
}

/** Accented countdown tick (seconds 3–1). */
export function playTickAccent(): void {
  blip(1320, 80, 0.2)
}

/** Win arpeggio: C5 → E5 → G5. */
export function playWin(): void {
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((freq, i) => {
    setTimeout(() => blip(freq, 120, 0.18), i * 110)
  })
}

/** Time-up sweep: sawtooth 440 → 220 Hz over 400 ms. */
export function playTimeUp(): void {
  const c = getCtx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(440, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.4)
    g.gain.setValueAtTime(0.12, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4)
    osc.connect(g).connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.4)
  } catch {
    // ignore
  }
}

/**
 * Start BGM playback from /audio/bgm.mp3.
 * Idempotent — safe to call when already playing.
 */
export function startBgm(): void {
  if (bgmEl) return
  try {
    bgmEl = new Audio('/audio/bgm.mp3')
    bgmEl.loop = true
    bgmEl.volume = 0.25
    bgmEl.play().catch(() => {
      // autoplay blocked — will retry on next user gesture via resumeContext
      bgmEl = null
    })
  } catch {
    bgmEl = null
  }
}

/**
 * Stop BGM playback and release the element.
 * Idempotent — safe to call when already stopped.
 */
export function stopBgm(): void {
  if (!bgmEl) return
  bgmEl.pause()
  bgmEl.currentTime = 0
  bgmEl = null
}
