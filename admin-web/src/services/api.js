import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (username, password) =>
  api.post('/auth/login', { username, password })

export const getSummary = () => api.get('/admin/summary')
export const getByDistrict = () => api.get('/admin/collections/by-district')
export const getByCategory = () => api.get('/admin/collections/by-category')
export const getAllFines = () => api.get('/admin/fines')
