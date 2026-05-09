import { useState, useEffect } from 'react'
import { getAdminFines, cancelFine } from '../api/adminApi'

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
}

const money = value => `LKR ${Number(value || 0).toLocaleString()}`
const toFineList = data => {
  const rows = data?.fines || data?.items || data?.records || data
  return Array.isArray(rows) ? rows : []
}
const fineKey = fine => fine.fineId || fine.id || fine.referenceNumber

export default function FinesPage() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('')
  const [district, setDistrict] = useState('')
  const [cancelId, setCancelId] = useState(null)
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  async function fetchFines() {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (status) params.status = status
      if (district) params.district = district
      const { data } = await getAdminFines(params)
      setFines(toFineList(data))
    } catch (err) {
      console.error('Fines load failed', err)
      setFines([])
      setError('Fines could not be loaded. Check the backend URL and filters.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFines() }, [])

  async function handleCancel(e) {
    e.preventDefault()
    if (!reason.trim()) return
    setCancelling(true)
    try {
      await cancelFine(cancelId, reason)
      setCancelId(null)
      setReason('')
      fetchFines()
    } catch {
      alert('Cancel failed. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-900">Case operations</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Fines</h1>
      </div>

      <div className="surface flex flex-wrap items-center gap-3 rounded-lg p-4">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="field w-auto min-w-44">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input value={district} onChange={e => setDistrict(e.target.value.toUpperCase())}
          placeholder="District (e.g. COLOMBO)"
          className="field w-full sm:w-64" />
        <button onClick={fetchFines}
          className="btn-primary">
          Search
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface grid min-h-80 place-items-center rounded-lg text-sm font-semibold text-slate-500">Loading fines...</div>
      ) : (
        <div className="surface overflow-hidden rounded-lg">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Fine Records</h2>
            <p className="text-sm font-semibold text-slate-500">{fines.length.toLocaleString()} shown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Reference', 'Vehicle', 'Driver', 'Category', 'Amount', 'District', 'Status', 'Issued At', 'Actions'].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map(fine => (
                  <tr key={fineKey(fine)} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{fine.referenceNumber || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{fine.vehicleNumber || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{fine.driverName || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{fine.categoryCode || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{money(fine.amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{fine.district || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[fine.status] || 'bg-slate-100 text-slate-700'}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-500">
                      {fine.issuedAt ? new Date(fine.issuedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {fine.status === 'PENDING' && (
                        <button onClick={() => setCancelId(fine.fineId || fine.id)}
                          className="rounded-md px-2 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-50">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-sm font-medium text-slate-500">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Cancel Fine</h3>
            <form onSubmit={handleCancel} className="space-y-4">
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for cancellation..."
                required
                rows={3}
                className="field"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setCancelId(null); setReason('') }}
                  className="btn-secondary flex-1">
                  Back
                </button>
                <button type="submit" disabled={cancelling}
                  className="btn-danger flex-1">
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
