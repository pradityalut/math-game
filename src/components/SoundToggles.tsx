import { useProgress } from '../store/progress'

export default function SoundToggles() {
  const sfxOn = useProgress((s) => s.settings.sfxOn)
  const bgmOn = useProgress((s) => s.settings.bgmOn)
  const toggleSfx = useProgress((s) => s.toggleSfx)
  const toggleBgm = useProgress((s) => s.toggleBgm)

  return (
    <div className="flex gap-1">
      <button
        onClick={toggleSfx}
        aria-label={sfxOn ? 'Mute sound effects' : 'Unmute sound effects'}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-base leading-none hover:bg-[#EDE7DF] transition-colors cursor-pointer"
        title={sfxOn ? 'SFX on' : 'SFX off'}
      >
        {sfxOn ? '🔊' : '🔇'}
      </button>
      <button
        onClick={toggleBgm}
        aria-label={bgmOn ? 'Stop background music' : 'Play background music'}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-base leading-none hover:bg-[#EDE7DF] transition-colors cursor-pointer"
        title={bgmOn ? 'Music on' : 'Music off'}
      >
        {bgmOn ? '🎵' : '🎶'}
      </button>
    </div>
  )
}
