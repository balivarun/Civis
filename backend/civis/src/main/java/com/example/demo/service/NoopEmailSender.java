package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class NoopEmailSender implements EmailSender {
    @Override
    public void sendVerification(String email, String token) {
        // Development fallback: log the verification token. Replace with real email sending in production.
        System.out.println("[EMAIL] Verification token for " + email + " : " + token);
    }
}
