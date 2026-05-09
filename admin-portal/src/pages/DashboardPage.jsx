import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { getSummary, getByDistrict, getByCategory } from '../api/adminApi'

const COLORS = ['#0369a1', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#be123c', '#475569']

const number = value => Number(value || 0).toLocaleString()
const money = value => `LKR ${number(value)}`
const toList = (data, key) => {
  const rows = data?.[key] || data?.items || data
  return Array.isArray(rows) ? rows : []
}
const districtName = row => row.district || row.name || 'Unknown'
const categoryName = row => row.code || row.categoryCode || row.category || row.name || 'Other'
const issuedTotal = row => Number(row.totalIssued ?? row.issued ?? row.count ?? 0)
const paidTotal = row => Number(row.totalPaid ?? row.paid ?? 0)
const revenueTotal = row => Number(row.totalRevenue ?? row.revenue ?? row.amount ?? 0)
const rateTotal = row => Number(row.collectionRate ?? 0)

function KpiCard({ title, value, sub, tone }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-800 border-sky-100',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    slate: 'bg-slate-50 text-slate-800 border-slate-100',
  }

  return (
    <div className={`rounded-lg border p-5 ${tones[tone]}`}>
      <p className="text-sm font-semibold opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      {sub && <p className="mt-2 text-xs font-medium opacity-75">{sub}</p>}
    </div>
  )
}

function EmptyState({ title }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm font-medium text-slate-500">
      {title}
    </div>
  )
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
      setSummary(s.data)
      setDistrictData(toList(d.data, 'districts'))
      setCategoryData(toList(c.data, 'categories'))
    } catch (e) {
      console.error('Dashboard load failed', e)
      setSummary(null)
      setDistrictData([])
      setCategoryData([])
      setError('Dashboard data could not be loaded. Check the backend URL and admin token.')
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
    if (!districtData.length) return
    const rows = [
      ['District', 'Issued', 'Paid', 'Revenue (LKR)', 'Collection Rate %'],
      ...districtData.map(d => [districtName(d), issuedTotal(d), paidTotal(d), revenueTotal(d), rateTotal(d)])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `district-report-${from}-to-${to}.csv`
    a.click()
  }

  const paidCategories = categoryData.filter(c => paidTotal(c) > 0 || revenueTotal(c) > 0 || issuedTotal(c) > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-700">Overview</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard</h1>
        </div>
        <div className="surface flex flex-wrap items-center gap-3 rounded-lg p-3">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="field w-auto" />
          <span className="text-sm font-semibold text-slate-400">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="field w-auto" />
          <button onClick={fetchData}
            className="btn-primary">
            Apply
          </button>
          <button onClick={exportCsv} disabled={!districtData.length}
            className="btn-secondary">
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="surface grid min-h-80 place-items-center rounded-lg text-sm font-semibold text-slate-500">Loading dashboard...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Fines Issued" value={number(summary?.totalFinesIssued)} tone="slate" />
            <KpiCard title="Paid Fines" value={number(summary?.totalFinesPaid)} tone="green" />
            <KpiCard title="Revenue" value={money(summary?.totalRevenue)} tone="sky" />
            <KpiCard title="Collection Rate" value={`${summary?.collectionRate ?? 0}%`}
              sub={`${number(summary?.totalFinesPending)} pending`} tone="amber" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="surface rounded-lg p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-bold text-slate-900">Collections by District</h2>
                <p className="text-xs font-semibold text-slate-500">Top 10</p>
              </div>
              {districtData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={districtData.slice(0, 10).map(row => ({
                    district: districtName(row),
                    totalIssued: issuedTotal(row),
                    totalPaid: paidTotal(row),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="district" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v, n) => [n === 'totalRevenue' ? money(v) : number(v), n]} />
                    <Legend />
                    <Bar dataKey="totalIssued" name="Issued" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalPaid" name="Paid" fill="#0369a1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No district data" />
              )}
            </div>

            <div className="surface rounded-lg p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-bold text-slate-900">Breakdown by Category</h2>
                <p className="text-xs font-semibold text-slate-500">{paidCategories.length} active</p>
              </div>
              {paidCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={paidCategories.map(row => ({
                      code: categoryName(row),
                      totalPaid: paidTotal(row) || issuedTotal(row),
                    }))} dataKey="totalPaid"
                      nameKey="code" cx="50%" cy="50%" innerRadius={62} outerRadius={108} paddingAngle={3} label={({ code }) => code}>
                      {paidCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [number(v), 'Paid']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No category data" />
              )}
            </div>
          </div>

          <div className="surface overflow-hidden rounded-lg">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">District Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['District', 'Issued', 'Paid', 'Pending', 'Revenue (LKR)', 'Collection Rate'].map(h => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districtData.map(d => (
                    <tr key={districtName(d)} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{districtName(d)}</td>
                      <td className="px-4 py-3 text-slate-700">{number(issuedTotal(d))}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{number(paidTotal(d))}</td>
                      <td className="px-4 py-3 font-semibold text-amber-700">{number(Math.max(issuedTotal(d) - paidTotal(d), 0))}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{number(revenueTotal(d))}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-36 items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-sky-700" style={{ width: `${Math.min(rateTotal(d), 100)}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-slate-600">{rateTotal(d)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {districtData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-slate-500">No data</td>
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
