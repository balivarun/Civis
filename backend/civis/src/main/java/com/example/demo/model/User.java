package com.example.demo.model;

import java.time.Instant;

public record User(
        String id,
        String name,
        String mobile,
        String email,
        AuthType authType,
        Instant createdAt
) {
}
