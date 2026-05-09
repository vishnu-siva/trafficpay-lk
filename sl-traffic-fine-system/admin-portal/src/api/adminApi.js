import axios from 'axios'

const TOKEN_KEY = 'trafficpay_admin_token'
const USER_KEY = 'trafficpay_admin_user'

let authToken = localStorage.getItem(TOKEN_KEY)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

export const setToken = (token) => {
  authToken = token
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  authToken = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (badgeNumber, password) =>
  api.post('/auth/login', { username: badgeNumber, badgeNumber, password })

export const getSummary = (from, to) =>
  api.get('/admin/summary', { params: { from, to } })

export const getByDistrict = (from, to) =>
  api.get('/admin/collections/by-district', { params: { from, to } })

export const getByCategory = (from, to, district) =>
  api.get('/admin/collections/by-category', { params: { from, to, district } })

export const getRecentPayments = () =>
  api.get('/admin/recent-payments')

export const getAdminFines = (params) =>
  api.get('/admin/fines', { params })

export const getOfficers = () =>
  api.get('/admin/officers')

export const createOfficer = (data) =>
  api.post('/admin/officers', data)

export const cancelFine = (fineId, reason) =>
  api.patch(`/admin/fines/${fineId}/cancel`, { reason })
