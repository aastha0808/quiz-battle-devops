import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getQuestions, submitAnswer, getScore, getLeaderboard, endSession } from '../services/api'

const OPTS = ['A', 'B', 'C', 'D']

export default function Session() {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [quizId, setQuizId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // { isCorrect, pointsAwarded }
  const [answeredIds, setAnsweredIds] = useState(new Set())
  const [phase, setPhase] = useState('playing') // 'playing' | 'finished'
  const [score, setScore] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [ending, setEnding] = useState(false)

  // We need quizId; it's embedded in session. For now, we try to get it from state or ask user.
  // We'll read questions after quizId is known.
  const [sessionInfo, setSessionInfo] = useState(null)

  // Since the session endpoint returns the full session including quiz object,
  // we parse quizId from join result stored in session storage or re-fetch.
  // We'll store session data when coming from JoinSession or StartSession via location.state.
  useEffect(() => {
    // Try to get quizId from sessionStorage (stored on join/start)
    const stored = sessionStorage.getItem(`session_${sessionId}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setQuizId(data.quizId)
        setSessionInfo(data)
      } catch {}
    }
  }, [sessionId])

  useEffect(() => {
    if (!quizId) { setLoading(false); return }
    getQuestions(quizId)
      .then(r => setQuestions(Array.isArray(r.data) ? r.data : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [quizId])

  const currentQ = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  const handleSelect = (opt) => {
    if (submitted || answeredIds.has(currentQ?.id)) return
    setSelected(opt)
  }

  const handleSubmit = async () => {
    if (!selected || !currentQ || submitting) return
    setSubmitting(true)
    try {
      const res = await submitAnswer({
        sessionId: Number(sessionId),
        questionId: currentQ.id,
        userId: user.id,
        selectedOption: selected,
      })
      const ans = res.data
      setResult({ isCorrect: ans.isCorrect, pointsAwarded: ans.pointsAwarded })
      setSubmitted(true)
      setAnsweredIds(prev => new Set([...prev, currentQ.id]))
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (isLast) {
      finishQuiz()
    } else {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setSubmitted(false)
      setResult(null)
    }
  }

  const finishQuiz = useCallback(async () => {
    setPhase('finished')
    try {
      const [scoreRes, lbRes] = await Promise.all([
        getScore(sessionId),
        getLeaderboard(sessionId),
      ])
      setScore(scoreRes.data)
      setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : [])
    } catch {}
  }, [sessionId])

  const handleEndSession = async () => {
    setEnding(true)
    try {
      await endSession(sessionId)
      addToast('Session ended', 'info')
      navigate('/dashboard')
    } catch {
      navigate('/dashboard')
    }
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  if (!quizId) return (
    <div className="page fade-in">
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10 }}>Session not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          This session may have expired or you accessed it directly.<br />
          Please join via the room code.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/join')}>Join a Session</button>
      </div>
    </div>
  )

  if (phase === 'finished') return (
    <div className="page fade-in">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
        <h1 className="page-title" style={{ fontSize: 32 }}>Battle Complete!</h1>
        <p className="page-subtitle">Here's how everyone did</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="stat-num">{score ?? '—'}</div>
          <div className="stat-label">Your Score</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="stat-num">{answeredIds.size}/{questions.length}</div>
          <div className="stat-label">Questions Answered</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
          Leaderboard
        </h2>
        {leaderboard.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No scores yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, i) => (
              <div key={i} className="lb-row">
                <div className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="lb-name">{entry.username || entry.playerName || `Player ${i + 1}`}</div>
                <div className="lb-score">{entry.score ?? entry.totalScore ?? 0} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <button className="btn btn-danger" onClick={handleEndSession} disabled={ending}>
          {ending ? <span className="spinner" style={{ width: 15, height: 15 }} /> : 'End Session'}
        </button>
      </div>
    </div>
  )

  if (questions.length === 0) return (
    <div className="page fade-in">
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10 }}>No Questions</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This quiz has no questions yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="page page-md fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            SESSION #{sessionId}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Question {currentIdx + 1} of {questions.length}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num" style={{ fontSize: 24 }}>{score ?? 0}</div>
          <div className="stat-label">Score</div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 28 }}>
        <div className="progress-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question card */}
      <div className="card" style={{ marginBottom: 20, padding: 28, border: '1px solid var(--border-bright)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 20 }}>
            Q{currentIdx + 1}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)' }}>
            ★ {currentQ.points} pts
          </span>
        </div>
        <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, marginBottom: 24 }}>
          {currentQ.questionText}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTS.map(opt => {
            let cls = 'option-btn'
            if (submitted) {
              if (opt === currentQ.correctOption) cls += ' correct'
              else if (opt === selected && !result?.isCorrect) cls += ' wrong'
            } else if (selected === opt) {
              cls += ' selected'
            }
            return (
              <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={submitted}>
                <span className="option-letter">{opt}</span>
                <span>{currentQ[`option${opt}`]}</span>
                {submitted && opt === currentQ.correctOption && (
                  <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: 16 }}>✓</span>
                )}
                {submitted && opt === selected && opt !== currentQ.correctOption && (
                  <span style={{ marginLeft: 'auto', color: 'var(--error)', fontSize: 16 }}>✗</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Result feedback */}
        {submitted && result && (
          <div className="fade-in" style={{
            marginTop: 18, padding: '14px 18px', borderRadius: 'var(--radius)',
            background: result.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${result.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ color: result.isCorrect ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
              {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </span>
            {result.isCorrect && (
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent2)', fontSize: 14 }}>
                +{result.pointsAwarded} pts
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!submitted ? (
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : 'Submit Answer →'}
          </button>
        ) : (
          <button className="btn btn-cyan btn-lg" onClick={handleNext}>
            {isLast ? 'View Results 🏆' : 'Next Question →'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Exit</button>
      </div>
    </div>
  )
}
