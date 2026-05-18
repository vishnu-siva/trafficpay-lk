import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginDriver, loginWithGoogle } from '../api/driverAuth'
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
  const [googleLoading, setGoogleLoading] = useState(false)
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

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return
      setError(err.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
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

      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {googleLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

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
