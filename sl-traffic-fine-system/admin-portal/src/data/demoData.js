export const DEMO_ADMIN = {
  fullName: 'Admin User',
  badgeNumber: 'admin',
  role: 'ADMIN',
  district: 'National',
}

export const DEMO_SUMMARY = {
  totalFinesIssued: 1248,
  totalFinesPaid: 914,
  totalFinesPending: 334,
  totalRevenue: 2847500,
  collectionRate: 73,
}

export const DEMO_DISTRICTS = [
  { district: 'COLOMBO', totalIssued: 312, totalPaid: 248, totalRevenue: 756000, collectionRate: 79 },
  { district: 'KANDY', totalIssued: 184, totalPaid: 126, totalRevenue: 398500, collectionRate: 68 },
  { district: 'GALLE', totalIssued: 151, totalPaid: 112, totalRevenue: 321000, collectionRate: 74 },
  { district: 'GAMPAHA', totalIssued: 204, totalPaid: 143, totalRevenue: 449000, collectionRate: 70 },
  { district: 'KURUNEGALA', totalIssued: 126, totalPaid: 91, totalRevenue: 278000, collectionRate: 72 },
  { district: 'JAFFNA', totalIssued: 88, totalPaid: 67, totalRevenue: 184000, collectionRate: 76 },
]

export const DEMO_CATEGORIES = [
  { code: 'TC001', categoryName: 'Speeding', totalPaid: 274, totalAmount: 685000, chartValue: 685000 },
  { code: 'TC002', categoryName: 'Running Red Light', totalPaid: 188, totalAmount: 564000, chartValue: 564000 },
  { code: 'TC004', categoryName: 'Using Mobile While Driving', totalPaid: 142, totalAmount: 284000, chartValue: 284000 },
  { code: 'TC007', categoryName: 'Illegal Parking', totalPaid: 211, totalAmount: 211000, chartValue: 211000 },
  { code: 'TC005', categoryName: 'Drunk Driving', totalPaid: 55, totalAmount: 275000, chartValue: 275000 },
]

export const DEMO_FINES = [
  {
    id: 1001,
    referenceNumber: 'FINE-2026-0001',
    vehicleNumber: 'WP CAB-4587',
    driverName: 'Nimal Perera',
    categoryCode: 'TC001',
    amount: 2500,
    district: 'COLOMBO',
    status: 'PENDING',
    issuedAt: '2026-05-01T09:45:00',
  },
  {
    id: 1002,
    referenceNumber: 'FINE-2026-0002',
    vehicleNumber: 'CP KA-7741',
    driverName: 'Kasun Silva',
    categoryCode: 'TC002',
    amount: 3000,
    district: 'KANDY',
    status: 'PAID',
    issuedAt: '2026-05-02T12:20:00',
  },
  {
    id: 1003,
    referenceNumber: 'FINE-2026-0003',
    vehicleNumber: 'SP BBA-9021',
    driverName: 'Amali Fernando',
    categoryCode: 'TC007',
    amount: 1000,
    district: 'GALLE',
    status: 'CANCELLED',
    issuedAt: '2026-05-03T16:05:00',
  },
  {
    id: 1004,
    referenceNumber: 'FINE-2026-0004',
    vehicleNumber: 'WP CAA-1180',
    driverName: 'Tharindu Jayasekara',
    categoryCode: 'TC004',
    amount: 2000,
    district: 'COLOMBO',
    status: 'PENDING',
    issuedAt: '2026-05-05T08:15:00',
  },
]

export const DEMO_OFFICERS = [
  { id: 1, fullName: 'Sunil Perera', badgeNumber: 'SLP-001', phoneNumber: '+94771234567', district: 'COLOMBO', station: 'Fort Police Station' },
  { id: 2, fullName: 'Nimal Silva', badgeNumber: 'SLP-002', phoneNumber: '+94772345678', district: 'KANDY', station: 'Kandy Police Station' },
  { id: 3, fullName: 'Kasun Fernando', badgeNumber: 'SLP-003', phoneNumber: '+94773456789', district: 'GALLE', station: 'Galle Police Station' },
]
