# Pre-Viva Checklist

Run through this before the viva session.

---

## 1. Firebase Setup (do this first)

- [ ] `firebase-service-account.json` placed at `backend/src/main/resources/firebase-service-account.json`
- [ ] Backend starts without errors (`mvn spring-boot:run`)
- [ ] Console shows: `Data initialization complete. Admin user ready.`

---

## 2. All Services Running

Open 4 terminals and run simultaneously:

```bash
# Terminal 1
cd backend && mvn spring-boot:run          # http://localhost:8080

# Terminal 2
cd admin-portal && npm run dev             # http://localhost:5173

# Terminal 3
cd driver-portal && npm run dev            # http://localhost:5174

# Terminal 4 (mobile — optional, needs Android device/emulator)
cd mobile_app_flutter && flutter run
```

- [ ] Backend running on port 8080
- [ ] Admin portal running on port 5173
- [ ] Driver portal running on port 5174
- [ ] Mobile app running on device/emulator

---

## 3. End-to-End Flow Test

Run through the full flow before the viva:

### Step A — Officer issues a fine (Mobile App or backend direct)

- [ ] Login as officer: badge `OFF001`, password `off123`
- [ ] Issue a fine with a vehicle number (e.g., `ABC-1234`) and category
- [ ] Note the **reference number** generated

### Step B — Driver pays via web portal

- [ ] Open driver portal at `http://localhost:5174`
- [ ] Enter the reference number from Step A
- [ ] Complete the payment flow
- [ ] Confirm payment success page appears

### Step C — SMS notification logged

- [ ] Check backend console for `[SMS SIMULATION]` log line
- [ ] It should show: officer phone, reference number, vehicle, amount

### Step D — Admin sees the data

- [ ] Open admin portal at `http://localhost:5173`
- [ ] Login: `ADMIN001 / admin123`
- [ ] Check dashboard — collection stats updated
- [ ] Check district-wise and category breakdowns

---

## 4. Feature Checklist (per project spec)

- [ ] Android app to pay traffic fines on the spot — Flutter app (`mobile_app_flutter/`)
- [ ] Single page web app to pay fine online — Driver portal (`driver-portal/`)
- [ ] Admin web portal to monitor collections — Admin portal (`admin-portal/`)
- [ ] SMS notification upon payment confirmation — `SmsService.java` (simulation mode)
- [ ] JWT authentication — `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`
- [ ] District-wise stats — Admin dashboard charts
- [ ] Category-wise stats — Admin dashboard charts

---

## 5. Viva Talking Points

### Why Firestore instead of JPA?

> "The spec says *try to use JPA* — not *must use*. We chose Firebase Firestore because it gives us real-time sync across the mobile app, admin portal, and driver portal without extra infrastructure. We still applied the Repository pattern — `UserRepository`, `FineRepository`, `FineCategoryRepository`, `PaymentRepository` — so the service layer is database-agnostic and swappable."

### Why is SMS not sending real messages?

> "Twilio requires a paid account and a registered phone number. We built the full integration — `SmsService.java` uses the Twilio SDK and sends a formatted message to the officer's phone. In demo mode it logs to the console so you can see the exact SMS content. To enable real SMS: set the three environment variables `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`."

### Why only one mobile app?

> "We have one mobile app — `mobile_app_flutter/` built with Flutter. It covers officer login, issue fine, driver login, pay fine, my fines, and payment success screens."

### Which database?

> "Firebase Cloud Firestore — collections: `users`, `fines`, `fine_categories`, `payments`."

### How does auth work?

> "Officers and admins log in via the Spring Boot backend. It validates credentials against Firestore and returns a JWT token. That token is passed as a Bearer header on all protected API calls. Spring Security's filter chain validates it on every request."

---

## 6. Git — Final Commit Before Viva

```bash
git add -A
git commit -m "Pre-viva cleanup: remove Kotlin app, improve SMS logging, add setup docs"
git push origin main
```

- [ ] All commits pushed to main branch
- [ ] No uncommitted changes
