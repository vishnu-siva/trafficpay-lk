# TrafficPay Backend - API Reference & Testing Guide

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## Public Endpoints (No Authentication Required)

### 1. Get Fine Categories
```
GET /categories
```
**Description:** Get list of all traffic fine categories

**Response:**
```json
[
  {
    "id": "CAT001",
    "name": "Speeding",
    "amount": 5000.00,
    "description": "Exceeding speed limit",
    "trafficLaw": "Motor Traffic Act Section 123"
  },
  {
    "id": "CAT002",
    "name": "No Seatbelt",
    "amount": 3000.00,
    "description": "Not wearing seatbelt",
    "trafficLaw": "Motor Traffic Act Section 124"
  }
]
```

---

### 2. Login (Officer/Admin)
```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "badgeNumber": "ADMIN001",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBRE1JTjAwMSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcxNjMzODAwMCwiZXhwIjoxNzE2NDI0NDAwfQ.xxx",
  "badgeNumber": "ADMIN001",
  "role": "ADMIN"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid badge number or password"
}
```

---

### 3. Lookup Fine
```
GET /fines/lookup?referenceNumber=FR001&categoryId=CAT001
```

**Description:** Look up a fine by reference number and category

**Response (200):**
```json
{
  "id": "fine_doc_id",
  "referenceNumber": "FR001",
  "categoryId": "CAT001",
  "vehicleNumber": "ABC-1234",
  "driverName": "John Doe",
  "amount": 5000.00,
  "status": "PENDING",
  "district": "Colombo",
  "createdAt": "2026-05-09T10:30:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Fine not found"
}
```

---

### 4. Initiate Payment
```
POST /payments/initiate
Content-Type: application/json
```

**Request Body:**
```json
{
  "fineId": "fine_doc_id",
  "paymentMethod": "CARD",
  "amount": 5000.00
}
```

**Response (200):**
```json
{
  "paymentId": "PAY001",
  "fineId": "fine_doc_id",
  "amount": 5000.00,
  "status": "INITIATED",
  "paymentGatewayUrl": "https://payment-gateway.com/pay?ref=PAY001",
  "createdAt": "2026-05-09T10:35:00Z"
}
```

---

### 5. Confirm Payment
```
POST /payments/confirm
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentId": "PAY001",
  "transactionId": "TXN123456",
  "status": "SUCCESS"
}
```

**Response (200):**
```json
{
  "paymentId": "PAY001",
  "status": "CONFIRMED",
  "transactionId": "TXN123456",
  "confirmedAt": "2026-05-09T10:40:00Z"
}
```

---

## Protected Endpoints (Requires Authentication)

### 1. Get Dashboard Summary (ADMIN)
```
GET /admin/dashboard
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "totalFines": 150,
  "totalRevenue": 750000.00,
  "paidFines": 120,
  "pendingFines": 30,
  "topDistricts": [
    {
      "district": "Colombo",
      "count": 45,
      "revenue": 225000.00
    },
    {
      "district": "Kandy",
      "count": 38,
      "revenue": 190000.00
    }
  ],
  "categoryStats": [
    {
      "categoryId": "CAT001",
      "categoryName": "Speeding",
      "count": 60,
      "revenue": 300000.00
    }
  ]
}
```

---

### 2. Get All Officers (ADMIN)
```
GET /admin/officers
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "officer_doc_id",
    "badgeNumber": "OFF001",
    "fullName": "Kamal Perera",
    "district": "Colombo",
    "station": "Colombo Central",
    "phoneNumber": "+94771234567",
    "createdAt": "2026-05-01T08:00:00Z"
  }
]
```

---

### 3. Create Officer (ADMIN)
```
POST /admin/officers
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "badgeNumber": "OFF002",
  "fullName": "Silva Jayasinghe",
  "password": "temporary123",
  "district": "Kandy",
  "station": "Kandy Central",
  "phoneNumber": "+94772345678"
}
```

**Response (201):**
```json
{
  "id": "new_officer_id",
  "badgeNumber": "OFF002",
  "fullName": "Silva Jayasinghe",
  "district": "Kandy",
  "station": "Kandy Central",
  "phoneNumber": "+94772345678",
  "createdAt": "2026-05-09T11:00:00Z"
}
```

---

### 4. Issue Fine (OFFICER)
```
POST /fines/issue
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "categoryId": "CAT001",
  "vehicleNumber": "ABC-1234",
  "driverName": "John Doe",
  "district": "Colombo"
}
```

**Response (201):**
```json
{
  "id": "fine_doc_id",
  "referenceNumber": "FR001",
  "categoryId": "CAT001",
  "amount": 5000.00,
  "vehicleNumber": "ABC-1234",
  "driverName": "John Doe",
  "status": "PENDING",
  "createdAt": "2026-05-09T11:05:00Z"
}
```

---

### 5. Cancel Fine (ADMIN)
```
PUT /fines/{fineId}/cancel
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Duplicate entry"
}
```

**Response (200):**
```json
{
  "id": "fine_doc_id",
  "referenceNumber": "FR001",
  "status": "CANCELLED",
  "cancelledAt": "2026-05-09T11:10:00Z",
  "reason": "Duplicate entry"
}
```

---

## Testing with cURL

### Test 1: Get Categories
```bash
curl http://localhost:8080/api/v1/categories
```

### Test 2: Login and Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "badgeNumber": "ADMIN001",
    "password": "admin123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### Test 3: Use Token to Access Protected Endpoint
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/admin/dashboard
```

### Test 4: Look Up Fine
```bash
curl "http://localhost:8080/api/v1/fines/lookup?referenceNumber=FR001&categoryId=CAT001"
```

### Test 5: Initiate Payment
```bash
curl -X POST http://localhost:8080/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "fineId": "fine_doc_id",
    "paymentMethod": "CARD",
    "amount": 5000.00
  }'
```

---

## Testing with Postman

### Setup Postman Collection

1. **Create Variables:**
   - `base_url`: http://localhost:8080/api/v1
   - `token`: (leave empty, will be set after login)

2. **Create Login Request:**
   ```
   POST {{base_url}}/auth/login
   
   Body (JSON):
   {
     "badgeNumber": "ADMIN001",
     "password": "admin123"
   }
   
   Tests tab (set token):
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```

3. **Create Protected Request:**
   ```
   GET {{base_url}}/admin/dashboard
   
   Headers:
   Authorization: Bearer {{token}}
   ```

4. **Run Collection:**
   - Login first to get token
   - Run other requests that use the token

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": "Badge number is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "details": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "details": "Fine not found with ID: fine_doc_id"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request format |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding for production:

```
- Login endpoint: 5 attempts per minute
- Payment endpoints: 10 requests per minute
- Dashboard: 30 requests per minute
```

---

## Testing Checklist

- [ ] Server starts on port 8080
- [ ] Categories endpoint returns data
- [ ] Admin login with ADMIN001/admin123 works
- [ ] JWT token is generated and valid
- [ ] Dashboard returns summary statistics
- [ ] Officers list can be retrieved
- [ ] New officer can be created
- [ ] Fine lookup works with valid reference number
- [ ] Payment initiation works
- [ ] Payment confirmation works
- [ ] SMS notification logic works (check logs)
- [ ] CORS allows requests from frontend ports
- [ ] Invalid tokens are rejected
- [ ] Missing credentials return 401

---

## Next Steps

1. Test all endpoints locally
2. Integrate Admin Portal API calls
3. Integrate Driver Portal API calls
4. Load testing with multiple concurrent requests
5. Security testing (SQL injection, XSS prevention)
6. Deploy to staging environment
