# Firebase Setup — Getting the Service Account Key

The backend needs a `firebase-service-account.json` file to connect to Firestore.
This file is excluded from the repository for security. Follow these steps to get it.

---

## Option A: Use the Existing Firebase Project (Recommended for evaluators)

Contact the project team for the `firebase-service-account.json` file.
Place it at:

```
backend/src/main/resources/firebase-service-account.json
```

Then run the backend normally:

```bash
cd backend
mvn spring-boot:run
```

---

## Option B: Create Your Own Firebase Project (Full setup)

### Step 1 — Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it `trafficpay-lk`
4. Skip Analytics → **Create project**

### Step 2 — Enable Firestore

1. Left menu → **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Region: **asia-southeast1** (closest to Sri Lanka)
5. Click **Enable**

### Step 3 — Download Service Account Key

1. Click the gear icon (**Project Settings**) top-left
2. Go to the **Service accounts** tab
3. Click **Generate new private key**
4. A JSON file downloads — this is your `firebase-service-account.json`

### Step 4 — Place the File

```bash
# From the project root:
cp ~/Downloads/trafficpay-lk-firebase-adminsdk-*.json \
   backend/src/main/resources/firebase-service-account.json
```

### Step 5 — Update Firebase Config in Portals

If using your own project, update the Firebase config in:
- `admin-portal/src/firebase.js`
- `driver-portal/src/firebase.js`
- `mobile_app_flutter/lib/firebase_options.dart`

Replace with the config from Firebase Console → Project Settings → Your apps → Web app config.

### Step 6 — Set Firestore Security Rules

In Firebase Console → Firestore → Rules, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For development only
    }
  }
}
```

### Step 7 — Start Everything

```bash
# Terminal 1 - Backend
cd backend && mvn spring-boot:run

# Terminal 2 - Admin Portal
cd admin-portal && npm install && npm run dev

# Terminal 3 - Driver Portal
cd driver-portal && npm install && npm run dev

# Terminal 4 - Mobile App (optional, needs Android device/emulator)
cd mobile_app_flutter && flutter pub get && flutter run
```

---

## Verifying the Connection

When the backend starts successfully you should see:

```
Started TrafficPayApplication in X.XXX seconds
Data initialization complete. Admin user ready.
```

If you see a Firebase error, double-check that the JSON file is at the correct path.
