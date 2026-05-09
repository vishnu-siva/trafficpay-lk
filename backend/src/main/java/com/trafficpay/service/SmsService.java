package com.trafficpay.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
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

    public void notifyOfficer(String officerPhone, String referenceNumber,
                              String vehicleNumber, String amount) {
        if (accountSid.startsWith("YOUR_")) {
            log.info("SMS (mock) to {}: Fine {} for vehicle {} paid. Amount: LKR {}",
                    officerPhone, referenceNumber, vehicleNumber, amount);
            return;
        }
        try {
            Twilio.init(accountSid, authToken);
            String body = String.format(
                "TrafficPay LK: Fine %s for vehicle %s has been paid. Amount: LKR %s. You may release the driver's license.",
                referenceNumber, vehicleNumber, amount);
            Message.creator(new PhoneNumber(officerPhone), new PhoneNumber(fromNumber), body).create();
            log.info("SMS sent to officer {}", officerPhone);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", officerPhone, e.getMessage());
        }
    }
}
