import { createContext, useContext, useState, useCallback } from 'react'
import { getUserByEmail, registerUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qba_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUserByEmail(email)
      const u = res.data
      setUser(u)
      localStorage.setItem('qba_user', JSON.stringify(u))
      return u
    } catch (e) {
      const data = e.response?.data
      // Spring validation returns field errors under 'fieldErrors'
      const msg = data?.fieldErrors
        ? Object.values(data.fieldErrors).join(', ')
        : data?.message || 'User not found'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (username, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await registerUser({ username, email, password })
      const u = res.data
      setUser(u)
      localStorage.setItem('qba_user', JSON.stringify(u))
      return u
    } catch (e) {
      const data = e.response?.data
      // Spring validation returns field errors under 'fieldErrors'
      const msg = data?.fieldErrors
        ? Object.values(data.fieldErrors).join(', ')
        : data?.message || 'Registration failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('qba_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
