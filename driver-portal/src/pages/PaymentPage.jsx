import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { confirmPayment, initiatePayment } from '../api/fineApi'
import { makeDemoReceipt, markDemoPaid } from '../api/demoData'
import StepIndicator from '../components/StepIndicator'
import {
  formatMoney,
  getCategoryId,
  getCategoryLabel,
  getDistrict,
  getFineAmount,
  getReference,
  getVehicleNo,
} from '../utils/fineUtils'

export default function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const fine = state?.fine
  const demoNotice = state?.demoNotice

  const [name, setName] = useState('')
  const [nic, setNic] = useState('')
  const [method, setMethod] = useState('CARD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!fine) {
      navigate('/', { replace: true })
    }
  }, [fine, navigate])

  if (!fine) {
    return null
  }

  const referenceNumber = getReference(fine)
  const categoryId = getCategoryId(fine)
  const amount = getFineAmount(fine)
  const methods = [
    { value: 'CARD', label: t('methodCard') },
    { value: 'ONLINE_BANKING', label: t('methodBank') },
    { value: 'CASH_ON_SPOT', label: t('methodSpot') },
  ]

  async function handlePayment(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (fine.demoMode) {
        const payer = { name: name.trim(), nic: nic.trim(), method }
        const receipt = makeDemoReceipt(fine, payer)
        markDemoPaid(referenceNumber)
        navigate('/confirmation', { state: { receipt, fine, payer, demoNotice } })
        return
      }

      const initiateRes = await initiatePayment({
        referenceNumber,
        categoryId,
        paymentMethod: method,
        paymentChannel: 'WEB_PORTAL',
        paidByName: name.trim(),
        paidByNic: nic.trim(),
      })

      const paymentId = initiateRes.data?.paymentId ?? initiateRes.data?.id
      const confirmRes = await confirmPayment({
        paymentId,
        paymentGatewayRef: `web-${Date.now()}`,
        status: 'SUCCESS',
      })

      navigate('/confirmation', {
        state: {
          receipt: confirmRes.data,
          fine,
          payer: { name: name.trim(), nic: nic.trim(), method },
        },
      })
    } catch (err) {
      const status = err.response?.status
      const code = err.response?.data?.error || err.response?.data?.code
      if (status === 409 || code === 'ALREADY_PAID') {
        setError(t('alreadyPaid'))
      } else if (!err.response) {
        const payer = { name: name.trim(), nic: nic.trim(), method }
        const receipt = makeDemoReceipt(fine, payer)
        markDemoPaid(referenceNumber)
        navigate('/confirmation', {
          state: {
            receipt,
            fine: { ...fine, demoMode: true },
            payer,
            demoNotice: 'Backend is not reachable, so demo data is being used.',
          },
        })
      } else {
        setError(t('paymentFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <StepIndicator current={2} />

      <section className="surface mt-8 rounded-lg p-6">
        {demoNotice && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {demoNotice}
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-950">{t('fineSummary')}</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <SummaryItem label={t('reference')} value={referenceNumber} mono />
          <SummaryItem label={t('categoryId')} value={categoryId} mono />
          <SummaryItem label={t('offence')} value={getCategoryLabel(fine)} />
          <SummaryItem label={t('vehicleNo')} value={getVehicleNo(fine)} />
          <SummaryItem label={t('district')} value={getDistrict(fine)} />
          <SummaryItem label={t('fineAmount')} value={formatMoney(amount)} strong />
        </dl>
      </section>

      <section className="surface mt-4 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-950">{t('step2')}</h2>

        <form onSubmit={handlePayment} className="mt-5 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payer-name">
              {t('payerName')}
            </label>
            <input
              id="payer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payer-nic">
              {t('payerNic')}
            </label>
            <input
              id="payer-nic"
              type="text"
              value={nic}
              onChange={(event) => setNic(event.target.value.toUpperCase())}
              required
              pattern="^([0-9]{9}[VX]|[0-9]{12})$"
              title="Use 123456789V or 200012345678 format"
              className="field font-mono uppercase"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payment-method">
              {t('paymentMethod')}
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="field"
            >
              {methods.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-success"
            >
              {loading ? t('loading') : `${t('payBtn')} - ${formatMoney(amount)}`}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function SummaryItem({ label, value, mono = false, strong = false }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 break-words ${mono ? 'font-mono' : ''} ${strong ? 'text-lg font-bold text-red-700' : 'font-semibold text-slate-900'}`}>
        {value || '-'}
      </dd>
    </div>
  )
}
