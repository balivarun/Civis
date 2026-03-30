package com.example.demo.controller;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.AuthResponse;
import com.example.demo.dto.AuthDtos.MobileLoginOtpRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.MobileOtpRequest;
import com.example.demo.dto.AuthDtos.MobileOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.OtpResponse;
import com.example.demo.model.User;
import com.example.demo.security.JwtService;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register/mobile/request-otp")
    public OtpResponse requestRegisterOtp(@Valid @RequestBody MobileOtpRequest request) {
        return authService.requestRegistrationOtp(request);
    }

    @PostMapping("/register/mobile/verify")
    public AuthResponse verifyRegisterOtp(@Valid @RequestBody MobileOtpVerifyRequest request) {
        User user = authService.verifyRegistrationOtp(request);
        return new AuthResponse(user, jwtService.generateToken(user.getId()));
    }

    @PostMapping("/register/email")
    public AuthResponse registerWithEmail(@Valid @RequestBody EmailRegisterRequest request) {
        User user = authService.registerWithEmail(request);
        return new AuthResponse(user, jwtService.generateToken(user.getId()));
    }

    @PostMapping("/login/mobile/request-otp")
    public OtpResponse requestLoginOtp(@Valid @RequestBody MobileLoginOtpRequest request) {
        return authService.requestLoginOtp(request);
    }

    @PostMapping("/login/mobile/verify")
    public AuthResponse verifyLoginOtp(@Valid @RequestBody MobileLoginOtpVerifyRequest request) {
        User user = authService.verifyLoginOtp(request);
        return new AuthResponse(user, jwtService.generateToken(user.getId()));
    }

    @PostMapping("/login/email")
    public AuthResponse loginWithEmail(@Valid @RequestBody EmailLoginRequest request) {
        User user = authService.loginWithEmail(request);
        return new AuthResponse(user, jwtService.generateToken(user.getId()));
    }
}
