import { useEffect, useState } from 'react'
import { createOfficer, getOfficers } from '../api/adminApi'

const DISTRICTS = [
  'COLOMBO','GAMPAHA','KALUTARA','KANDY','MATALE','NUWARA ELIYA','GALLE','MATARA',
  'HAMBANTOTA','JAFFNA','KILINOCHCHI','MANNAR','VAVUNIYA','MULLAITIVU','BATTICALOA',
  'AMPARA','TRINCOMALEE','KURUNEGALA','PUTTALAM','ANURADHAPURA','POLONNARUWA',
  'BADULLA','MONARAGALA','RATNAPURA','KEGALLE'
]

const EMPTY_FORM = {
  fullName: '', badgeNumber: '', phoneNumber: '', email: '',
  district: 'COLOMBO', station: '', password: ''
}

const toOfficerList = data => {
  const rows = data?.officers || data?.users || data
  return Array.isArray(rows) ? rows : []
}

export default function OfficersPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [officers, setOfficers] = useState([])
  const [loadingOfficers, setLoadingOfficers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [listError, setListError] = useState(null)

  async function fetchOfficers() {
    setLoadingOfficers(true)
    setListError(null)
    try {
      const { data } = await getOfficers()
      setOfficers(toOfficerList(data))
    } catch (err) {
      console.error('Officers load failed', err)
      setOfficers([])
      setListError('Officers could not be loaded. Check the backend URL and admin token.')
    } finally {
      setLoadingOfficers(false)
    }
  }

  useEffect(() => { fetchOfficers() }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const { data } = await createOfficer(form)
      const officer = data.officer || data
      setSuccess(`Officer ${officer.fullName} (${officer.badgeNumber}) created successfully.`)
      setOfficers(prev => [officer, ...prev.filter(item => item.officerId !== officer.officerId && item.badgeNumber !== officer.badgeNumber)])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create officer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-700">Access control</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Officers</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? 'Close Form' : 'Add Officer'}
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {listError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {listError}
        </div>
      )}

      {showForm && (
        <div className="surface rounded-lg p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Register Officer</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'fullName', label: 'Full Name', type: 'text', required: true },
              { name: 'badgeNumber', label: 'Badge Number', type: 'text', required: true, placeholder: 'SP-0042' },
              { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true, placeholder: '+94771234567' },
              { name: 'email', label: 'Email', type: 'email', required: false },
              { name: 'station', label: 'Police Station', type: 'text', required: true },
              { name: 'password', label: 'Initial Password', type: 'password', required: true },
            ].map(field => (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-semibold text-slate-700">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="field"
                />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">District</label>
              <select name="district" value={form.district} onChange={handleChange}
                className="field">
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 sm:col-span-2">{error}</div>
            )}

            <div className="flex gap-3 sm:col-span-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Officer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="surface overflow-hidden rounded-lg">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">Officer Records</h2>
          <p className="text-sm font-semibold text-slate-500">{officers.length.toLocaleString()} shown</p>
        </div>
        {loadingOfficers ? (
          <div className="grid min-h-64 place-items-center text-sm font-semibold text-slate-500">Loading officers...</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'Badge', 'Phone', 'District', 'Station'].map(h => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officers.map(officer => (
                <tr key={officer.officerId || officer.badgeNumber} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{officer.fullName || officer.name || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{officer.badgeNumber || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{officer.phoneNumber || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{officer.district || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{officer.station || '-'}</td>
                </tr>
              ))}
              {officers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm font-medium text-slate-500">No data</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
