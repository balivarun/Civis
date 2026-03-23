package com.example.demo.repository;

import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class OtpRepository {

    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private final Map<String, OtpRecord> otps = new ConcurrentHashMap<>();

    public void save(String key, String otp) {
        otps.put(key, new OtpRecord(otp, Instant.now().plus(OTP_TTL)));
    }

    public boolean matches(String key, String otp) {
        OtpRecord record = otps.get(key);
        if (record == null || record.expiresAt().isBefore(Instant.now())) {
            otps.remove(key);
            return false;
        }
        return record.otp().equals(otp);
    }

    public void remove(String key) {
        otps.remove(key);
    }

    private record OtpRecord(String otp, Instant expiresAt) {
    }
}
