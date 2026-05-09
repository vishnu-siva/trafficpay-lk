import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export async function registerDriver({ fullName, nicNumber, phoneNumber, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'drivers', cred.user.uid), {
    fullName,
    nicNumber,
    email,
    phoneNumber: phoneNumber || null,
    role: 'DRIVER',
    createdAt: serverTimestamp(),
  })
  return cred.user
}

export async function loginDriver(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logoutDriver() {
  await fbSignOut(auth)
  signInAnonymously(auth).catch(() => {})
}
