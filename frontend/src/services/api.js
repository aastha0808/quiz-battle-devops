import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Users ──────────────────────────────────────────────
export const registerUser = (data) => api.post('/users/register', data)
export const getUserByEmail = (email) => api.get(`/users/email/${encodeURIComponent(email)}`)

// ── Quizzes ────────────────────────────────────────────
export const createQuiz = (data) => api.post('/quizzes', data)
export const getQuizzesByUser = (userId) => api.get(`/quizzes/user/${userId}`)

// ── Questions ──────────────────────────────────────────
export const addQuestion = (quizId, data) => api.post(`/questions/${quizId}`, data)
export const getQuestions = (quizId) => api.get(`/questions/${quizId}`)

// ── Sessions ───────────────────────────────────────────
export const startSession = (quizId) => api.post(`/sessions/start/${quizId}`)
export const joinSession = (roomCode) => api.post(`/sessions/join/${roomCode}`)
export const endSession = (sessionId) => api.post(`/sessions/end/${sessionId}`)

// ── Answers ────────────────────────────────────────────
export const submitAnswer = (data) => api.post('/answers/submit', data)
export const getScore = (sessionId) => api.get(`/answers/score/${sessionId}`)
export const getLeaderboard = (sessionId) => api.get(`/answers/leaderboard/${sessionId}`)

export default api
