# TrafficPay Backend - Configuration Setup

> 📌 **Quick Setup**: Follow steps 1-3 below to get the backend running locally in 10 minutes

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Build & Run](#build--run)
5. [Verify Installation](#verify-installation)
6. [Integration with Portals](#integration-with-portals)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Java 17+** - Download from [Oracle Java](https://www.oracle.com/java/technologies/downloads/#java17)
- **Maven 3.8+** - Download from [Maven](https://maven.apache.org/download.cgi)
- **Git** - For version control

### Accounts Required
- **Google Firebase** - Free tier available at https://firebase.google.com
- **Twilio** (Optional) - For SMS testing at https://www.twilio.com

### Verify Installation
```bash
java -version          # Should show Java 17+
mvn -version          # Should show Maven 3.8+
git --version         # Should show git version
```

---

## Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `trafficpay-lk`
4. Uncheck "Enable Google Analytics" (optional)
5. Click **"Create project"**
6. Wait for project creation to complete

### Step 2: Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose location: **asia-southeast1** (closest to Sri Lanka)
5. Click **"Enable"**

### Step 3: Download Service Account Key
1. Click the **⚙️ Settings icon** (top left)
2. Go to **Project Settings** → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Save the JSON file

### Step 4: Place Service Account File
```bash
# Move the downloaded JSON file to backend resources
cp ~/Downloads/trafficpay-lk-firebase-adminsdk-xxx.json \
   backend/src/main/resources/firebase-service-account.json

# Verify file exists
ls -la backend/src/main/resources/firebase-service-account.json
```

### Step 5: Add to .gitignore
```bash
# Edit .gitignore
echo "backend/src/main/resources/firebase-service-account.json" >> .gitignore
git add .gitignore
git commit -m "Add service account to gitignore"
```

---

## Environment Configuration

### Option 1: System Environment Variables (macOS/Linux)

#### Add to ~/.zshrc (macOS with M1/M2/M3):
```bash
# Open the file
nano ~/.zshrc

# Add these lines at the end:
export JWT_SECRET="trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF"
export JWT_EXPIRATION="86400000"
export TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
export TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
export TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER"

# Save (Ctrl+O → Enter → Ctrl+X)

# Reload
source ~/.zshrc
```

#### Add to ~/.bash_profile (macOS with Intel/Older versions):
```bash
nano ~/.bash_profile
# Add same exports as above
source ~/.bash_profile
```

#### Add to ~/.bashrc (Linux):
```bash
nano ~/.bashrc
# Add same exports as above
source ~/.bashrc
```

### Option 2: Create Local .env File (Alternative)

```bash
cd backend
cp .env.example .env
nano .env
```

Edit `.env`:
```properties
JWT_SECRET=trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF
JWT_EXPIRATION=86400000
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
```

**Note:** Don't commit `.env` to git!

### Option 3: Update application.properties Directly

Edit `backend/src/main/resources/application.properties`:
```properties
app.jwt.secret=trafficPaySecretKey2026ForJWTSigningVeryLongAndSecure123456789ABCDEF
app.jwt.expiration=86400000
twilio.account-sid=YOUR_TWILIO_ACCOUNT_SID
twilio.auth-token=YOUR_TWILIO_AUTH_TOKEN
twilio.phone-number=YOUR_TWILIO_PHONE_NUMBER
```

---

## Build & Run

### Step 1: Build Project
```bash
cd backend
mvn clean install
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXs
```

### Step 2: Run Backend
```bash
mvn spring-boot:run
```

**Expected Output:**
```
Tomcat started on port(s): 8080
Started TrafficPayApplication in X.XXX seconds
```

### Step 3: Backend is Running! 🎉
```
http://localhost:8080
```

---

## Verify Installation

### Test 1: Check Server Health
```bash
curl http://localhost:8080/api/v1/categories
```

**Expected Response:**
```json
[
  {
    "id": "CAT001",
    "name": "Speeding",
    "amount": 5000.00
  }
]
```

### Test 2: Test Admin Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "badgeNumber": "ADMIN001",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "badgeNumber": "ADMIN001",
  "role": "ADMIN"
}
```

### Test 3: Check Firestore Connection
Look for these logs in terminal:
```
Firebase initialized successfully
```

---

## Integration with Portals

### Admin Portal Configuration

Edit `admin-portal/src/api/adminApi.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';

export const adminApi = {
  // Dashboard
  dashboard: () => fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }),
  
  // Officers
  getOfficers: () => fetch(`${API_BASE_URL}/admin/officers`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }),
  
  // Fines
  getFines: () => fetch(`${API_BASE_URL}/admin/fines`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
};
```

### Driver Portal Configuration

Edit `driver-portal/src/api/fineApi.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';

export const fineApi = {
  // Lookup fine
  lookupFine: (refNo, categoryId) => fetch(
    `${API_BASE_URL}/fines/lookup?referenceNumber=${refNo}&categoryId=${categoryId}`
  ),
  
  // Initiate payment
  initiatePayment: (fineId, method, amount) => fetch(
    `${API_BASE_URL}/payments/initiate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fineId, paymentMethod: method, amount })
    }
  )
};
```

---

## Troubleshooting

### Issue: "Cannot find firebase-service-account.json"

**Error Message:**
```
IOException: File not found: classpath:firebase-service-account.json
```

**Solution:**
```bash
# Verify file location
ls -la backend/src/main/resources/firebase-service-account.json

# If missing, copy it:
cp ~/Downloads/trafficpay-lk-firebase-adminsdk-xxx.json \
   backend/src/main/resources/firebase-service-account.json

# Rebuild
mvn clean package
```

### Issue: "Connection refused" to Firebase

**Error Message:**
```
com.google.api.gax.rpc.UnavailableException: Service Unavailable
```

**Solution:**
1. Verify Firebase project exists and is accessible
2. Check internet connection
3. Verify service account has Firestore permissions
4. In Firebase Console: **Project Settings** → **Service Accounts** → Verify key is valid

### Issue: "JWT token validation failed"

**Error Message:**
```
JwtException: Unable to read the JSON...
```

**Solution:**
- Verify `JWT_SECRET` is set correctly
- Use same secret across all services
- Ensure secret is at least 32 characters

### Issue: "Port 8080 already in use"

**Error Message:**
```
Address already in use
```

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or use different port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Issue: "CORS error from frontend"

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Make sure backend is running on port 8080
2. Check frontend port is in CORS allowed origins
3. For testing, ensure you're accessing from allowed origin

---

## Additional Commands

### Clean Build
```bash
mvn clean install
```

### Run Tests
```bash
mvn test
```

### Build JAR for Production
```bash
mvn clean package -DskipTests
# JAR will be at: backend/target/trafficpay-backend-0.0.1-SNAPSHOT.jar
```

### View Application Logs
```bash
# Logs are printed to console during `mvn spring-boot:run`
# For file logging, add to application.properties:
logging.file.name=app.log
```

### Change Port
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

---

## Next Steps

1. ✅ Set up Firebase
2. ✅ Configure environment variables
3. ✅ Build and run backend
4. ✅ Test endpoints
5. 👉 **Run Admin Portal** - `cd admin-portal && npm start`
6. 👉 **Run Driver Portal** - `cd driver-portal && npm start`
7. 👉 Test full system integration

---

## Support & Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **JWT Guide:** https://jwt.io/introduction
- **Twilio SMS:** https://www.twilio.com/docs/sms

---

## File Structure

```
backend/
├── pom.xml                                    # Maven dependencies
├── src/
│   └── main/
│       ├── java/com/trafficpay/
│       │   ├── TrafficPayApplication.java    # Main entry point
│       │   ├── config/
│       │   │   ├── FirebaseConfig.java       # Firebase setup
│       │   │   └── SecurityConfig.java       # Spring Security + CORS
│       │   ├── controller/                   # REST API endpoints
│       │   ├── service/                      # Business logic
│       │   ├── model/                        # Data models
│       │   └── repository/                   # Firestore access
│       └── resources/
│           ├── application.properties        # Configuration
│           └── firebase-service-account.json # Firebase credentials
├── .env.example                              # Environment template
├── DEPLOYMENT_CHECKLIST.md                   # Pre-deployment checklist
├── API_REFERENCE.md                          # API documentation
└── README.md                                 # This file
```

---

**Status:** ✅ Backend Ready for Development!

Last Updated: May 9, 2026
