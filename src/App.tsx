import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import Play from './routes/Play'
import DailyPlay from './routes/DailyPlay'
import Share from './routes/Share'
import * as audio from './lib/audio'
import { useProgress } from './store/progress'

function AudioBootstrap() {
  useEffect(() => {
    const onFirstGesture = () => {
      audio.resumeContext()
      if (useProgress.getState().settings.bgmOn) audio.startBgm()
    }
    window.addEventListener('pointerdown', onFirstGesture, { once: true })
    return () => window.removeEventListener('pointerdown', onFirstGesture)
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AudioBootstrap />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:tier/:level" element={<Play />} />
        <Route path="/play/24/daily" element={<DailyPlay />} />
        <Route path="/share/:resultId" element={<Share />} />
      </Routes>
    </BrowserRouter>
  )
}
