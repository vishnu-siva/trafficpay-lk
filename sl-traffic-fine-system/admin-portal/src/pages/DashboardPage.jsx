import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { getSummary, getByDistrict, getByCategory } from '../api/adminApi'
import { DEMO_CATEGORIES, DEMO_DISTRICTS, DEMO_SUMMARY } from '../data/demoData'

const COLORS = ['#1e3a8a', '#0f766e', '#f59e0b', '#7c3aed', '#dc2626', '#2563eb', '#16a34a', '#64748b']

function KpiCard({ title, value, sub, color }) {
  return (
    <div className="bg-white rounded shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function EmptyState({ label = 'No data' }) {
  return <div className="flex items-center justify-center h-64 text-gray-400">{label}</div>
}

function normaliseSummary(data) {
  const totalFinesIssued = data.totalFinesIssued ?? data.totalFines ?? 0
  const totalFinesPaid = data.totalFinesPaid ?? data.paidFines ?? 0
  const totalFinesPending = data.totalFinesPending ?? data.pendingFines ?? Math.max(totalFinesIssued - totalFinesPaid, 0)
  const totalRevenue = Number(data.totalRevenue ?? data.totalCollection ?? 0)
  const collectionRate = totalFinesIssued > 0 ? Math.round((totalFinesPaid / totalFinesIssued) * 100) : 0
  return { totalFinesIssued, totalFinesPaid, totalFinesPending, totalRevenue, collectionRate }
}

function normaliseDistricts(data) {
  const rows = Array.isArray(data) ? data : data.districts || []
  return rows.map(row => ({
    district: row.district || 'UNKNOWN',
    totalIssued: Number(row.totalIssued ?? row.totalFines ?? 0),
    totalPaid: Number(row.totalPaid ?? row.paidFines ?? 0),
    totalRevenue: Number(row.totalRevenue ?? row.totalCollection ?? 0),
    collectionRate: Number(row.collectionRate ?? 0),
  }))
}

function normaliseCategories(data) {
  const rows = Array.isArray(data) ? data : data.categories || []
  return rows.map(row => ({
    code: row.code || row.categoryCode || row.categoryName || 'Category',
    categoryName: row.categoryName || row.name || row.code || 'Category',
    totalPaid: Number(row.totalPaid ?? row.count ?? 0),
    totalAmount: Number(row.totalAmount ?? row.totalRevenue ?? 0),
    chartValue: Number(row.totalAmount ?? row.totalRevenue ?? row.totalPaid ?? row.count ?? 0),
  }))
}

export default function DashboardPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState(null)
  const [districtData, setDistrictData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, d, c] = await Promise.all([
        getSummary(from, to),
        getByDistrict(from, to),
        getByCategory(from, to),
      ])
      setSummary(normaliseSummary(s.data))
      setDistrictData(normaliseDistricts(d.data))
      setCategoryData(normaliseCategories(c.data))
    } catch (e) {
      console.error('Dashboard load failed', e)
      setSummary(DEMO_SUMMARY)
      setDistrictData(DEMO_DISTRICTS)
      setCategoryData(DEMO_CATEGORIES)
      setError('Showing frontend demo data because the backend is not connected.')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  function exportCsv() {
    const rows = [
      ['District', 'Issued', 'Paid', 'Revenue (LKR)', 'Collection Rate %'],
      ...districtData.map(d => [d.district, d.totalIssued, d.totalPaid, d.totalRevenue, d.collectionRate])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `district-report-${from}-to-${to}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3 items-center flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm" />
          <span className="text-gray-400">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm" />
          <button onClick={fetchData}
            className="bg-blue-900 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-800">
            Apply
          </button>
          <button onClick={exportCsv}
            className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={districtData.length === 0}>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-4 py-3 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Fines Issued" value={summary?.totalFinesIssued?.toLocaleString() ?? '-'} color="text-gray-800" />
            <KpiCard title="Total Paid" value={summary?.totalFinesPaid?.toLocaleString() ?? '-'} color="text-green-600" />
            <KpiCard title="Total Revenue" value={`LKR ${(summary?.totalRevenue || 0).toLocaleString()}`} color="text-blue-700" />
            <KpiCard title="Collection Rate" value={`${summary?.collectionRate ?? 0}%`}
              sub={`${summary?.totalFinesPending?.toLocaleString()} pending`} color="text-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow-sm border border-slate-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Collections by District</h2>
              {districtData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(v, n) => [n === 'totalRevenue' ? `LKR ${Number(v).toLocaleString()}` : v, n]} />
                    <Legend />
                    <Bar dataKey="totalIssued" name="Issued" fill="#94a3b8" />
                    <Bar dataKey="totalPaid" name="Paid" fill="#0f766e" />
                    <Bar dataKey="totalRevenue" name="Revenue" fill="#1e3a8a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState />}
            </div>

            <div className="bg-white rounded shadow-sm border border-slate-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Breakdown by Category</h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData.filter(c => c.chartValue > 0)} dataKey="chartValue"
                      nameKey="code" cx="50%" cy="50%" outerRadius={100} label={({ code }) => code}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`LKR ${Number(v).toLocaleString()}`, 'Total']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-700">District Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['District', 'Issued', 'Paid', 'Pending', 'Revenue (LKR)', 'Collection Rate'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {districtData.map(d => (
                    <tr key={d.district} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{d.district}</td>
                      <td className="px-4 py-3">{d.totalIssued}</td>
                      <td className="px-4 py-3 text-green-600">{d.totalPaid}</td>
                      <td className="px-4 py-3 text-orange-500">{d.totalIssued - d.totalPaid}</td>
                      <td className="px-4 py-3">{d.totalRevenue?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${d.collectionRate}%` }} />
                          </div>
                          <span className="text-xs">{d.collectionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {districtData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
