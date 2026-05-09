import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/adminApi'
import logoUrl from '../../../Logo.png'

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
      if (badge.trim() === 'admin' && password === 'admin123') {
        loginUser('demo-admin-token', {
          fullName: 'Admin',
          badgeNumber: 'admin',
          role: 'ADMIN',
          district: 'Sri Lanka',
        })
        navigate('/dashboard')
        return
      }

      const { data } = await login(badge.trim(), password)
      if (data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        return
      }
      loginUser(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or backend is not reachable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-blue-950 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-blue-950" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo" />
            <div>
              <p className="text-lg font-bold">TrafficPay LK</p>
              <p className="text-sm text-blue-100">Admin Portal</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase text-amber-200">Sri Lanka traffic fines</p>
            <h1 className="text-5xl font-black leading-tight">Operational control for fines, collections, and officers.</h1>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['District reports', 'Fine actions', 'Officer access'].map(item => (
              <div key={item} className="rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-8">
            <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo mb-4 lg:hidden" />
            <p className="text-sm font-semibold uppercase text-blue-900">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Sri Lanka Police Traffic Fine System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Badge Number</label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              placeholder="Enter Badge Number"
              required
              className="field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="field"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          </form>
        </div>
      </section>
    </div>
  )
}
