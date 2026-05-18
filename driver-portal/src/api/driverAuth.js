import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
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

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const user = cred.user
  const ref = doc(db, 'drivers', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      fullName: user.displayName || '',
      nicNumber: '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || null,
      role: 'DRIVER',
      createdAt: serverTimestamp(),
    })
  }
  return user
}

export async function logoutDriver() {
  await fbSignOut(auth)
  signInAnonymously(auth).catch(() => {})
}
