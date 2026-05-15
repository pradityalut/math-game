/**
 * Singleton Web Audio API module. All sounds are synthesized at runtime —
 * no external asset files required.
 *
 * Callers are responsible for checking settings.sfxOn before calling SFX
 * functions. BGM functions are self-gated via internal state.
 */

let ctx: AudioContext | null = null
let bgmNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null

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
 * Start the ambient BGM loop (C-major pad: C3/E3/G3 detuned sine trio).
 * Idempotent — safe to call when already running.
 */
export function startBgm(): void {
  const c = getCtx()
  if (!c || bgmNodes) return
  try {
    const freqs = [130.81, 164.81, 196.0] // C3, E3, G3
    const detunes = [-5, 5, -3]
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 1)
    gain.connect(c.destination)

    const oscs: OscillatorNode[] = freqs.map((freq, i) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = detunes[i] ?? 0
      osc.connect(gain)
      osc.start()
      return osc
    })

    bgmNodes = { oscs, gain }
  } catch {
    // ignore
  }
}

/**
 * Stop the ambient BGM loop with a short fade-out.
 * Idempotent — safe to call when already stopped.
 */
export function stopBgm(): void {
  const c = getCtx()
  if (!c || !bgmNodes) return
  try {
    const { oscs, gain } = bgmNodes
    gain.gain.setValueAtTime(gain.gain.value, c.currentTime)
    gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5)
    oscs.forEach((osc) => osc.stop(c.currentTime + 0.5))
    bgmNodes = null
  } catch {
    bgmNodes = null
  }
}
