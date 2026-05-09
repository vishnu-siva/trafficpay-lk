import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCategories, lookupFine } from '../api/fineApi'
import { isDemoPaid, makeDemoFine } from '../api/demoData'
import StepIndicator from '../components/StepIndicator'

function normalizeCategories(payload) {
  const list = Array.isArray(payload) ? payload : payload?.data ?? payload?.categories ?? []
  return list.map((item) => ({
    id: item.id ?? item.categoryId ?? item.code ?? item.categoryCode,
    label: item.name ?? item.description ?? item.categoryDescription ?? item.code ?? item.categoryCode,
  })).filter((item) => item.id)
}

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ref, setRef] = useState('')
  const [cat, setCat] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [error, setError] = useState(null)

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(cat)),
    [cat, categories],
  )

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const { data } = await getCategories()
        if (active) {
          setCategories(normalizeCategories(data))
        }
      } catch {
        if (active) {
          setCategories([])
        }
      } finally {
        if (active) {
          setCategoryLoading(false)
        }
      }
    }

    loadCategories()
    return () => {
      active = false
    }
  }, [])

  async function handleLookup(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const referenceNumber = ref.trim()
    const categoryId = cat.trim()

    try {
      if (isDemoPaid(referenceNumber)) {
        setError(t('alreadyPaid'))
        return
      }

      const { data } = await lookupFine(referenceNumber, categoryId)
      navigate('/pay', { state: { fine: data, category: selectedCategory } })
    } catch (err) {
      const status = err.response?.status
      const code = err.response?.data?.error || err.response?.data?.code
      if (status === 409 || code === 'ALREADY_PAID') {
        setError(t('alreadyPaid'))
      } else if (status === 404 || code === 'NOT_FOUND') {
        setError(t('notFound'))
      } else if (!err.response) {
        navigate('/pay', {
          state: {
            fine: makeDemoFine(referenceNumber, categoryId),
            category: selectedCategory,
            demoNotice: 'Backend is not reachable, so demo data is being used.',
          },
        })
      } else {
        setError(t('genericError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <StepIndicator current={1} />

      <section className="mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">{t('step1')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('lookupHelp')}</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="reference-number">
              {t('refNumber')}
            </label>
            <input
              id="reference-number"
              type="text"
              value={ref}
              onChange={(event) => setRef(event.target.value.toUpperCase())}
              placeholder="TF-2026-000123"
              required
              className="w-full rounded-md border border-slate-300 px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="category-id">
              {t('categoryId')}
            </label>
            {categories.length > 0 ? (
              <select
                id="category-id"
                value={cat}
                onChange={(event) => setCat(event.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">{categoryLoading ? t('loading') : t('categoryPlaceholder')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="category-id"
                type="text"
                value={cat}
                onChange={(event) => setCat(event.target.value.toUpperCase())}
                placeholder={categoryLoading ? t('loading') : 'CAT-001'}
                required
                className="w-full rounded-md border border-slate-300 px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('loading') : t('lookupBtn')}
          </button>
        </form>
      </section>

      <p className="mt-6 text-center text-xs text-slate-500">{t('contact')}</p>
    </div>
  )
}
