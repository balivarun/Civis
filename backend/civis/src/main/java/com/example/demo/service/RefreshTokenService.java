package com.example.demo.service;

import com.example.demo.model.RefreshToken;
import com.example.demo.model.User;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final Duration refreshTokenTtl;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            @Value("${app.auth.refresh-token-ttl-days:30}") long ttlDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenTtl = Duration.ofDays(ttlDays);
    }

    @Transactional
    public String issueToken(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
        String token = generateTokenValue();
        Instant now = Instant.now();
        refreshTokenRepository.save(new RefreshToken(
                token,
                userId,
                now.plus(refreshTokenTtl),
                now
        ));
        return token;
    }

    @Transactional
    public User consumeAndRotate(String token) {
        RefreshToken stored = refreshTokenRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token."));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.deleteById(token);
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token expired.");
        }
        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token."));
        return user;
    }

    @Transactional
    public void revoke(String token) {
        refreshTokenRepository.deleteById(token);
    }

    @Transactional
    public void revokeAllForUser(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private String generateTokenValue() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
