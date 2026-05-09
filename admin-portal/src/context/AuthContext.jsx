import { createContext, useContext, useState } from 'react'
import { setToken, clearToken } from '../api/adminApi'

const AuthContext = createContext(null)
const USER_KEY = 'trafficpay_admin_user'
const TOKEN_KEY = 'trafficpay_admin_token'

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null
    } catch {
      return null
    }
  })

  const loginUser = (token, userInfo) => {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setAuthToken(token)
    setUser(userInfo)
  }

  const logoutUser = () => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, isLoggedIn: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
