import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerDriver } from '../api/driverAuth'
import { useDriverAuth } from '../context/DriverAuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useDriverAuth()

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, authLoading, navigate])

  const [form, setForm] = useState({
    fullName: '', nicNumber: '', phoneNumber: '', email: '', password: '', confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await registerDriver({
        fullName: form.fullName.trim(),
        nicNumber: form.nicNumber.trim().toUpperCase(),
        phoneNumber: form.phoneNumber.trim() || null,
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      const code = err.code
      if (code === 'auth/email-already-in-use') setError('An account already exists with this email.')
      else if (code === 'auth/invalid-email') setError('Invalid email address.')
      else if (code === 'auth/weak-password') setError('Password is too weak.')
      else setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-900">Driver Portal</p>
        <h2 className="mt-1.5 text-2xl font-black text-slate-950">Create Account</h2>
        <p className="mt-1 text-sm text-slate-500">Your details will be saved for future payments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name *" type="text" value={form.fullName} onChange={set('fullName')}
          placeholder="John Perera" required autoComplete="name" />

        <Field label="NIC Number *" type="text" value={form.nicNumber} onChange={set('nicNumber')}
          placeholder="200012345678" required autoComplete="off"
          onInput={(e) => (e.target.value = e.target.value.toUpperCase())} />

        <Field label="Phone Number (optional)" type="tel" value={form.phoneNumber}
          onChange={set('phoneNumber')} placeholder="+94771234567" />

        <Field label="Email *" type="email" value={form.email} onChange={set('email')}
          placeholder="you@example.com" required autoComplete="email" />

        <Field label="Password *" type="password" value={form.password} onChange={set('password')}
          placeholder="Min 6 characters" required autoComplete="new-password" />

        <Field label="Confirm Password *" type="password" value={form.confirm}
          onChange={set('confirm')} placeholder="Repeat password" required
          autoComplete="new-password" />

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-800 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input className="field" {...props} />
    </div>
  )
}
