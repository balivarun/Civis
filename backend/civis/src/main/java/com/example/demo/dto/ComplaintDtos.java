package com.example.demo.dto;

import com.example.demo.model.Priority;
import com.example.demo.model.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ComplaintDtos {

    private ComplaintDtos() {
    }

    public record CreateComplaintRequest(
            @NotBlank(message = "Please select a category.")
            String category,
            @NotBlank(message = "Please select a category.")
            String categoryIcon,
            @NotBlank(message = "Please enter a complaint title.")
            String title,
            @NotBlank(message = "Description must be at least 30 characters.")
            @Size(min = 30, message = "Description must be at least 30 characters.")
            String description,
            @Size(max = 7000000, message = "Image is too large.")
            String imageDataUrl,
            @NotBlank(message = "Please enter the location.")
            String location,
            String landmark,
            @NotNull(message = "Please select a priority.")
            Priority priority
    ) {
    }

    public record UpdateComplaintStatusRequest(
            @NotNull(message = "Please select a status.")
            Status status
    ) {
    }

    public record AdminComplaintSummary(
            String id,
            String userId,
            String reporterName,
            String reporterMobile,
            String reporterEmail,
            String category,
            String categoryIcon,
            String title,
            String description,
            String location,
            String landmark,
            Status status,
            Priority priority,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
