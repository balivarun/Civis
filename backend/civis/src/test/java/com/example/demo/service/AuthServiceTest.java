package com.example.demo.service;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.model.AuthType;
import com.example.demo.model.User;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final OtpTokenRepository otpRepository = mock(OtpTokenRepository.class);
    private final ComplaintRepository complaintRepository = mock(ComplaintRepository.class);
    private final SmsSender smsSender = mock(SmsSender.class);
    private final AdminAccessService adminAccessService = new AdminAccessService("admin@example.com", "");
    private final RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
    private final AuthService authService = new AuthService(
            userRepository,
            otpRepository,
            complaintRepository,
            smsSender,
            adminAccessService,
            refreshTokenService,
            false
    );

    @Test
    void loginWithEmailRejectsNonAdminOnAdminLogin() {
        User user = new User(
                "u_123",
                "Regular User",
                null,
                "user@example.com",
                AuthType.gmail,
                new BCryptPasswordEncoder().encode("Password@123"),
                Instant.now()
        );
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.loginWithEmail(new EmailLoginRequest("user@example.com", "Password@123", true))
        );

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("This account is not approved for admin access.", exception.getReason());
    }

    @Test
    void loginWithEmailAllowsAdminOnAdminLogin() {
        User user = new User(
                "u_456",
                "Admin User",
                null,
                "admin@example.com",
                AuthType.gmail,
                new BCryptPasswordEncoder().encode("Password@123"),
                Instant.now()
        );
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));

        User loggedInUser = authService.loginWithEmail(
                new EmailLoginRequest("admin@example.com", "Password@123", true)
        );

        assertSame(user, loggedInUser);
    }

    @Test
    void deleteAccountRemovesUserData() {
        User user = new User(
                "u_789",
                "Delete Me",
                "9876543210",
                "delete@example.com",
                AuthType.gmail,
                new BCryptPasswordEncoder().encode("Password@123"),
                Instant.now()
        );
        when(userRepository.findById("u_789")).thenReturn(Optional.of(user));

        authService.deleteAccount("u_789");

        verify(complaintRepository).deleteByUserId("u_789");
        verify(refreshTokenService).revokeAllForUser("u_789");
        verify(userRepository).delete(user);
    }
}
