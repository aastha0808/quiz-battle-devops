import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const isActive = (path) => loc.pathname === path ? 'nav-link active' : 'nav-link'

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">⚡ Quiz Battle Arena</Link>

      {user && (
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/my-quizzes" className={isActive('/my-quizzes')}>My Quizzes</Link>
          <Link to="/join" className={isActive('/join')}>Join Session</Link>
        </div>
      )}

      <div className="nav-user">
        {user ? (
          <>
            <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.username}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Sign In</button>
        )}
      </div>
    </nav>
  )
}
