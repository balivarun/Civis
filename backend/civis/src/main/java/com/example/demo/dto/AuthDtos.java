package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.example.demo.model.User;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record MobileOtpRequest(
            @NotBlank(message = "Enter your full name.")
            @Size(min = 2, message = "Enter your full name.")
            String name,
            @NotBlank(message = "Enter a valid 10-digit mobile number.")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
            String mobile
    ) {
    }

    public record MobileLoginOtpRequest(
            @NotBlank(message = "Enter a valid 10-digit mobile number.")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
            String mobile
    ) {
    }

    public record MobileOtpVerifyRequest(
            @NotBlank(message = "Enter your full name.")
            @Size(min = 2, message = "Enter your full name.")
            String name,
            @NotBlank(message = "Enter a valid 10-digit mobile number.")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
            String mobile,
            @NotBlank(message = "Enter all 6 digits.")
            @Pattern(regexp = "^\\d{6}$", message = "Enter all 6 digits.")
            String otp
    ) {
    }

    public record MobileLoginOtpVerifyRequest(
            @NotBlank(message = "Enter a valid 10-digit mobile number.")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
            String mobile,
            @NotBlank(message = "Enter all 6 digits.")
            @Pattern(regexp = "^\\d{6}$", message = "Enter all 6 digits.")
            String otp
    ) {
    }

    public record EmailRegisterRequest(
            @NotBlank(message = "Enter your full name.")
            @Size(min = 2, message = "Enter your full name.")
            String name,
            @NotBlank(message = "Enter a valid email address.")
            @Email(message = "Enter a valid email address.")
            String email,
            @NotBlank(message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
            @Size(min = 8, message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
            @Pattern(
                    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$",
                    message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            )
            String password
    ) {
    }

    public record EmailLoginRequest(
            @NotBlank(message = "Enter a valid email address.")
            @Email(message = "Enter a valid email address.")
            String email,
            @NotBlank(message = "Password must be at least 6 characters.")
            @Size(min = 6, message = "Password must be at least 6 characters.")
            String password
    ) {
    }

    public record OtpResponse(String message, String otp) {
    }

    public record AuthResponse(User user, String token) {
    }
}
