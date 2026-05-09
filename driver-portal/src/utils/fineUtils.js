export function formatMoney(amount) {
  const value = Number(amount || 0)
  return `LKR ${value.toLocaleString('en-LK', { maximumFractionDigits: 2 })}`
}

export function getFineAmount(fine) {
  return fine?.amount ?? fine?.fineAmount ?? fine?.totalAmount ?? 0
}

export function getReference(fine) {
  return fine?.referenceNumber ?? fine?.refNumber ?? fine?.reference ?? ''
}

export function getCategoryId(fine) {
  return fine?.categoryId ?? fine?.categoryCode ?? fine?.category ?? ''
}

export function getCategoryLabel(fine) {
  return fine?.categoryDescription ?? fine?.offence ?? fine?.offenceName ?? fine?.categoryCode ?? getCategoryId(fine)
}

export function getVehicleNo(fine) {
  return fine?.vehicleNumber ?? fine?.vehicleNo ?? fine?.vehicle ?? '-'
}

export function getDistrict(fine) {
  return fine?.district ?? fine?.policeDistrict ?? '-'
}

export function getReceiptNumber(receipt) {
  return receipt?.receiptNumber ?? receipt?.receiptNo ?? receipt?.paymentId ?? '-'
}

export function getReceiptAmount(receipt, fine) {
  return receipt?.amount ?? receipt?.amountPaid ?? getFineAmount(fine)
}
