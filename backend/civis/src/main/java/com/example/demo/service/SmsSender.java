package com.example.demo.service;

public interface SmsSender {
    default void validateConfiguration() {
        // Most implementations do not require explicit preflight validation.
    }

    void sendOtp(String mobile, String otp);
}
