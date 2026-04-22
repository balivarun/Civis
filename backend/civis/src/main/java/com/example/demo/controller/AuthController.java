package com.example.demo.controller;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.AuthResponse;
import com.example.demo.dto.AuthDtos.ChangePasswordRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.MobileOtpRequest;
import com.example.demo.dto.AuthDtos.MobileOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.OtpResponse;
import com.example.demo.model.User;
import com.example.demo.security.JwtService;
import com.example.demo.service.AdminAccessService;
import com.example.demo.service.AuthService;
import com.example.demo.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "civis_refresh_token";

    private final AuthService authService;
    private final AdminAccessService adminAccessService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final boolean refreshCookieSecure;
    private final String refreshCookieSameSite;
    private final String refreshCookieDomain;
    private final long refreshTokenTtlDays;

    public AuthController(
            AuthService authService,
            AdminAccessService adminAccessService,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            @Value("${app.auth.refresh-cookie-secure:true}") boolean refreshCookieSecure,
            @Value("${app.auth.refresh-cookie-same-site:None}") String refreshCookieSameSite,
            @Value("${app.auth.refresh-cookie-domain:}") String refreshCookieDomain,
            @Value("${app.auth.refresh-token-ttl-days:30}") long refreshTokenTtlDays
    ) {
        this.authService = authService;
        this.adminAccessService = adminAccessService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.refreshCookieSecure = refreshCookieSecure;
        this.refreshCookieSameSite = refreshCookieSameSite;
        this.refreshCookieDomain = refreshCookieDomain;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    @PostMapping("/register/mobile/request-otp")
    public OtpResponse requestRegisterOtp(@Valid @RequestBody MobileOtpRequest request) {
        return authService.requestRegistrationOtp(request);
    }

    @PostMapping("/register/mobile/verify")
    public AuthResponse verifyRegisterOtp(@Valid @RequestBody MobileOtpVerifyRequest request, HttpServletResponse response) {
        User user = authService.verifyRegistrationOtp(request);
        setRefreshCookie(response, refreshTokenService.issueToken(user.getId()));
        return new AuthResponse(adminAccessService.decorate(user), jwtService.generateToken(user.getId()));
    }

    @PostMapping("/register/email")
    public AuthResponse registerWithEmail(@Valid @RequestBody EmailRegisterRequest request, HttpServletResponse response) {
        User user = authService.registerWithEmail(request);
        setRefreshCookie(response, refreshTokenService.issueToken(user.getId()));
        return new AuthResponse(adminAccessService.decorate(user), jwtService.generateToken(user.getId()));
    }

    @PostMapping("/login/mobile/request-otp")
    public OtpResponse requestLoginOtp(@Valid @RequestBody MobileLoginOtpRequest request) {
        return authService.requestLoginOtp(request);
    }

    @PostMapping("/login/mobile/verify")
    public AuthResponse verifyLoginOtp(@Valid @RequestBody MobileLoginOtpVerifyRequest request, HttpServletResponse response) {
        User user = authService.verifyLoginOtp(request);
        setRefreshCookie(response, refreshTokenService.issueToken(user.getId()));
        return new AuthResponse(adminAccessService.decorate(user), jwtService.generateToken(user.getId()));
    }

    @PostMapping("/login/email")
    public AuthResponse loginWithEmail(@Valid @RequestBody EmailLoginRequest request, HttpServletResponse response) {
        User user = authService.loginWithEmail(request);
        setRefreshCookie(response, refreshTokenService.issueToken(user.getId()));
        return new AuthResponse(adminAccessService.decorate(user), jwtService.generateToken(user.getId()));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Missing refresh token."
            );
        }
        User user = refreshTokenService.consumeAndRotate(refreshToken);
        refreshTokenService.revoke(refreshToken);
        setRefreshCookie(response, refreshTokenService.issueToken(user.getId()));
        return new AuthResponse(adminAccessService.decorate(user), jwtService.generateToken(user.getId()));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revoke(refreshToken);
        }
        clearRefreshCookie(response);
        return Map.of("message", "Logged out.");
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpServletRequest
    ) {
        authService.changePassword(
                extractUserId(httpServletRequest),
                request.oldPassword(),
                request.newPassword(),
                request.confirmNewPassword()
        );

        return Map.of("message", "Password changed.");
    }

    @DeleteMapping("/account")
    public Map<String, String> deleteAccount(
            HttpServletRequest httpServletRequest,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.deleteAccount(extractUserId(httpServletRequest));
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revoke(refreshToken);
        }
        clearRefreshCookie(response);
        return Map.of("message", "Account deleted.");
    }

    private String extractUserId(HttpServletRequest httpServletRequest) {
        String authHeader = httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Missing or invalid token."
            );
        }

        String token = authHeader.substring(7);
        String userId = jwtService.extractUserId(token);
        if (userId == null || userId.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Invalid token."
            );
        }
        return userId;
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .path("/")
                .sameSite(refreshCookieSameSite)
                .maxAge(Duration.ofDays(refreshTokenTtlDays));
        if (!refreshCookieDomain.isBlank()) {
            builder.domain(refreshCookieDomain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .path("/")
                .sameSite(refreshCookieSameSite)
                .maxAge(Duration.ZERO);
        if (!refreshCookieDomain.isBlank()) {
            builder.domain(refreshCookieDomain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }
}
