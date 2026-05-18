package com.trafficpay.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    // Logs clearly at startup so evaluators can see SMS mode in the console
    @PostConstruct
    public void logSmsMode() {
        if (accountSid.startsWith("YOUR_")) {
            log.warn("=======================================================");
            log.warn("SMS SIMULATION MODE ACTIVE");
            log.warn("Twilio credentials not configured. SMS will be printed");
            log.warn("to the application log instead of sent to real phones.");
            log.warn("To enable real SMS: set TWILIO_ACCOUNT_SID,");
            log.warn("TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env variables.");
            log.warn("=======================================================");
        } else {
            log.info("SMS service ready. Twilio account: {}...{}",
                    accountSid.substring(0, 4),
                    accountSid.substring(accountSid.length() - 4));
        }
    }

    public void notifyOfficer(String officerPhone, String referenceNumber,
                              String vehicleNumber, String amount) {
        if (accountSid.startsWith("YOUR_")) {
            log.info("[SMS SIMULATION] To: {} | Fine: {} | Vehicle: {} | Amount: LKR {} | Message: Fine paid, release license.",
                    officerPhone, referenceNumber, vehicleNumber, amount);
            return;
        }
        try {
            Twilio.init(accountSid, authToken);
            String body = String.format(
                "TrafficPay LK: Fine %s for vehicle %s has been paid. Amount: LKR %s. You may release the driver's license.",
                referenceNumber, vehicleNumber, amount);
            Message message = Message.creator(new PhoneNumber(officerPhone), new PhoneNumber(fromNumber), body).create();
            log.info("SMS sent to officer {}. SID: {}", officerPhone, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", officerPhone, e.getMessage());
        }
    }
}
