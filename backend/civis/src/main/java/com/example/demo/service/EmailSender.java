package com.example.demo.service;

public interface EmailSender {
    void sendVerification(String email, String token);
}
