import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginDriver } from '../api/driverAuth'
import { useDriverAuth } from '../context/DriverAuthContext'

export default function DriverLoginPage() {
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useDriverAuth()

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, authLoading, navigate])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginDriver(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      const code = err.code
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential')
        setError('No account found with this email or password is incorrect.')
      else if (code === 'auth/wrong-password')
        setError('Incorrect password.')
      else if (code === 'auth/too-many-requests')
        setError('Too many attempts. Please try again later.')
      else
        setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-900">Driver Portal</p>
        <h2 className="mt-1.5 text-2xl font-black text-slate-950">Sign In</h2>
        <p className="mt-1 text-sm text-slate-500">Login to pay your traffic fine</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="field"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="field"
            autoComplete="current-password"
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

      <p className="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-800 hover:underline">
          Register
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-slate-400">
        <Link to="/" className="hover:underline">Continue without login</Link>
      </p>
    </div>
  )
}
