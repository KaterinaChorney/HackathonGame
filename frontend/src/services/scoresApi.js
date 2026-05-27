import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const scoresApi = {
  // Scores
  getLeaderboard: (sessionId) => api.get(`/scores/${sessionId}`),
  getTeamScore: (sessionId, teamId) => api.get(`/scores/${sessionId}/team/${teamId}`),
  addScore: (sessionId, teamId, data) => api.post(`/scores/${sessionId}/team/${teamId}`, data),
  getSessionHistory: (sessionId) => api.get(`/scores/${sessionId}/history`),
  getTeamHistory: (sessionId, teamId) => api.get(`/scores/${sessionId}/team/${teamId}/history`),

  // Badges
  getBadgeTypes: () => api.get('/badges/types'),
  getSessionBadges: (sessionId) => api.get(`/badges/${sessionId}`),
  awardBadge: (sessionId, teamId, data) => api.post(`/badges/${sessionId}/team/${teamId}`, data),

  // Export
  exportHistoryCsv: (sessionId) => `/api/export/${sessionId}/history/csv`,
  exportLeaderboardCsv: (sessionId) => `/api/export/${sessionId}/leaderboard/csv`,

  // Auth
  login: (password) => api.post('/auth/login', { password }),
  logout: () => api.post('/auth/logout'),
}

export default scoresApi
