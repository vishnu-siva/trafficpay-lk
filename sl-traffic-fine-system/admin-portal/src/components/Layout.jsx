import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutUser()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'D' },
    { to: '/fines', label: 'Fines', icon: 'F' },
    { to: '/officers', label: 'Officers', icon: 'O' },
  ]

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-950 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-lg font-bold">SL Traffic Police</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                  isActive ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <span className="h-6 w-6 rounded bg-current/10 flex items-center justify-center text-xs font-bold">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-300 mb-1 truncate">{user?.fullName || user?.badgeNumber}</p>
          <p className="text-xs text-slate-500 mb-3">{user?.district || user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-slate-200 hover:text-white py-1 text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
