import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import Play from './routes/Play'
import DailyPlay from './routes/DailyPlay'
import Share from './routes/Share'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:tier/:level" element={<Play />} />
        <Route path="/play/24/daily" element={<DailyPlay />} />
        <Route path="/share/:resultId" element={<Share />} />
      </Routes>
    </BrowserRouter>
  )
}
