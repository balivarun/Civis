package com.example.demo.dto;

import com.example.demo.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
            @NotBlank(message = "Please enter the location.")
            String location,
            String landmark,
            @NotNull(message = "Please select a priority.")
            Priority priority
    ) {
    }
}
