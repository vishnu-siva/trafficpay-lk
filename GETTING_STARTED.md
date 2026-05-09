# 🚀 TrafficPay - Complete Setup Guide

Welcome to the TrafficPay Backend Setup Guide! This document will walk you through configuring Firebase, Spring Boot, and getting the entire system running.

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   TRAFFIC PAY SYSTEM                     │
├──────────────────────┬──────────────────┬───────────────┤
│   Admin Portal       │  Driver Portal   │   Mobile App  │
│   (React - 5173)     │  (React - 5174)  │   (Android)   │
└──────────────┬───────┴────────┬─────────┴───────┬────────┘
               │                │                 │
               └────────────────┼─────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  Spring Boot Backend   │
                    │   (Java 17 - 8080)     │
                    └───────────┬────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼─────┐  ┌────▼──────┐  ┌─────▼────┐
        │  Firestore  │  │ Twilio    │  │   JWT    │
        │  Database   │  │    SMS    │  │   Auth   │
        └─────────────┘  └───────────┘  └──────────┘
```

---

## ✅ Prerequisites Checklist

Before you start, ensure you have:

- [ ] Java 17+ installed
- [ ] Maven 3.8+ installed  
- [ ] Git installed
- [ ] Google Firebase account (free)
- [ ] Twilio account (optional, for SMS)
- [ ] Internet connection

### Install Required Tools

**macOS:**
```bash
# Using Homebrew
brew install java17
brew install maven
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk maven git
```

**Windows:**
Download installers from:
- Java: https://www.oracle.com/java/technologies/downloads/
- Maven: https://maven.apache.org/download.cgi
- Git: https://git-scm.com/download

---

## 🔥 Step 1: Firebase Setup (5 minutes)

### 1.1 Create Firebase Project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter name: **`trafficpay-lk`**
4. Click **"Continue"**
5. Skip Analytics (or enable if needed)
6. Create project

### 1.2 Enable Firestore

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose **"asia-southeast1"** (closest to Sri Lanka)
5. Click **"Enable"**

✅ **Firestore is now ready!**

### 1.3 Download Service Account Key

1. Click **⚙️ Project Settings** (top left)
2. Go to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. JSON file will download

### 1.4 Place Service Account File

```bash
# Copy the downloaded JSON file
cp ~/Downloads/trafficpay-lk-firebase-adminsdk-*.json \
   backend/src/main/resources/firebase-service-account.json

# Verify it's there
ls -la backend/src/main/resources/firebase-service-account.json
```

### 1.5 Add to .gitignore

```bash
# This prevents accidentally committing secrets!
echo "backend/src/main/resources/firebase-service-account.json" >> .gitignore
git add .gitignore
git commit -m "Add Firebase credentials to gitignore"
```

✅ **Firebase Setup Complete!**

---

## 🔐 Step 2: Configure Environment Variables (3 minutes)

### Option A: macOS/Linux Environment Variables

```bash
# Open shell configuration
nano ~/.zshrc    # macOS with M1/M2/M3
# OR
nano ~/.bashrc   # Linux

# Add at the end:
export JWT_SECRET="trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF"
export JWT_EXPIRATION="86400000"
export TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
export TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
export TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER"

# Save and reload
source ~/.zshrc   # or ~/.bashrc
```

### Option B: Set in IDE (VS Code)

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Spring Boot",
      "type": "java",
      "name": "Spring Boot App",
      "request": "launch",
      "mainClass": "com.trafficpay.TrafficPayApplication",
      "env": {
        "JWT_SECRET": "trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF",
        "JWT_EXPIRATION": "86400000"
      }
    }
  ]
}
```

✅ **Environment Variables Set!**

---

## 🏗️ Step 3: Build & Run Backend (2 minutes)

### Build Project

```bash
cd backend
mvn clean install
```

**Expected:**
```
[INFO] BUILD SUCCESS
```

### Run Backend

```bash
mvn spring-boot:run
```

**Expected:**
```
Tomcat started on port(s): 8080
Started TrafficPayApplication
```

✅ **Backend is Running!**

---

## ✨ Step 4: Test Backend (2 minutes)

### Test 1: Get Categories
```bash
curl http://localhost:8080/api/v1/categories
```

### Test 2: Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "badgeNumber": "ADMIN001",
    "password": "admin123"
  }'
```

Expected response with JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "badgeNumber": "ADMIN001",
  "role": "ADMIN"
}
```

### Test 3: Use Token (Copy from Test 2)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/v1/admin/dashboard
```

✅ **Backend Verified!**

---

## 🎨 Step 5: Setup Admin Portal

### Build Admin Portal

```bash
cd admin-portal
npm install
```

### Configure API URL

Edit `admin-portal/src/api/adminApi.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### Run Admin Portal

```bash
npm start
# Runs on http://localhost:5173
```

✅ **Admin Portal Running!**

---

## 🚗 Step 6: Setup Driver Portal

### Build Driver Portal

```bash
cd driver-portal
npm install
```

### Configure API URL

Edit `driver-portal/src/api/fineApi.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### Run Driver Portal

```bash
npm start
# Runs on http://localhost:5174
```

✅ **Driver Portal Running!**

---

## 🔗 Access the System

| Component | URL | Credentials |
|-----------|-----|-------------|
| Backend API | http://localhost:8080 | - |
| Admin Portal | http://localhost:5173 | ADMIN001 / admin123 |
| Driver Portal | http://localhost:5174 | Open access |

---

## 📱 Initial Users

Created automatically by `DataInitializer`:

### Admin
- **Badge:** ADMIN001
- **Password:** admin123
- **Role:** ADMIN (full access)

### Officer  
- **Badge:** OFF001
- **Password:** off123
- **Role:** OFFICER (can issue fines)

⚠️ **Change these passwords before production!**

---

## 📚 Documentation Files

Navigate to backend folder:
- **README.md** - Quick start guide
- **BACKEND_SETUP_GUIDE.md** - Detailed setup
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment tasks
- **API_REFERENCE.md** - Complete API documentation
- **.env.example** - Environment variables template
- **TrafficPay-Backend-API.postman_collection.json** - Postman collection

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. **File** → **Import**
3. Select: `backend/TrafficPay-Backend-API.postman_collection.json`
4. Set variables:
   - `base_url`: `http://localhost:8080/api/v1`
   - `token`: (will be set after login)

### Test Sequence

1. Run **"Admin Login"** (sets token variable)
2. Run **"Get Dashboard Summary"**
3. Run **"Get All Officers"**
4. Run other endpoints

---

## 🐛 Troubleshooting

### Issue: Firebase Service Account Not Found

```
IOException: File not found: classpath:firebase-service-account.json
```

**Fix:**
```bash
ls backend/src/main/resources/firebase-service-account.json
# If not there, copy it:
cp ~/Downloads/trafficpay-lk-firebase-adminsdk-*.json \
   backend/src/main/resources/firebase-service-account.json
```

### Issue: Port 8080 Already in Use

```bash
# Kill process using port 8080
lsof -i :8080
kill -9 <PID>

# Or use different port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Issue: CORS Error from Frontend

**Solution:** Ensure frontend URL is in CORS allowed origins in `SecurityConfig.java`

---

## 📞 API Endpoints Summary

### Public Endpoints (No Auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/categories` | Get fine types |
| GET | `/fines/lookup` | Look up fine |
| POST | `/payments/initiate` | Start payment |
| POST | `/payments/confirm` | Confirm payment |
| POST | `/auth/login` | Officer login |

### Admin Endpoints (ADMIN Role)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/dashboard` | Statistics |
| GET | `/admin/officers` | List officers |
| POST | `/admin/officers` | Create officer |
| GET | `/admin/fines` | All fines |

---

## 🚀 Next Steps

After successful setup:

1. ✅ Backend running on port 8080
2. ✅ Admin Portal running on port 5173
3. ✅ Driver Portal running on port 5174

### Test Full Workflow:
1. Log in to Admin Portal
2. View dashboard statistics
3. Go to Driver Portal
4. Look up a fine
5. Initiate and confirm payment
6. Check Admin Portal for updated statistics

---

## 📋 Checklist for Production

- [ ] Firebase project created and secured
- [ ] Service account key stored securely (not in Git)
- [ ] Strong JWT_SECRET generated (min 32 chars)
- [ ] Twilio credentials configured
- [ ] Default passwords changed
- [ ] HTTPS enabled
- [ ] CORS updated for production URLs
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] Monitoring/alerting configured

---

## 📚 Additional Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev
- **Twilio SMS:** https://www.twilio.com/docs/sms

---

## ❓ Need Help?

### Check These Files First:
1. Backend error logs: Look at terminal output
2. Frontend console: Press F12 in browser
3. Firebase Console: Check Firestore data
4. Network tab: Check API requests/responses

### Common Issues:
- Firebase credentials → Check `.gitignore` and path
- JWT errors → Verify JWT_SECRET matches everywhere
- CORS errors → Check allowed origins in SecurityConfig
- SMS not sending → Check Twilio credentials and account balance

---

## 🎉 You're All Set!

Your TrafficPay system is now ready for development and testing.

**Questions?** Refer to documentation files in the backend folder.

**Ready for production?** Follow the Deployment Checklist.

---

**Last Updated:** May 9, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Development
