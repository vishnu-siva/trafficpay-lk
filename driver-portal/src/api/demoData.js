const PAID_FINE_KEY = 'trafficpay-demo-paid-refs'

function readPaidRefs() {
  try {
    return JSON.parse(window.localStorage.getItem(PAID_FINE_KEY) || '[]')
  } catch {
    return []
  }
}

export function isDemoPaid(referenceNumber) {
  return readPaidRefs().includes(referenceNumber)
}

export function markDemoPaid(referenceNumber) {
  const paidRefs = new Set(readPaidRefs())
  paidRefs.add(referenceNumber)
  window.localStorage.setItem(PAID_FINE_KEY, JSON.stringify([...paidRefs]))
}

export function makeDemoFine(referenceNumber, categoryId) {
  return {
    referenceNumber,
    categoryId,
    categoryCode: categoryId,
    categoryDescription: 'Speeding / traffic violation',
    vehicleNumber: 'WP-CAB-1234',
    district: 'Colombo',
    amount: 2500,
    demoMode: true,
  }
}

export function makeDemoReceipt(fine, payer) {
  return {
    receiptNumber: `RCP-${Date.now()}`,
    referenceNumber: fine.referenceNumber,
    amount: fine.amount,
    paymentMethod: payer.method,
    paidByName: payer.name,
    paidByNic: payer.nic,
    paidAt: new Date().toISOString(),
    status: 'SUCCESS',
    demoMode: true,
  }
}
