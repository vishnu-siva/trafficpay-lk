import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/adminApi'
import { DEMO_ADMIN } from '../data/demoData'

export default function LoginPage() {
  const [badge, setBadge] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await login(badge.trim(), password)
      const role = data.user?.role || data.role
      if (role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        return
      }
      loginUser(data.token, data.user || {
        fullName: data.fullName || data.username || badge.trim(),
        badgeNumber: data.username || badge.trim(),
        role,
      })
      navigate('/dashboard')
    } catch {
      if (badge.trim() === 'admin' && password === 'admin123') {
        loginUser('frontend-demo-token', DEMO_ADMIN)
        navigate('/dashboard')
        return
      }
      setError('Invalid credentials. Use admin / admin123 for frontend demo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded bg-blue-900 text-white flex items-center justify-center font-bold">
            TP
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sri Lanka Police Traffic Fine System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              placeholder="SP-0042"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
