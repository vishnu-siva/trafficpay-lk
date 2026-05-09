import { useEffect, useState } from 'react'
import { createOfficer, getOfficers } from '../api/adminApi'
import { DEMO_OFFICERS } from '../data/demoData'

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

const LOCAL_OFFICERS_KEY = 'trafficpay_created_officers'

function readLocalOfficers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_OFFICERS_KEY)) || []
  } catch {
    return []
  }
}

function saveLocalOfficers(rows) {
  localStorage.setItem(LOCAL_OFFICERS_KEY, JSON.stringify(rows))
}

export default function OfficersPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [officers, setOfficers] = useState([])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [listError, setListError] = useState(null)

  async function fetchOfficers() {
    setListLoading(true)
    setListError(null)
    try {
      const { data } = await getOfficers()
      const rows = Array.isArray(data) ? data : data.officers || []
      setOfficers([...rows, ...readLocalOfficers()])
    } catch (err) {
      setOfficers([...readLocalOfficers(), ...DEMO_OFFICERS])
      if (err.response?.status !== 404) {
        setListError('Showing frontend demo data because the backend is not connected.')
      }
    } finally {
      setListLoading(false)
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
      let savedOfficer
      try {
        const { data } = await createOfficer(form)
        savedOfficer = data
      } catch (err) {
        if (err.response?.status && err.response.status !== 404) throw err
        savedOfficer = { ...form, id: `local-${Date.now()}`, localOnly: true }
      }
      const localRows = savedOfficer.localOnly ? [savedOfficer, ...readLocalOfficers()] : readLocalOfficers()
      saveLocalOfficers(localRows)
      setOfficers(prev => [savedOfficer, ...prev.filter(o => o.badgeNumber !== savedOfficer.badgeNumber)])
      setSuccess(`Officer ${savedOfficer.fullName} (${savedOfficer.badgeNumber}) created successfully.`)
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create officer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Officers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-900 text-white px-4 py-2 rounded text-sm hover:bg-blue-800"
        >
          Add Officer
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Register New Officer</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select name="district" value={form.district} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {error && (
              <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>
            )}

            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 rounded py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-900 text-white rounded py-2 text-sm hover:bg-blue-800 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Officer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {listError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-4 py-3 text-sm">{listError}</div>
      )}

      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Registered Officers</h2>
          <button onClick={fetchOfficers} className="text-sm text-blue-800 hover:text-blue-900">Refresh</button>
        </div>
        {listLoading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Officer', 'Badge', 'Phone', 'District', 'Station', 'Source'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {officers.map(officer => (
                  <tr key={officer.id || officer.badgeNumber} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{officer.fullName || officer.name || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{officer.badgeNumber || officer.username || '-'}</td>
                    <td className="px-4 py-3">{officer.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">{officer.district || '-'}</td>
                    <td className="px-4 py-3">{officer.station || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${officer.localOnly ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {officer.localOnly ? 'Local' : 'Backend'}
                      </span>
                    </td>
                  </tr>
                ))}
                {officers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">No data</td>
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
