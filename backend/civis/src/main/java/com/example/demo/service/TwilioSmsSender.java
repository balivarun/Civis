package com.example.demo.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class TwilioSmsSender implements SmsSender {

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private volatile boolean initialized;

    public TwilioSmsSender(
            @Value("${app.sms.twilio.account-sid:}") String accountSid,
            @Value("${app.sms.twilio.auth-token:}") String authToken,
            @Value("${app.sms.twilio.from-number:}") String fromNumber
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
    }

    @Override
    public void sendOtp(String mobile, String otp) {
        if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
            throw new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "SMS service is not configured. Set Twilio credentials before using mobile OTP."
            );
        }

        try {
            initializeClientIfNeeded();
            Message.creator(
                    new PhoneNumber("+91" + mobile),
                    new PhoneNumber(fromNumber),
                    "Your Civis OTP is " + otp + ". It is valid for 5 minutes."
            ).create();
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "Failed to send OTP SMS. Check your Twilio configuration and phone number verification."
            );
        }
    }

    private void initializeClientIfNeeded() {
        if (initialized) {
            return;
        }
        synchronized (this) {
            if (initialized) {
                return;
            }
            Twilio.init(accountSid, authToken);
            initialized = true;
        }
    }
}
