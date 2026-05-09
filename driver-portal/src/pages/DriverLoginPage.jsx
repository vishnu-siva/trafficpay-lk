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
    <div className="surface rounded-lg p-6 sm:p-8">
      <h2 className="mb-1 text-2xl font-bold text-slate-950">Driver Login</h2>
      <p className="mb-6 text-sm text-slate-500">Login to pay your traffic fine</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Password *</label>
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
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-700 hover:underline">
          Register
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-slate-400">
        <Link to="/" className="hover:underline">Continue without login</Link>
      </p>
    </div>
  )
}
