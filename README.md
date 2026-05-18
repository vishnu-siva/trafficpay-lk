# TrafficPay LK — Traffic Fine Payment System

Sri Lanka Police Department digital traffic fine payment system.

---

## Project Structure

```
trafficpay-lk/
├── backend/              Spring Boot REST API (Java 17, port 8080)
├── admin-portal/         React admin dashboard (port 5173)
├── driver-portal/        React driver SPA (port 5174)
└── mobile_app_flutter/   Official Android mobile app (Flutter)
```

> **Official mobile app:** `mobile_app_flutter/` (Flutter).
> This is the submission for the Android mobile application requirement.

---

## Architecture

```
Admin Portal (React)     Driver Portal (React)     Mobile App (Flutter)
       |                        |                         |
       └────────────────────────┼─────────────────────────┘
                                |
                     Spring Boot Backend (8080)
                                |
              ┌─────────────────┼──────────────┐
              │                 │              │
         Firestore           Twilio         JWT Auth
         Database            SMS
```

**Authentication:** JWT tokens via Spring Security  
**Database:** Firebase Cloud Firestore  
**SMS:** Twilio (simulation mode when credentials not set)

---

## Quick Start

### 1. Backend

```bash
cd backend

# Place firebase-service-account.json in:
# src/main/resources/firebase-service-account.json
# (see FIREBASE_SETUP.md for instructions)

mvn spring-boot:run
# Runs on http://localhost:8080
```

**Default credentials (seeded automatically):**

| Badge    | Password | Role    |
|----------|----------|---------|
| ADMIN001 | admin123 | ADMIN   |
| OFF001   | off123   | OFFICER |

### 2. Admin Portal

```bash
cd admin-portal
npm install
npm run dev
# Opens at http://localhost:5173
```

Login with `ADMIN001 / admin123`.

### 3. Driver Portal

```bash
cd driver-portal
npm install
npm run dev
# Opens at http://localhost:5174
```

### 4. Mobile App (Flutter)

```bash
cd mobile_app_flutter
flutter pub get
flutter run
```

Requires a connected Android device or emulator.

---

## SMS Notifications

The SMS service uses Twilio. Without real credentials, it runs in **simulation mode** — SMS content is printed to the backend console log with the prefix `[SMS SIMULATION]`.

To enable real SMS:
```bash
# Set environment variables before starting the backend
export TWILIO_ACCOUNT_SID=your_account_sid
export TWILIO_AUTH_TOKEN=your_auth_token
export TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

Get free credentials at [twilio.com](https://www.twilio.com/try-twilio).

---

## Firebase Setup

The backend requires a `firebase-service-account.json` file.
See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for step-by-step instructions.

---

## Architecture Note — Database Choice

The specification recommends JPA. This project uses **Firebase Firestore** instead because:
- The mobile app (Flutter) and web portals use Firebase natively
- Firestore provides real-time sync across all clients without additional infrastructure
- All repository classes follow the Repository pattern — they can be swapped for JPA repositories without changing service layer code

The Repository pattern is fully applied: `UserRepository`, `FineRepository`, `FineCategoryRepository`, `PaymentRepository`.

---

## Full Setup

See [GETTING_STARTED.md](GETTING_STARTED.md) for the complete step-by-step guide.
