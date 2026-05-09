import {
  collection, query, where, getDocs, getDoc, doc,
  updateDoc, setDoc, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { db, auth } from '../firebase'

// ── Auth ──────────────────────────────────────────────────────────────────────

export const setToken = () => {}
export const clearToken = () => {}
export const getApiBaseUrl = () => 'Firebase Firestore (trafficpay-lk)'

export async function login(badgeNumber, password) {
  const email = `${badgeNumber.trim().toLowerCase()}@slpolice.lk`
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const officerSnap = await getDoc(doc(db, 'officers', cred.user.uid))
  const officerData = officerSnap.exists() ? officerSnap.data() : {}
  return {
    data: {
      token: await cred.user.getIdToken(),
      user: {
        uid: cred.user.uid,
        badgeNumber: officerData.badgeNumber ?? badgeNumber,
        fullName: officerData.fullName ?? `Officer ${badgeNumber}`,
        role: officerData.role ?? 'OFFICER',
        district: officerData.district ?? '',
      },
    },
  }
}

export async function logoutFirebase() {
  await fbSignOut(auth)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toTimestamp(dateStr, endOfDay = false) {
  const d = new Date(dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00'))
  return Timestamp.fromDate(d)
}

async function fetchFinesInRange(from, to) {
  const snap = await getDocs(
    query(
      collection(db, 'fines'),
      where('issuedAt', '>=', toTimestamp(from)),
      where('issuedAt', '<=', toTimestamp(to, true)),
    ),
  )
  return snap.docs.map(d => ({ fineId: d.id, ...d.data() }))
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getSummary(from, to) {
  const fines = await fetchFinesInRange(from, to)
  const paid = fines.filter(f => f.status === 'PAID')
  const revenue = paid.reduce((s, f) => s + (f.amount ?? 0), 0)
  return {
    data: {
      totalFinesIssued: fines.length,
      totalFinesPaid: paid.length,
      totalFinesPending: fines.filter(f => f.status === 'PENDING').length,
      totalRevenue: revenue,
      collectionRate: fines.length ? Math.round((paid.length / fines.length) * 100) : 0,
    },
  }
}

export async function getByDistrict(from, to) {
  const fines = await fetchFinesInRange(from, to)
  const map = {}
  for (const f of fines) {
    const key = f.district || 'Unknown'
    if (!map[key]) map[key] = { district: key, issued: 0, paid: 0, revenue: 0 }
    map[key].issued++
    if (f.status === 'PAID') { map[key].paid++; map[key].revenue += f.amount ?? 0 }
  }
  const districts = Object.values(map)
    .map(d => ({
      district: d.district,
      totalIssued: d.issued,
      totalPaid: d.paid,
      totalRevenue: d.revenue,
      collectionRate: d.issued ? Math.round((d.paid / d.issued) * 100) : 0,
    }))
    .sort((a, b) => b.totalIssued - a.totalIssued)
  return { data: { districts } }
}

export async function getByCategory(from, to) {
  const fines = await fetchFinesInRange(from, to)
  const map = {}
  for (const f of fines) {
    const key = f.categoryCode || 'Unknown'
    if (!map[key]) map[key] = { code: key, issued: 0, paid: 0, revenue: 0 }
    map[key].issued++
    if (f.status === 'PAID') { map[key].paid++; map[key].revenue += f.amount ?? 0 }
  }
  const categories = Object.values(map)
    .map(c => ({
      code: c.code,
      totalIssued: c.issued,
      totalPaid: c.paid,
      totalRevenue: c.revenue,
      collectionRate: c.issued ? Math.round((c.paid / c.issued) * 100) : 0,
    }))
    .sort((a, b) => b.totalIssued - a.totalIssued)
  return { data: { categories } }
}

export async function getRecentPayments() {
  const snap = await getDocs(
    query(collection(db, 'payments'), orderBy('paidAt', 'desc'), limit(10)),
  )
  return { data: snap.docs.map(d => ({ paymentId: d.id, ...d.data() })) }
}

// ── Fines ─────────────────────────────────────────────────────────────────────

export async function getAdminFines(params = {}) {
  const snap = await getDocs(
    query(collection(db, 'fines'), orderBy('issuedAt', 'desc'), limit(200)),
  )
  let fines = snap.docs.map(d => ({
    fineId: d.id,
    ...d.data(),
    issuedAt: d.data().issuedAt?.toDate?.()?.toISOString() ?? null,
  }))
  if (params.status) fines = fines.filter(f => f.status === params.status)
  if (params.district) {
    const dist = params.district.toUpperCase()
    fines = fines.filter(f => f.district?.toUpperCase().includes(dist))
  }
  return { data: fines }
}

export async function cancelFine(fineId, reason) {
  await updateDoc(doc(db, 'fines', fineId), {
    status: 'CANCELLED',
    cancelReason: reason,
    cancelledAt: serverTimestamp(),
  })
  return { data: { success: true } }
}

// ── Officers ──────────────────────────────────────────────────────────────────

export async function getOfficers() {
  const snap = await getDocs(collection(db, 'officers'))
  return { data: snap.docs.map(d => ({ officerId: d.id, ...d.data() })) }
}

export async function createOfficer(data) {
  const { badgeNumber, fullName, district, station, phoneNumber, email, password } = data
  const officerEmail = email || `${badgeNumber.toLowerCase()}@slpolice.lk`

  // Use Firebase Auth REST API to create user without signing out current admin
  const apiKey = 'AIzaSyCjA2ooIW5I35OCF5opalIS88SR9y3G_dA'
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: officerEmail, password, returnSecureToken: true }),
    },
  )
  if (!res.ok) {
    const body = await res.json()
    const err = new Error(body.error?.message || 'Failed to create user')
    err.response = { data: { message: err.message } }
    throw err
  }
  const { localId: uid } = await res.json()

  const officerData = {
    badgeNumber,
    fullName,
    district,
    station: station ?? '',
    phoneNumber: phoneNumber ?? '',
    email: officerEmail,
    role: 'OFFICER',
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'officers', uid), officerData)
  return { data: { officer: { officerId: uid, ...officerData } } }
}
