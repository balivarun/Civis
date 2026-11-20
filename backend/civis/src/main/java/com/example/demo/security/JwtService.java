package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration tokenTtl;

    public JwtService(
            @Value("${app.auth.jwt-secret}") String secret,
            @Value("${app.auth.jwt-ttl-hours:24}") long ttlHours
    ) {
        byte[] keyBytes = resolveKeyBytes(secret);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "A JWT signing secret of at least 32 bytes is required. "
                    + "Set APP_AUTH_JWT_SECRET (recommended) or JWT_SECRET. "
                    + "The value may be a Base64-encoded 32-byte secret or a plain 32-character secret."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.tokenTtl = Duration.ofHours(ttlHours);
    }

    private byte[] resolveKeyBytes(String secret) {
        if (secret == null || secret.trim().isEmpty()) {
            return new byte[0];
        }

        String value = secret.trim();
        try {
            byte[] decoded = Decoders.BASE64.decode(value);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (RuntimeException ignored) {
            // Not Base64; treat the configured value as a plain-text secret.
        }
        return value.getBytes(StandardCharsets.UTF_8);
    }

    public String generateToken(String userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(tokenTtl)))
                .signWith(signingKey)
                .compact();
    }

    public String extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
