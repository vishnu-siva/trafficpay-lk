import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSummary, getByDistrict, getByCategory, getAllFines } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#2b6cb0', '#276749', '#c05621', '#6b46c1', '#2c7a7b', '#9b2c2c', '#744210', '#1a365d']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [districtData, setDistrictData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [fines, setFines] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const username = localStorage.getItem('admin_username')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, d, c, f] = await Promise.all([getSummary(), getByDistrict(), getByCategory(), getAllFines()])
      setSummary(s.data)
      setDistrictData(d.data.map(item => ({ name: item.district, amount: parseFloat(item.totalCollection) })))
      setCategoryData(c.data.map(item => ({ name: item.categoryName, value: parseInt(item.count), amount: parseFloat(item.totalAmount) })))
      setFines(f.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    navigate('/login')
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading data...</p></div>

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🚔</span>
          <div><strong>SL Police</strong><p>Admin Portal</p></div>
        </div>
        <nav>
          {[['overview', '📊', 'Overview'], ['district', '🗺️', 'By District'], ['category', '📋', 'By Category'], ['fines', '📄', 'All Fines']].map(([tab, icon, label]) => (
            <button key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{username}</p>
          <button className="btn btn-logout" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content">
        {activeTab === 'overview' && (
          <>
            <h2 className="page-title">Dashboard Overview</h2>
            <div className="stats-grid">
              <StatCard label="Total Fines Issued" value={summary?.totalFines ?? 0} color="#2b6cb0" />
              <StatCard label="Fines Paid" value={summary?.paidFines ?? 0} color="#276749" />
              <StatCard label="Fines Pending" value={summary?.pendingFines ?? 0} color="#c05621" />
              <StatCard label="Total Collection" value={`LKR ${(summary?.totalCollection ?? 0).toLocaleString()}`} color="#6b46c1" />
            </div>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Collections by District (LKR)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#2b6cb0" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Fines by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'district' && (
          <>
            <h2 className="page-title">Collections by District</h2>
            <div className="chart-card full">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={districtData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#2b6cb0" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="data-table">
              <thead><tr><th>District</th><th>Total Collection (LKR)</th></tr></thead>
              <tbody>{districtData.map(d => (
                <tr key={d.name}><td>{d.name}</td><td>{d.amount.toLocaleString()}</td></tr>
              ))}</tbody>
            </table>
          </>
        )}

        {activeTab === 'category' && (
          <>
            <h2 className="page-title">Collections by Category</h2>
            <table className="data-table">
              <thead><tr><th>Category</th><th>Count</th><th>Total Amount (LKR)</th></tr></thead>
              <tbody>{categoryData.map(c => (
                <tr key={c.name}><td>{c.name}</td><td>{c.value}</td><td>{c.amount.toLocaleString()}</td></tr>
              ))}</tbody>
            </table>
          </>
        )}

        {activeTab === 'fines' && (
          <>
            <h2 className="page-title">All Traffic Fines</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th><th>Driver</th><th>Vehicle</th>
                    <th>Category</th><th>District</th><th>Officer</th>
                    <th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>{fines.map(f => (
                  <tr key={f.id}>
                    <td className="mono">{f.referenceNumber}</td>
                    <td>{f.driverName}</td>
                    <td>{f.vehicleNumber}</td>
                    <td>{f.categoryName}</td>
                    <td>{f.district}</td>
                    <td>{f.officerName}</td>
                    <td>LKR {f.amount?.toLocaleString()}</td>
                    <td><span className={`badge ${f.status === 'PAID' ? 'badge-paid' : 'badge-pending'}`}>{f.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>{value}</p>
    </div>
  )
}
