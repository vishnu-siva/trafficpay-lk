import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import StepIndicator from '../components/StepIndicator'
import {
  formatMoney,
  getReceiptAmount,
  getReceiptNumber,
  getReference,
  getVehicleNo,
} from '../utils/fineUtils'

export default function ConfirmationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const receipt = state?.receipt
  const fine = state?.fine
  const payer = state?.payer
  const demoNotice = state?.demoNotice

  useEffect(() => {
    if (!receipt) navigate('/', { replace: true })
  }, [receipt, navigate])

  if (!receipt) return null

  const receiptNo = getReceiptNumber(receipt)
  const paidAt = receipt.paidAt || receipt.createdAt || new Date().toISOString()
  const amount = getReceiptAmount(receipt, fine)
  const reference = receipt.referenceNumber || getReference(fine)

  function downloadReceipt() {
    const doc = new jsPDF()
    const paidDate = new Date(paidAt).toLocaleString()

    doc.setFillColor(23, 37, 84)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text('Sri Lanka Police Department', 20, 13)
    doc.setFontSize(11)
    doc.text('Traffic Fine Payment Receipt', 20, 21)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.text(`Receipt No: ${receiptNo}`, 20, 45)
    doc.text(`Reference: ${reference}`, 20, 55)
    doc.text(`Vehicle: ${getVehicleNo(fine)}`, 20, 65)
    doc.text(`Amount Paid: ${formatMoney(amount)}`, 20, 75)
    doc.text(`Payment Method: ${payer?.method || receipt.paymentMethod || '-'}`, 20, 85)
    doc.text(`Paid By: ${payer?.name || receipt.paidByName || '-'}`, 20, 95)
    doc.text(`NIC: ${payer?.nic || receipt.paidByNic || '-'}`, 20, 105)
    doc.text(`Paid At: ${paidDate}`, 20, 115)

    doc.setFontSize(10)
    doc.text('The issuing officer has been notified. Please keep this receipt for your records.', 20, 135)
    doc.save(`traffic-fine-receipt-${receiptNo}.pdf`)
  }

  return (
    <div>
      <StepIndicator current={3} />

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md sm:p-8">
        {demoNotice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-medium text-amber-800">
            {demoNotice}
          </div>
        )}

        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700 shadow-md ring-4 ring-emerald-50">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-black text-emerald-700">{t('success')}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{t('successMessage')}</p>

        <dl className="mt-6 overflow-hidden divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 text-left text-sm shadow-sm">
          <ReceiptRow label={t('receiptNo')} value={receiptNo} mono />
          <ReceiptRow label={t('reference')} value={reference} mono />
          <ReceiptRow label={t('amountPaid')} value={formatMoney(amount)} highlight />
          <ReceiptRow label={t('vehicleNo')} value={getVehicleNo(fine)} />
          <ReceiptRow label={t('dateTime')} value={new Date(paidAt).toLocaleString()} />
        </dl>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={downloadReceipt} className="btn-primary">
            {t('downloadReceipt')}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            {t('payAnother')}
          </button>
        </div>
      </section>
    </div>
  )
}

function ReceiptRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className={`break-words text-slate-900 ${mono ? 'font-mono text-sm' : ''} ${highlight ? 'font-bold text-emerald-700' : 'font-semibold'}`}>
        {value || '-'}
      </dd>
    </div>
  )
}
