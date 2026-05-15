import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/audio', () => ({
  startBgm: vi.fn(),
  stopBgm: vi.fn(),
  resumeContext: vi.fn(),
  playTick: vi.fn(),
  playTickAccent: vi.fn(),
  playWin: vi.fn(),
  playTimeUp: vi.fn(),
}))

import * as audio from '../lib/audio'

// Import store after mock so it picks up mocked module
const getStore = async () => {
  vi.resetModules()
  // Re-mock after resetModules
  vi.mock('../lib/audio', () => ({
    startBgm: vi.fn(),
    stopBgm: vi.fn(),
    resumeContext: vi.fn(),
    playTick: vi.fn(),
    playTickAccent: vi.fn(),
    playWin: vi.fn(),
    playTimeUp: vi.fn(),
  }))
  const { useProgress } = await import('./progress')
  return useProgress
}

describe('useProgress audio settings', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with sfxOn=true and bgmOn=false', async () => {
    const useProgress = await getStore()
    const state = useProgress.getState()
    expect(state.settings.sfxOn).toBe(true)
    expect(state.settings.bgmOn).toBe(false)
  })

  it('toggleSfx flips sfxOn without calling audio', async () => {
    const useProgress = await getStore()
    useProgress.getState().toggleSfx()
    expect(useProgress.getState().settings.sfxOn).toBe(false)
    expect(audio.startBgm).not.toHaveBeenCalled()
    expect(audio.stopBgm).not.toHaveBeenCalled()
    useProgress.getState().toggleSfx()
    expect(useProgress.getState().settings.sfxOn).toBe(true)
  })

  it('toggleBgm to true calls startBgm', async () => {
    const useProgress = await getStore()
    useProgress.getState().toggleBgm()
    expect(useProgress.getState().settings.bgmOn).toBe(true)
    expect(audio.startBgm).toHaveBeenCalledOnce()
  })

  it('toggleBgm to false calls stopBgm', async () => {
    const useProgress = await getStore()
    useProgress.getState().toggleBgm() // ON
    useProgress.getState().toggleBgm() // OFF
    expect(useProgress.getState().settings.bgmOn).toBe(false)
    expect(audio.stopBgm).toHaveBeenCalledOnce()
  })
})

describe('useProgress persist migrator', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function seedV1(soundOn: boolean) {
    localStorage.setItem(
      'mathdash:progress',
      JSON.stringify({
        state: {
          version: 1,
          levels: {},
          dailyStreak: { lastPlayedDate: '', count: 0 },
          settings: { soundOn, theme: 'default' },
        },
        version: 1,
      })
    )
  }

  it('migrates soundOn=true → sfxOn=true, bgmOn=false', async () => {
    seedV1(true)
    const useProgress = await getStore()
    const { sfxOn, bgmOn } = useProgress.getState().settings
    expect(sfxOn).toBe(true)
    expect(bgmOn).toBe(false)
    expect((useProgress.getState().settings as Record<string, unknown>).soundOn).toBeUndefined()
  })

  it('migrates soundOn=false → sfxOn=false, bgmOn=false', async () => {
    seedV1(false)
    const useProgress = await getStore()
    const { sfxOn, bgmOn } = useProgress.getState().settings
    expect(sfxOn).toBe(false)
    expect(bgmOn).toBe(false)
  })
})
