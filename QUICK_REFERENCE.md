# 🎯 TrafficPay Backend - Quick Reference Card

## 📌 What Was Done

✅ Configured Firebase Firestore database  
✅ Updated Spring Boot configuration  
✅ Set up JWT authentication  
✅ Configured environment variables  
✅ Created comprehensive documentation  
✅ Set up Twilio SMS integration  
✅ Configured CORS for React portals  
✅ Created Postman collection for testing  

---

## 🚀 To Get Started (5 Steps)

### 1️⃣ Firebase Setup
```bash
# Go to https://console.firebase.google.com
# Create project: trafficpay-lk
# Enable Firestore Database
# Generate service account key
# Download JSON file
```

### 2️⃣ Place Service Account
```bash
cp ~/Downloads/firebase-key.json \
   backend/src/main/resources/firebase-service-account.json
```

### 3️⃣ Set Environment Variables
```bash
export JWT_SECRET="trafficPaySecretKey2026..."
export JWT_EXPIRATION="86400000"
```

### 4️⃣ Build Backend
```bash
cd backend
mvn clean install
```

### 5️⃣ Run Backend
```bash
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

---

## 🧪 Quick Test

```bash
# Test 1: Get categories
curl http://localhost:8080/api/v1/categories

# Test 2: Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"badgeNumber": "ADMIN001", "password": "admin123"}'

# Test 3: Get token and use it
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"badgeNumber": "ADMIN001", "password": "admin123"}' \
  | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/admin/dashboard
```

---

## 🗂️ Documentation Files Created

### Root Directory
```
GETTING_STARTED.md          ← Start here! (Main guide)
SETUP_SUMMARY.md            ← Summary report
```

### Backend Directory
```
README.md                   ← Quick start
BACKEND_SETUP_GUIDE.md      ← Detailed setup
DEPLOYMENT_CHECKLIST.md     ← Production ready
API_REFERENCE.md            ← API documentation
.env.example                ← Environment template
TrafficPay-Backend-API.postman_collection.json ← Postman tests
```

---

## 🔑 Initial Credentials

| User | Badge | Password |
|------|-------|----------|
| Admin | ADMIN001 | admin123 |
| Officer | OFF001 | off123 |

⚠️ Change before production!

---

## 🌐 System URLs

| Component | URL |
|-----------|-----|
| Backend API | http://localhost:8080/api/v1 |
| Admin Portal | http://localhost:5173 |
| Driver Portal | http://localhost:5174 |

---

## 📊 API Endpoints (Most Used)

```
Public Endpoints:
GET  /categories                    - Get fine types
GET  /fines/lookup                 - Look up fine
POST /payments/initiate            - Start payment
POST /payments/confirm             - Confirm payment
POST /auth/login                   - Officer login

Admin Endpoints (needs ADMIN role):
GET  /admin/dashboard              - Statistics
GET  /admin/officers               - List officers
POST /admin/officers               - Create officer
GET  /admin/fines                  - All fines
```

---

## 🔧 Configuration

### application.properties
Located at: `backend/src/main/resources/application.properties`

Supports environment variables:
```properties
JWT_SECRET=...
JWT_EXPIRATION=86400000
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Firebase file not found | Copy JSON to `backend/src/main/resources/` |
| Port 8080 in use | `lsof -i :8080` and `kill -9 <PID>` |
| Maven not found | Install Maven 3.8+ |
| JWT errors | Verify JWT_SECRET is exported |
| CORS errors | Check frontend port in SecurityConfig |

---

## 📚 Key Files Modified

| File | Changes |
|------|---------|
| application.properties | Added env vars, comments |
| .env.example | Created template |
| (Others) | Created new documentation files |

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Service account JSON downloaded
- [ ] Placed in `backend/src/main/resources/`
- [ ] Environment variables set
- [ ] Maven installed (3.8+)
- [ ] Java 17+ installed
- [ ] Backend builds: `mvn clean install`
- [ ] Backend runs: `mvn spring-boot:run`
- [ ] Test endpoint works: `curl http://localhost:8080/api/v1/categories`
- [ ] Login works and returns token
- [ ] Read GETTING_STARTED.md

---

## 📞 Support Docs

| Need | Read |
|------|------|
| Step-by-step setup | GETTING_STARTED.md |
| Detailed configuration | backend/README.md |
| All API endpoints | backend/API_REFERENCE.md |
| Before deploying | backend/DEPLOYMENT_CHECKLIST.md |
| Test with Postman | Import .postman_collection.json |

---

## 🎯 Next Actions

1. **NOW:** Read `GETTING_STARTED.md` (12 min read)
2. **THEN:** Set up Firebase (5 min)
3. **THEN:** Run backend (2 min)
4. **THEN:** Test with provided Postman collection
5. **FINALLY:** Integrate with Admin/Driver portals

---

## 🎓 Quick Troubleshooting

```bash
# Check Java
java -version          # Should be 17+

# Check Maven
mvn -version          # Should be 3.8+

# Check Firebase file
ls backend/src/main/resources/firebase-service-account.json

# Clean build
cd backend && mvn clean install

# Run with debug
mvn spring-boot:run -X

# Check if running
curl http://localhost:8080/api/v1/categories
```

---

## 🔐 Security Notes

✅ JWT tokens expire in 24 hours  
✅ Passwords hashed with BCrypt  
✅ CORS configured for specific origins  
✅ Credentials not stored in Git  
✅ Role-based access control enabled  

⚠️ Before Production:
- Change default passwords
- Generate new JWT_SECRET
- Enable HTTPS
- Use secrets manager for credentials

---

## 📱 Portals Integration

### Admin Portal (React)
- Base URL: `http://localhost:8080/api/v1`
- Login with: ADMIN001 / admin123
- View: Dashboard, Officers, Fines

### Driver Portal (React)
- Base URL: `http://localhost:8080/api/v1`
- Features: Fine lookup, Payment
- No login required

---

**Status:** ✅ Ready for Development!

**Questions?** Check the comprehensive docs in backend folder.

**Ready to deploy?** Follow DEPLOYMENT_CHECKLIST.md

---

*Last Updated: May 9, 2026*
