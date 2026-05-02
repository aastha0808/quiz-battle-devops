import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { getQuestions, addQuestion, startSession, getQuizzesByUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const OPTS = ['A', 'B', 'C', 'D']

const emptyQ = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 10 }

export default function QuizDetail() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyQ)
  const [saving, setSaving] = useState(false)
  const [starting, setStarting] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    Promise.all([
      getQuestions(quizId),
      user ? getQuizzesByUser(user.id) : Promise.resolve({ data: [] })
    ]).then(([qRes, quizRes]) => {
      setQuestions(qRes.data)
      const found = quizRes.data.find(q => String(q.id) === String(quizId))
      setQuiz(found || { id: quizId, title: 'Quiz #' + quizId })
    }).catch(() => {
      setQuestions([])
    }).finally(() => setLoading(false))
  }, [quizId])

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submitQuestion = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await addQuestion(quizId, { ...form, points: Number(form.points) })
      setQuestions(prev => [...prev, res.data])
      setForm(emptyQ)
      setShowForm(false)
      addToast('Question added!', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add question', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStart = async () => {
    if (questions.length === 0) { addToast('Add at least one question first', 'error'); return }
    setStarting(true)
    try {
      const res = await startSession(quizId)
      const sess = res.data
      sessionStorage.setItem(`session_${sess.id}`, JSON.stringify({ quizId: Number(quizId), sessionCode: sess.sessionCode }))
      setSession(sess)
      addToast('Session started! Share the room code.', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start session', 'error')
    } finally {
      setStarting(false)
    }
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/my-quizzes')}>← Back</button>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{quiz?.title || 'Quiz'}</h1>
          <p className="page-subtitle">{quiz?.description || 'Manage questions and sessions'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancel' : '+ Add Question'}
          </button>
          <button className="btn btn-cyan" onClick={handleStart} disabled={starting}>
            {starting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '▶ Start Session'}
          </button>
        </div>
      </div>

      <div className="accent-line" />

      {/* Session started */}
      {session && (
        <div className="card fade-in" style={{ marginBottom: 28, border: '1px solid var(--success)', background: 'rgba(16,185,129,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--success)', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ✓ Session Active
          </div>
          <div style={{ marginBottom: 6, color: 'var(--text-muted)', fontSize: 14 }}>Share this room code with players:</div>
          <div className="room-code">{session.sessionCode}</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/session/${session.id}`)}>
              View Session →
            </button>
          </div>
        </div>
      )}

      {/* Add Question Form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 28, border: '1px solid var(--accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>New Question</h3>
          <form onSubmit={submitQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Question Text *</label>
              <textarea className="input" name="questionText" placeholder="What is...?" value={form.questionText} onChange={handle} required />
            </div>

            <div className="grid-2">
              {OPTS.map(opt => (
                <div className="input-group" key={opt}>
                  <label className="input-label">Option {opt}</label>
                  <input className="input" name={`option${opt}`} placeholder={`Option ${opt}`}
                    value={form[`option${opt}`]} onChange={handle} required />
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Correct Answer</label>
                <select className="input" name="correctOption" value={form.correctOption} onChange={handle}>
                  {OPTS.map(o => <option key={o} value={o}>Option {o}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Points</label>
                <input className="input" type="number" name="points" min="1" max="100" value={form.points} onChange={handle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : 'Add Question'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setForm(emptyQ) }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
          Questions <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>({questions.length})</span>
        </h2>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❓</div>
          <div className="empty-title">No questions yet</div>
          <div className="empty-desc">Add questions to start building your quiz</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 6, flexShrink: 0, height: 'fit-content' }}>Q{i + 1}</span>
                <div style={{ fontWeight: 500 }}>{q.questionText}</div>
              </div>
              <div className="grid-2" style={{ gap: 8 }}>
                {OPTS.map(opt => (
                  <div key={opt} style={{
                    padding: '8px 12px', borderRadius: 7, fontSize: 13,
                    background: q.correctOption === opt ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${q.correctOption === opt ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                    color: q.correctOption === opt ? 'var(--success)' : 'var(--text)',
                    display: 'flex', gap: 8, alignItems: 'center'
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: q.correctOption === opt ? 'var(--success)' : 'var(--text-muted)' }}>{opt}</span>
                    <span>{q[`option${opt}`]}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent2)' }}>
                  ★ {q.points} pts
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  Correct: Option {q.correctOption}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
