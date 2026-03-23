package com.example.demo.model;

import java.time.Instant;

public record TimelineEntry(
        String status,
        String note,
        Instant date
) {
}
