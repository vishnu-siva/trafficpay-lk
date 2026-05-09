import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HomePage from './pages/HomePage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import { getApiBaseUrl } from './api/fineApi'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
]

export default function App() {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-blue-950 bg-blue-950 text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">{t('subtitle')}</p>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="mt-1 text-xs text-blue-100">
              {t('apiBase')}: {getApiBaseUrl()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Language selector">
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  i18n.resolvedLanguage === lang.code
                    ? 'bg-white text-blue-950'
                    : 'border border-blue-300 text-white hover:bg-blue-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 px-4 py-4 text-center text-xs text-slate-200">
        © 2026 Sri Lanka Police Department | Traffic Fine Management System
      </footer>
    </div>
  )
}
