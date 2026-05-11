import { useNavigate, useParams } from 'react-router-dom'

export default function Share() {
  const { resultId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-black text-white">MathDash</h1>
      <p className="text-slate-400 text-center">
        Result <code className="text-cyan-400">{resultId}</code>
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 active:scale-95 transition-all"
      >
        Play Now
      </button>
    </div>
  )
}
