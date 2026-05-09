import {
  collection, query, where, getDocs, addDoc, getDoc,
  doc, updateDoc, writeBatch, serverTimestamp, limit,
} from 'firebase/firestore'
import { db } from '../firebase'

export function getApiBaseUrl() {
  return 'Firebase Firestore (trafficpay-lk)'
}

export async function getCategories() {
  const snap = await getDocs(collection(db, 'fineCategories'))
  const data = snap.docs.map(d => ({
    code: d.data().code,
    description: d.data().description,
    amount: d.data().amount,
  }))
  return { data }
}

export async function lookupFine(referenceNumber) {
  const q = query(
    collection(db, 'fines'),
    where('referenceNumber', '==', referenceNumber.trim().toUpperCase()),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) {
    const err = new Error('Fine not found')
    err.response = { status: 404, data: { code: 'NOT_FOUND' } }
    throw err
  }
  const d = snap.docs[0]
  const data = d.data()
  if (data.status === 'PAID') {
    const err = new Error('Already paid')
    err.response = { status: 409, data: { code: 'ALREADY_PAID' } }
    throw err
  }
  return {
    data: {
      fineId: d.id,
      ...data,
      issuedAt: data.issuedAt?.toDate?.()?.toISOString() ?? null,
    },
  }
}

export async function initiatePayment(data) {
  // Look up fineId by referenceNumber
  const q = query(
    collection(db, 'fines'),
    where('referenceNumber', '==', data.referenceNumber),
    limit(1),
  )
  const snap = await getDocs(q)
  const fineId = snap.empty ? null : snap.docs[0].id
  const fineAmount = snap.empty ? 0 : (snap.docs[0].data().amount ?? 0)

  const receiptNumber = 'RCP-' + crypto.randomUUID().substring(0, 8).toUpperCase()
  const paymentData = {
    fineId,
    referenceNumber: data.referenceNumber,
    categoryId: data.categoryId ?? '',
    amount: fineAmount,
    status: 'PENDING',
    paymentMethod: data.paymentMethod,
    paymentChannel: data.paymentChannel || 'WEB_PORTAL',
    paidByName: data.paidByName,
    paidByNic: data.paidByNic,
    receiptNumber,
    smsNotified: false,
    createdAt: serverTimestamp(),
    paidAt: null,
  }

  const payRef = await addDoc(collection(db, 'payments'), paymentData)
  return { data: { paymentId: payRef.id, receiptNumber, ...paymentData } }
}

export async function confirmPayment(data) {
  const { paymentId } = data
  const payRef = doc(db, 'payments', paymentId)
  const paySnap = await getDoc(payRef)
  if (!paySnap.exists()) throw new Error('Payment not found')
  const pay = paySnap.data()

  const batch = writeBatch(db)
  batch.update(payRef, { status: 'COMPLETED', smsNotified: true, paidAt: serverTimestamp() })
  if (pay.fineId) {
    batch.update(doc(db, 'fines', pay.fineId), { status: 'PAID', paidAt: serverTimestamp() })
  }
  await batch.commit()

  const paidAt = new Date().toISOString()
  return {
    data: {
      paymentId,
      receiptNumber: pay.receiptNumber,
      referenceNumber: pay.referenceNumber,
      amount: pay.amount,
      paymentMethod: pay.paymentMethod,
      paidByName: pay.paidByName,
      paidByNic: pay.paidByNic,
      smsNotified: true,
      paidAt,
    },
  }
}

export async function getReceipt(paymentId) {
  const paySnap = await getDoc(doc(db, 'payments', paymentId))
  if (!paySnap.exists()) throw new Error('Receipt not found')
  return { data: { paymentId, ...paySnap.data() } }
}
