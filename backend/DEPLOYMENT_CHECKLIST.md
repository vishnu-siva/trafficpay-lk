# TrafficPay Backend - Deployment & Configuration Checklist

## Pre-Deployment Checklist

### ✅ Firebase Setup
- [ ] Firebase project created
- [ ] Firestore database enabled (production mode)
- [ ] Service account key generated and saved as `firebase-service-account.json`
- [ ] File placed in: `backend/src/main/resources/firebase-service-account.json`
- [ ] File is in `.gitignore` (don't commit secrets!)

### ✅ Environment Variables
- [ ] `JWT_SECRET` set to a strong random string (minimum 32 characters)
- [ ] `TWILIO_ACCOUNT_SID` obtained from Twilio Console
- [ ] `TWILIO_AUTH_TOKEN` obtained from Twilio Console
- [ ] `TWILIO_PHONE_NUMBER` purchased/verified in Twilio
- [ ] Export variables: `source ~/.zshrc` (macOS/Linux)

### ✅ Dependencies
- [ ] Java 17 installed: `java -version`
- [ ] Maven 3.8+ installed: `mvn -version`
- [ ] All Maven dependencies downloaded: `mvn clean install`

### ✅ Build & Test
- [ ] Backend builds successfully: `mvn clean package`
- [ ] No compilation errors
- [ ] No security warnings in dependencies

### ✅ Local Testing
- [ ] Backend starts: `mvn spring-boot:run`
- [ ] Server listens on port 8080
- [ ] Test categories endpoint: `curl http://localhost:8080/api/v1/categories`
- [ ] Test login: admin/admin123 (initial credentials)

---

## Quick Start Guide

### 1. First Time Setup
```bash
# Navigate to backend directory
cd backend

# Create .env file from template
cp .env.example .env

# Edit .env and add your Firebase service account path and Twilio credentials
nano .env

# Export environment variables
export JWT_SECRET="your_strong_secret_here"
export TWILIO_ACCOUNT_SID="ACxxxxxxxxxx"
export TWILIO_AUTH_TOKEN="your_token"
export TWILIO_PHONE_NUMBER="+94112345678"

# Build project
mvn clean install
```

### 2. Run Backend
```bash
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using JAR file (after building)
java -jar target/trafficpay-backend-0.0.1-SNAPSHOT.jar

# Backend will start on http://localhost:8080
```

### 3. Verify Backend is Running
```bash
# Test health check
curl http://localhost:8080/api/v1/categories

# Expected response (200 OK)
# Should return list of fine categories
```

### 4. Login Test
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "badgeNumber": "ADMIN001",
    "password": "admin123"
  }'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "badgeNumber": "ADMIN001",
#   "role": "ADMIN"
# }
```

---

## API Port Configuration

| Component | Port | URL |
|-----------|------|-----|
| Backend API | 8080 | http://localhost:8080 |
| Admin Portal | 5173 | http://localhost:5173 |
| Driver Portal | 5174 | http://localhost:5174 |

---

## Initial Login Credentials

The `DataInitializer` creates these default users on first run:

| Role | Badge | Password | Purpose |
|------|-------|----------|---------|
| ADMIN | ADMIN001 | admin123 | System administration |
| OFFICER | OFF001 | off123 | Traffic officer |

**⚠️ Important:** Change these credentials before production deployment!

---

## Key Firestore Collections

The backend automatically creates these collections:

### `users`
- Admin officers and police officers
- Fields: `badgeNumber`, `fullName`, `password`, `district`, `station`, `phoneNumber`, `role`, `createdAt`

### `fines`
- Traffic fine records
- Fields: `referenceNumber`, `categoryId`, `vehicleNumber`, `driverName`, `amount`, `status`, `district`, `createdAt`

### `fine_categories`
- Fine types and amounts
- Fields: `name`, `amount`, `description`, `trafficLaw`

### `payments`
- Payment transactions
- Fields: `fineId`, `amount`, `status`, `paymentMethod`, `transactionId`, `paymentDate`, `createdAt`

---

## Troubleshooting

### Issue: "Cannot find Firebase service account"
**Solution:**
```bash
# Copy your service account JSON to correct location
cp /path/to/firebase-key.json backend/src/main/resources/firebase-service-account.json

# Rebuild the project
mvn clean package
```

### Issue: "JWT token expired"
**Solution:**
- Default token expiration is 24 hours (86400000 ms)
- Change in `application.properties`: `app.jwt.expiration=86400000`

### Issue: "CORS error when calling from frontend"
**Solution:**
- Check frontend port is in CORS allowed origins in `SecurityConfig.java`
- Add your frontend URL:
```java
config.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://your-domain.com"
));
```

### Issue: "SMS not sending from Twilio"
**Solution:**
- Verify Twilio credentials are correct
- Check phone number format includes country code (+94 for Sri Lanka)
- Ensure Twilio account has sufficient balance
- Check SMS service logs: search for "SMS" in backend logs

---

## Security Best Practices

### 🔒 Before Production:

1. **Generate Strong JWT Secret**
   ```bash
   openssl rand -base64 32
   # Save output as JWT_SECRET
   ```

2. **Rotate Default Credentials**
   - Change admin123 and off123 passwords
   - Create new admin users
   - Delete sample officers

3. **Enable HTTPS**
   - Configure SSL certificate
   - Update CORS allowed origins to use `https://`

4. **Secure Environment Variables**
   - Use AWS Secrets Manager, Azure Key Vault, or similar
   - Never commit `.env` files to Git
   - Ensure `.env` is in `.gitignore`

5. **Rate Limiting**
   - Implement rate limiting for login endpoint
   - Consider using Spring Security's rate limiting features

6. **Logging & Monitoring**
   - Monitor failed login attempts
   - Log all payment transactions
   - Set up alerts for errors

---

## Production Deployment

### AWS Deployment Example:
```bash
# Build JAR
mvn clean package

# Set environment variables in AWS Systems Manager Parameter Store
# Or in AWS Secrets Manager

# Deploy to EC2/ECS/App Runner
# Ensure port 8080 is exposed
# Use ALB/NLB for load balancing
```

### Docker Deployment:
```dockerfile
FROM openjdk:17-slim
COPY target/trafficpay-backend-0.0.1-SNAPSHOT.jar app.jar
ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs/firestore
- **Spring Boot Guide:** https://spring.io/projects/spring-boot
- **JWT Documentation:** https://tools.ietf.org/html/rfc7519
- **Twilio Documentation:** https://www.twilio.com/docs/sms

---

## Next Steps

1. ✅ Complete pre-deployment checklist
2. ✅ Run backend locally and test
3. ✅ Connect Admin Portal and test APIs
4. ✅ Connect Driver Portal and test payment flow
5. ✅ Deploy to staging environment
6. ✅ Conduct user acceptance testing
7. ✅ Deploy to production
