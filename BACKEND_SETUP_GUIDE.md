# TrafficPay Backend Setup Guide

## Overview
This guide walks through setting up the Spring Boot backend with Firebase Firestore, JWT authentication, and Twilio SMS integration.

---

## Prerequisites
- Java 17 installed
- Maven 3.8+ installed
- Google Firebase account
- Twilio account (optional for testing)

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Enter project name (e.g., `trafficpay-lk`)
3. Skip Google Analytics (or enable if desired)
4. Create project

### 1.2 Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose location closest to your region (e.g., `asia-southeast1` for Sri Lanka)
5. Click **Enable**

### 1.3 Generate Service Account Key
1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file as `firebase-service-account.json`
4. Place it in: `backend/src/main/resources/firebase-service-account.json`

---

## Step 2: Environment Variables Configuration

### 2.1 Set Environment Variables (macOS/Linux)

```bash
# Add to ~/.zshrc or ~/.bash_profile
export JWT_SECRET="trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF"
export JWT_EXPIRATION=86400000
export TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
export TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
export TWILIO_PHONE_NUMBER="+1234567890"
export FIREBASE_SERVICE_ACCOUNT_PATH="backend/src/main/resources/firebase-service-account.json"

# Reload
source ~/.zshrc  # or ~/.bash_profile
```

### 2.2 Update application.properties
The file is already configured at `backend/src/main/resources/application.properties`:

```properties
server.port=8080
spring.application.name=trafficpay-backend

# Firebase
firebase.service-account-path=classpath:firebase-service-account.json

# JWT
app.jwt.secret=trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF
app.jwt.expiration=86400000

# Twilio (replace with real credentials)
twilio.account-sid=YOUR_TWILIO_ACCOUNT_SID
twilio.auth-token=YOUR_TWILIO_AUTH_TOKEN
twilio.phone-number=YOUR_TWILIO_PHONE_NUMBER
```

---

## Step 3: Twilio Setup (SMS Notifications)

### 3.1 Create Twilio Account
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up or log in
3. Get **Account SID** and **Auth Token** from Dashboard
4. Purchase or verify a phone number (for `twilio.phone-number`)
5. Update `application.properties` with your Twilio credentials

### 3.2 Test SMS Service
The `SmsService` has mock mode - if credentials start with `YOUR_`, it logs SMS instead of sending.

---

## Step 4: Build and Run Backend

### 4.1 Build the Project
```bash
cd backend
mvn clean install
```

### 4.2 Run the Application
```bash
mvn spring-boot:run
```

Backend will be available at: **http://localhost:8080**

### 4.3 Verify Backend is Running
```bash
curl http://localhost:8080/api/v1/categories
```

---

## Step 5: Firestore Collections Setup

### 5.1 Create Collections in Firestore Console
The backend will auto-create collections, but you can manually create:

1. **users** - Traffic police officers
   - Fields: `badgeNumber`, `name`, `email`, `phone`, `role`, `createdAt`

2. **fines** - Traffic fines
   - Fields: `referenceNumber`, `categoryId`, `vehicleNumber`, `driverName`, `amount`, `status`, `createdAt`

3. **fine_categories** - Fine types
   - Fields: `name`, `amount`, `description`

4. **payments** - Payment records
   - Fields: `fineId`, `amount`, `status`, `paymentMethod`, `transactionId`, `createdAt`

### 5.2 Initial Data
Run the `DataInitializer` to seed initial data:
- Admin user (badge: ADMIN001)
- Sample fine categories
- Sample officers

---

## Step 6: API Testing

### 6.1 Test Authentication
```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "badgeNumber": "ADMIN001",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "badgeNumber": "ADMIN001",
  "role": "ADMIN"
}
```

### 6.2 Test Fine Lookup
```bash
GET http://localhost:8080/api/v1/fines/lookup?referenceNumber=FR001&categoryId=CAT001
```

### 6.3 Test Payment Initiation
```bash
POST http://localhost:8080/api/v1/payments/initiate
Content-Type: application/json

{
  "fineId": "fine_doc_id",
  "paymentMethod": "CARD",
  "amount": 5000.00
}
```

---

## Step 7: CORS Configuration

The backend is already configured to accept requests from:
- `http://localhost:5173` (Admin Portal - Vite)
- `http://localhost:5174` (Driver Portal - Vite)
- `http://localhost:3000` (Alternative ports)
- `http://localhost:3001`

To add more origins, update `SecurityConfig.java`:

```java
config.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://your-domain.com"
));
```

---

## Step 8: Frontend Integration

### 8.1 Admin Portal
- Base API URL: `http://localhost:8080/api/v1`
- Uses JWT tokens for authentication
- Dashboard stats from `/admin/dashboard`

### 8.2 Driver Portal
- Base API URL: `http://localhost:8080/api/v1`
- Fine lookup from `/fines/lookup`
- Payment initiation from `/payments/initiate`

---

## Troubleshooting

### Firebase Connection Issues
- ✅ Verify `firebase-service-account.json` is in `backend/src/main/resources/`
- ✅ Check Firebase project ID matches the JSON file
- ✅ Enable Firestore Database in Firebase Console

### JWT Token Errors
- ✅ Ensure `JWT_SECRET` is the same in all services
- ✅ Token expires after 24 hours (86400000 ms)
- ✅ Send token in header: `Authorization: Bearer <token>`

### CORS Errors
- ✅ Check frontend port is in `SecurityConfig` allowed origins
- ✅ Ensure credentials are sent: `withCredentials: true`

### Twilio SMS Not Sending
- ✅ Verify Twilio credentials are correct in `application.properties`
- ✅ Check phone numbers are in correct format (with country code)
- ✅ Ensure Twilio account has sufficient balance

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/login` | No | Officer login |
| GET | `/api/v1/categories` | No | Get fine categories |
| GET | `/api/v1/fines/lookup` | No | Lookup fine by reference |
| POST | `/api/v1/payments/initiate` | No | Initiate payment |
| POST | `/api/v1/payments/confirm` | No | Confirm payment |
| GET | `/api/v1/admin/dashboard` | Yes (ADMIN) | Dashboard stats |
| GET | `/api/v1/admin/officers` | Yes (ADMIN) | List officers |
| POST | `/api/v1/admin/officers` | Yes (ADMIN) | Create officer |

---

## Next Steps
1. ✅ Configure Firebase and environment variables
2. ✅ Run backend with `mvn spring-boot:run`
3. ✅ Start Admin Portal: `cd admin-portal && npm start`
4. ✅ Start Driver Portal: `cd driver-portal && npm start`
5. ✅ Test all APIs in Postman
6. ✅ Deploy to production server
