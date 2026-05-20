import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

export const getLeaderboard = () => api.get('/leaderboard').then(r => r.data)
export const getMatches     = () => api.get('/matches').then(r => r.data)
export const getPlayerStats = (id: string) => api.get(`/players/${id}/stats`).then(r => r.data)