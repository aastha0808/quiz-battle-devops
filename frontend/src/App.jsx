import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MyQuizzes from './pages/MyQuizzes'
import QuizDetail from './pages/QuizDetail'
import JoinSession from './pages/JoinSession'
import Session from './pages/Session'

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/my-quizzes" element={
                <ProtectedRoute><MyQuizzes /></ProtectedRoute>
              } />
              <Route path="/quiz/:quizId" element={
                <ProtectedRoute><QuizDetail /></ProtectedRoute>
              } />
              <Route path="/join" element={
                <ProtectedRoute><JoinSession /></ProtectedRoute>
              } />
              <Route path="/session/:sessionId" element={
                <ProtectedRoute><Session /></ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
