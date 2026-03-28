package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    @Column(name = "otp_key", nullable = false, length = 64)
    private String key;

    @Column(name = "otp", nullable = false, length = 8)
    private String otp;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public OtpToken() {
    }

    public OtpToken(String key, String otp, Instant expiresAt) {
        this.key = key;
        this.otp = otp;
        this.expiresAt = expiresAt;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
