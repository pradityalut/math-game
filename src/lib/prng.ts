export function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashDateString(date: string): number {
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i)
    hash = (Math.imul(31, hash) + char) | 0
  }
  return Math.abs(hash)
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}
