import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getQuizzesByUser, createQuiz } from '../services/api'

export default function MyQuizzes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    getQuizzesByUser(user.id)
      .then(r => setQuizzes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (user) load() }, [user])

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      await createQuiz({ title: form.title, description: form.description, createdById: user.id })
      addToast('Quiz created!', 'success')
      setForm({ title: '', description: '' })
      setShowForm(false)
      load()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create quiz', 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">My Quizzes</h1>
          <p className="page-subtitle">Create and manage your quiz library</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Quiz'}
        </button>
      </div>

      <div className="accent-line" />

      {/* Create Quiz Form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 28, border: '1px solid var(--accent)', background: 'rgba(124,58,237,0.04)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>New Quiz</h3>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Title *</label>
              <input className="input" name="title" placeholder="e.g. Advanced JavaScript" value={form.title} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" name="description" placeholder="What's this quiz about?" value={form.description} onChange={handle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Creating...</> : 'Create Quiz'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Quiz List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 30, height: 30 }} />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-title">No quizzes yet</div>
          <div className="empty-desc">Click "New Quiz" to create your first one</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map(q => (
            <div key={q.id} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{q.title}</span>
                    <span className={`badge badge-${(q.status || 'CREATED').toLowerCase()}`}>{q.status || 'CREATED'}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{q.description || '—'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/quiz/${q.id}`)}>
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
