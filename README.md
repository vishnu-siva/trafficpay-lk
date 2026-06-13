# TrafficPay LK — Digital Traffic Fine Payment System

> A full-stack platform for the Sri Lanka Police Department to modernize traffic fine collection through a mobile app, web portals, and automated SMS notifications.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Team](#team)

---

## Overview

TrafficPay LK aligns with Sri Lanka's national digitalization policy by eliminating inefficiencies in the traditional traffic fine settlement process.

**How it works:**
1. A traffic officer stops a driver and issues a fine sheet with a **unique reference number** and **fine category ID**
2. The driver pays immediately via the **Android mobile app**
3. If not paid on-the-spot, the driver pays later via the **driver web portal**
4. On successful payment, an **SMS is sent to the officer** - the driver retrieves their licence

Senior officials monitor all collections nationwide via the **admin web portal**.

---

## Features

| Feature | Description |
|---|---|
| On-the-Spot Payment | Android app payment using fine reference number and category ID |
| Online Payment Portal | React SPA for deferred fine payments |
| Admin Dashboard | District-wise and category-wise collection statistics |
| SMS Notification | Twilio SMS to the officer on payment confirmation |
| JWT Authentication | Stateless token-based auth via Spring Security |
| Officer Management | Admin creates and manages officer accounts |
| Fine Categories | Configurable fine types and amounts |
| Role-Based Access | Separate roles for ADMIN and OFFICER |

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │  Driver Portal  │    │  Admin Portal   │
│   (Kotlin)      │    │  (React + Vite) │    │  (React + Vite) │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │  REST API (JWT Auth)
                    ┌───────────▼───────────┐
                    │   Spring Boot 3.2     │
                    │   Backend REST API    │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │ Spring Security │  │
                    │  │   JWT Filter    │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
               ┌────────────────┼─────────────────┐
               │                │                 │
    ┌──────────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
    │    Firebase     │  │   Twilio    │  │  Fine/Payment│
    │   Firestore     │  │  SMS API    │  │   Analytics  │
    └─────────────────┘  └─────────────┘  └──────────────┘
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 3.2.0 | REST API framework |
| Spring Security | - | Authentication & authorization |
| JJWT | 0.12.3 | JWT token generation & validation |
| Firebase Admin SDK | 9.2.0 | Firestore database access |
| Twilio SDK | 9.14.0 | SMS notifications |
| Lombok | 1.18.38 | Boilerplate reduction |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | Admin portal & driver portal SPA |
| Tailwind CSS | Utility-first styling |
| Context API | State management |
| i18n | Multi-language support (driver portal) |

### Mobile
| Technology | Purpose |
|---|---|
| Android (Kotlin) | Native Android app |
| Gradle | Build system |
| Flutter | Alternative mobile variant |

### Infrastructure
| Technology | Purpose |
|---|---|
| Firebase Firestore | NoSQL cloud database |
| Twilio | SMS gateway |

---

## Project Structure

```
trafficpay-lk/
│
├── backend/                        # Spring Boot REST API
│   └── src/main/java/com/trafficpay/
│       ├── config/                 # Firebase & Security config
│       ├── controller/             # REST controllers
│       │   ├── AuthController.java
│       │   ├── FineController.java
│       │   ├── PaymentController.java
│       │   └── AdminController.java
│       ├── dto/                    # Request & response DTOs
│       ├── model/                  # Domain models
│       │   ├── Fine.java
│       │   ├── FineCategory.java
│       │   ├── Payment.java
│       │   └── User.java
│       ├── repository/             # Firestore repositories
│       ├── security/               # JWT filter & utilities
│       └── service/                # Business logic
│
├── admin-portal/                   # React admin dashboard
│   └── src/
│       ├── pages/                  # Dashboard, login, reports
│       ├── components/             # Reusable UI components
│       ├── api/                    # API client
│       └── context/                # Auth context
│
├── driver-portal/                  # React driver payment portal
│   └── src/
│       ├── pages/                  # Payment, confirmation
│       ├── components/
│       ├── api/
│       └── utils/
│
├── mobile-app/                     # Android (Kotlin) app
└── mobile_app_flutter/             # Flutter variant
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Android Studio (for mobile app)
- Firebase project with Firestore enabled
- Twilio account (for SMS)

### 1. Backend

```bash
cd backend

# Add your Firebase service account key
# Place firebase-service-account.json in src/main/resources/

# Configure application.properties
# Set twilio.account-sid, twilio.auth-token, twilio.phone-number

mvn spring-boot:run
```

The API runs on `http://localhost:8080`

### 2. Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

Runs on `http://localhost:5173`

### 3. Driver Portal

```bash
cd driver-portal
npm install
npm run dev
```

Runs on `http://localhost:5174`

### 4. Android App

Open `mobile-app/` in Android Studio and run on an emulator or device.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT token |

### Fines
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/fines/issue` | Issue a new fine (Officer) |
| GET | `/api/fines/{referenceNumber}` | Look up a fine by reference |
| GET | `/api/fines/categories` | Get all fine categories |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/initiate` | Initiate a payment |
| POST | `/api/payments/confirm` | Confirm payment & trigger SMS |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard summary stats |
| GET | `/api/admin/stats/districts` | District-wise collections |
| GET | `/api/admin/stats/categories` | Category-wise breakdown |
| POST | `/api/admin/officers` | Create a new officer account |
| GET | `/api/admin/officers` | List all officers |

> All endpoints except `/api/auth/login` require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Team

| Name |
|---|---|
| Vishnuha Sivanandarajah 
| Srivaxshana Murugavel 
| Suwaathmi Ravindran 
| Thurga Rajinathan 

**Module:** Software Architecture  

