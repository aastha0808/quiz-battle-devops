import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getQuizzesByUser } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getQuizzesByUser(user.id)
      .then(r => setQuizzes(r.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false))
  }, [user])

  const totalQuizzes = quizzes.length
  const activeQuizzes = quizzes.filter(q => q.status === 'ACTIVE').length

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>
              Welcome, {user?.username}
            </h1>
            <p className="page-subtitle">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="accent-line" />

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="stat-num">{loading ? '—' : totalQuizzes}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="stat-num" style={{ color: 'var(--success)' }}>{loading ? '—' : activeQuizzes}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="stat-num" style={{ color: 'var(--accent2)' }}>
            {loading ? '—' : quizzes.reduce((acc, q) => acc + (q.questionCount || 0), 0)}
          </div>
          <div className="stat-label">Questions Created</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/my-quizzes')}>
            ✦ Create New Quiz
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/join')}>
            ⊕ Join a Session
          </button>
        </div>
      </div>

      {/* Recent quizzes */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Quizzes</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 30, height: 30 }} />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No quizzes yet</div>
              <div className="empty-desc">Create your first quiz to get started</div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/my-quizzes')}>
                Create Quiz
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quizzes.slice(0, 5).map(q => (
              <div key={q.id} className="card" style={{ cursor: 'pointer', padding: '16px 20px' }}
                onClick={() => navigate(`/quiz/${q.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 3 }}>{q.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.description || 'No description'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge badge-${(q.status || 'CREATED').toLowerCase()}`}>
                      {q.status || 'CREATED'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</span>
                  </div>
                </div>
              </div>
            ))}
            {quizzes.length > 5 && (
              <button className="btn btn-secondary" onClick={() => navigate('/my-quizzes')}>
                View All Quizzes →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
