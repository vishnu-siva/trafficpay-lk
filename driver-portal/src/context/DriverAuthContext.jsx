import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const DriverAuthContext = createContext(null)

export function DriverAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        setUser(firebaseUser)
        const snap = await getDoc(doc(db, 'drivers', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <DriverAuthContext.Provider value={{ user, profile, loading, isLoggedIn: !!user }}>
      {children}
    </DriverAuthContext.Provider>
  )
}

export const useDriverAuth = () => useContext(DriverAuthContext)
