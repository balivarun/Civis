package com.example.demo.model;

import java.time.Instant;
import java.util.List;

public record Complaint(
        String id,
        String userId,
        String category,
        String categoryIcon,
        String title,
        String description,
        String location,
        String landmark,
        Status status,
        Priority priority,
        Instant createdAt,
        Instant updatedAt,
        List<TimelineEntry> timeline
) {
}
