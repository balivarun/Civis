package com.example.demo.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class TwilioSmsSender implements SmsSender {

    private static final Logger logger = LoggerFactory.getLogger(TwilioSmsSender.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final TaskExecutor taskExecutor;
    private volatile boolean initialized;

    public TwilioSmsSender(
            @Value("${app.sms.twilio.account-sid:}") String accountSid,
            @Value("${app.sms.twilio.auth-token:}") String authToken,
            @Value("${app.sms.twilio.from-number:}") String fromNumber,
            @Qualifier("smsTaskExecutor") TaskExecutor taskExecutor
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.taskExecutor = taskExecutor;
    }

    @Override
    public void validateConfiguration() {
        ensureConfigured();
    }

    @Override
    public void sendOtp(String mobile, String otp) {
        ensureConfigured();
        taskExecutor.execute(() -> sendOtpNow(mobile, otp));
    }

    private void sendOtpNow(String mobile, String otp) {
        try {
            initializeClientIfNeeded();
            Message.creator(
                    new PhoneNumber("+91" + mobile),
                    new PhoneNumber(fromNumber),
                    "Your Civis OTP is " + otp + ". It is valid for 5 minutes."
            ).create();
        } catch (Exception exception) {
            logger.error("Failed to send OTP SMS to {}", mobile, exception);
        }
    }

    private void ensureConfigured() {
        if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
            throw new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "SMS service is not configured. Set Twilio credentials before using mobile OTP."
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
