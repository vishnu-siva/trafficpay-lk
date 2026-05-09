import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoUrl from '../../../Logo.png'

export default function Layout() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutUser()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/fines', label: 'Fines' },
    { to: '/officers', label: 'Officers' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="flex bg-blue-950 text-white lg:fixed lg:inset-y-0 lg:w-72 lg:flex-col">
        <div className="flex min-w-0 flex-1 items-center gap-3 border-blue-900 px-4 py-4 lg:flex-none lg:border-b lg:px-6 lg:py-6">
          <img src={logoUrl} alt="Sri Lanka Traffic Police" className="brand-logo h-11 w-11" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold">TrafficPay LK</h1>
            <p className="text-xs font-medium text-blue-100">Admin Portal</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition lg:px-4 ${
                  isActive ? 'bg-white text-blue-950 shadow-sm' : 'text-blue-100 hover:bg-blue-900 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-blue-900 p-4 lg:block">
          <p className="truncate text-sm font-semibold text-white">{user?.fullName || 'Admin'}</p>
          <p className="mb-4 mt-1 text-xs text-blue-100">{user?.district || 'Sri Lanka'}</p>
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-blue-800 px-3 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-900 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-72">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-slate-500">{user?.district || 'Sri Lanka'}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary min-h-9 px-3 py-1.5">
              Logout
            </button>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
