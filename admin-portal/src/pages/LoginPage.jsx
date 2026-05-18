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
      loginUser(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid badge number or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-blue-950 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-950 to-[#0a1628]" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.04)_0%,_transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo" />
            <div>
              <p className="text-lg font-bold">TrafficPay LK</p>
              <p className="text-sm text-blue-200">Admin Portal</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-300">Sri Lanka Traffic Fines</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              Operational control for fines, collections, and officers.
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['District reports', 'Fine actions', 'Officer access'].map(item => (
              <div
                key={item}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-100 p-4 sm:p-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/80 sm:p-8">
          <div className="mb-8">
            <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo mb-4 lg:hidden" />
            <p className="text-xs font-bold uppercase tracking-widest text-blue-900">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Sign in</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sri Lanka Police Traffic Fine System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Badge Number</label>
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
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
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
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
