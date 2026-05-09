import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCjA2ooIW5I35OCF5opalIS88SR9y3G_dA',
  authDomain: 'trafficpay-lk.firebaseapp.com',
  projectId: 'trafficpay-lk',
  storageBucket: 'trafficpay-lk.firebasestorage.app',
  messagingSenderId: '855087722830',
  appId: '1:855087722830:web:2291ce30e6ecb1413b6e1f',
  measurementId: 'G-GE4PG3G8SK',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Sign in anonymously so Firestore rules (auth != null) allow reads
signInAnonymously(auth).catch(() => {})
