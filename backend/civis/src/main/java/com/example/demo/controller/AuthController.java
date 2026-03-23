package com.example.demo.controller;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.MobileOtpRequest;
import com.example.demo.dto.AuthDtos.MobileOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.OtpResponse;
import com.example.demo.model.User;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/mobile/request-otp")
    public OtpResponse requestRegisterOtp(@Valid @RequestBody MobileOtpRequest request) {
        return authService.requestRegistrationOtp(request);
    }

    @PostMapping("/register/mobile/verify")
    public User verifyRegisterOtp(@Valid @RequestBody MobileOtpVerifyRequest request) {
        return authService.verifyRegistrationOtp(request);
    }

    @PostMapping("/register/email")
    public User registerWithEmail(@Valid @RequestBody EmailRegisterRequest request) {
        return authService.registerWithEmail(request);
    }

    @PostMapping("/login/mobile/request-otp")
    public OtpResponse requestLoginOtp(@Valid @RequestBody MobileLoginOtpRequest request) {
        return authService.requestLoginOtp(request);
    }

    @PostMapping("/login/mobile/verify")
    public User verifyLoginOtp(@Valid @RequestBody MobileLoginOtpVerifyRequest request) {
        return authService.verifyLoginOtp(request);
    }

    @PostMapping("/login/email")
    public User loginWithEmail(@Valid @RequestBody EmailLoginRequest request) {
        return authService.loginWithEmail(request);
    }
}
