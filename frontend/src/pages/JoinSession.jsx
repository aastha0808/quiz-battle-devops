import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { joinSession } from '../services/api'

export default function JoinSession() {
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    try {
      const res = await joinSession(code.toUpperCase().trim())
      const sess = res.data
      // Store quizId so Session page can fetch questions
      const quizId = sess.quiz?.id || sess.quizId
      if (quizId) {
        sessionStorage.setItem(`session_${sess.id}`, JSON.stringify({ quizId, sessionCode: sess.sessionCode }))
      }
      addToast('Joined session!', 'success')
      navigate(`/session/${sess.id}`)
    } catch (err) {
      addToast(err.response?.data?.message || 'Session not found', 'error')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="page fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Join a Session</h1>
          <p className="page-subtitle">Enter the room code from your host</p>
        </div>

        <div className="accent-line" />

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎮</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Ask the quiz host for the room code to join their live session
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Room Code</label>
              <input
                className="input"
                placeholder="e.g. ABC123"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '0.2em', textAlign: 'center', padding: '14px' }}
                maxLength={10}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-cyan btn-full btn-lg" disabled={joining || !code.trim()}>
              {joining ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '⚡ Join Battle'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Want to host instead?{' '}
            <button onClick={() => navigate('/my-quizzes')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-bright)', cursor: 'pointer', fontSize: 13 }}>
              Create a quiz →
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
