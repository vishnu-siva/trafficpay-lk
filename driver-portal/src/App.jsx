import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DriverAuthProvider, useDriverAuth } from './context/DriverAuthContext'
import { logoutDriver } from './api/driverAuth'
import HomePage from './pages/HomePage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import RegisterPage from './pages/RegisterPage'
import DriverLoginPage from './pages/DriverLoginPage'
import logoUrl from '../../Logo.png'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
]

function UserBadge() {
  const { isLoggedIn, profile, loading } = useDriverAuth()
  const navigate = useNavigate()

  if (loading) return null

  if (!isLoggedIn) {
    return (
      <div className="flex gap-2">
        <Link
          to="/login"
          className="rounded-lg border border-blue-700/70 px-3 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/10"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-950 shadow-sm transition-all duration-150 hover:bg-blue-50 hover:shadow-md"
        >
          Register
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-blue-100">
        {profile?.fullName ?? 'Driver'}
      </span>
      <button
        type="button"
        onClick={async () => { await logoutDriver(); navigate('/') }}
        className="rounded-lg border border-blue-700/70 px-3 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/10"
      >
        Logout
      </button>
    </div>
  )
}

function AppShell() {
  const { t, i18n } = useTranslation()
  const { isLoggedIn } = useDriverAuth()

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-blue-900/50 bg-gradient-to-r from-blue-950 to-blue-900 text-white shadow-lg">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{t('subtitle')}</p>
              <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn && (
              <div className="flex flex-wrap gap-2" aria-label="Language selector">
                {LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                      i18n.resolvedLanguage === lang.code
                        ? 'bg-white text-blue-950 shadow-sm'
                        : 'border border-blue-700/70 text-white hover:bg-white/10'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
            <UserBadge />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/login" element={<DriverLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-800 px-4 py-5 text-center text-xs tracking-wide text-slate-300">
        © 2026 Sri Lanka Police Department | Traffic Fine Management System
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <DriverAuthProvider>
      <AppShell />
    </DriverAuthProvider>
  )
}
