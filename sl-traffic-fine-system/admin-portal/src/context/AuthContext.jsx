import { createContext, useContext, useState } from 'react'
import { setToken, clearToken, saveUser, getSavedUser } from '../api/adminApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSavedUser())

  const loginUser = (token, userInfo) => {
    setToken(token)
    saveUser(userInfo)
    setUser(userInfo)
  }

  const logoutUser = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
