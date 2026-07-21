package com.luxesuite.api.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    private boolean isTwilioEnabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            isTwilioEnabled = true;
            log.info("Twilio SMS Service initialized.");
        } else {
            log.warn("Twilio credentials missing. SMS Service will fallback to logging.");
        }
    }

    @Async("taskExecutor")
    public void sendSms(String toPhone, String body) {
        if (!isTwilioEnabled) {
            log.warn("Twilio is not configured. Mock sending SMS to {}: {}", toPhone, body);
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromPhoneNumber),
                    body
            ).create();
            log.info("SMS sent successfully to {}. SID: {}", toPhone, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}", toPhone, e);
            throw new RuntimeException("SMS delivery failed", e);
        }
    }
}
