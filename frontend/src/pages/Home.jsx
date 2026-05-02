import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Home() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const { login, register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.email)
        addToast('Welcome back!', 'success')
      } else {
        await register(form.username, form.email, form.password)
        addToast('Account created!', 'success')
      }
      navigate('/dashboard')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '36px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Quiz Battle Arena
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Create & battle in live quiz sessions
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: 4, marginBottom: 28, border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '8px', border: 'none', cursor: 'pointer', borderRadius: 7,
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 0 16px var(--accent-glow)' : 'none',
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Username</label>
              <input className="input" name="username" placeholder="coolplayer123" value={form.username} onChange={handle} required />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? <span className="spinner" style={{ width: 18, height: 18 }} /> : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-bright)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
