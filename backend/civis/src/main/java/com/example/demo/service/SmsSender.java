package com.example.demo.service;

public interface SmsSender {
    void sendOtp(String mobile, String otp);
}
