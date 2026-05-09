import axios from 'axios'

const TOKEN_KEY = 'trafficpay_admin_token'

let authToken = localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  authToken = token
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  authToken = null
  localStorage.removeItem(TOKEN_KEY)
}

const trimTrailingSlash = value => value.replace(/\/+$/, '')

const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
)

export const getApiBaseUrl = () => API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const login = (badgeNumber, password) =>
  api.post('/auth/login', { badgeNumber, password })

export const getSummary = (from, to) =>
  api.get('/admin/dashboard/summary', { params: { from, to } })

export const getByDistrict = (from, to) =>
  api.get('/admin/dashboard/by-district', { params: { from, to } })

export const getByCategory = (from, to, district) =>
  api.get('/admin/dashboard/by-category', { params: { from, to, district } })

export const getRecentPayments = () =>
  api.get('/admin/dashboard/recent-payments')

export const getAdminFines = (params) =>
  api.get('/admin/fines', { params })

export const getOfficers = () =>
  api.get('/admin/officers')

export const createOfficer = (data) =>
  api.post('/admin/officers', data)

export const cancelFine = (fineId, reason) =>
  api.patch(`/fines/${fineId}/cancel`, { reason })
