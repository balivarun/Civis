package com.example.demo.service;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.MobileOtpRequest;
import com.example.demo.dto.AuthDtos.MobileOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.OtpResponse;
import com.example.demo.model.AuthType;
import com.example.demo.model.OtpToken;
import com.example.demo.model.User;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private static final Duration OTP_TTL = Duration.ofMinutes(5);

    private final UserRepository userRepository;
    private final OtpTokenRepository otpRepository;
    private final SmsSender smsSender;
    private final AdminAccessService adminAccessService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();
    private final boolean exposeOtpInResponse;

    public AuthService(
            UserRepository userRepository,
            OtpTokenRepository otpRepository,
            SmsSender smsSender,
            AdminAccessService adminAccessService,
            @Value("${app.auth.expose-otp:false}") boolean exposeOtpInResponse
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.smsSender = smsSender;
        this.adminAccessService = adminAccessService;
        this.exposeOtpInResponse = exposeOtpInResponse;
    }

    public OtpResponse requestRegistrationOtp(MobileOtpRequest request) {
        if (userRepository.findByMobile(request.mobile()).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "This mobile number is already registered.");
        }
        String otp = generateOtp();
        String key = otpKey("register", request.mobile());
        otpRepository.save(new OtpToken(key, otp, Instant.now().plus(OTP_TTL)));
        smsSender.sendOtp(request.mobile(), otp);
        return otpResponse(otp);
    }

    public User verifyRegistrationOtp(MobileOtpVerifyRequest request) {
        String key = otpKey("register", request.mobile());
        if (!matchesOtp(key, request.otp())) {
            throw new ResponseStatusException(BAD_REQUEST, "Incorrect OTP.");
        }
        if (userRepository.findByMobile(request.mobile()).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "This mobile number is already registered.");
        }

        User user = new User(
                "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                request.name().trim(),
                request.mobile(),
                null,
                AuthType.mobile,
                null,
                Instant.now()
        );
        otpRepository.deleteById(key);
        return userRepository.save(user);
    }

    public User registerWithEmail(EmailRegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is already registered.");
        }
        if (Boolean.TRUE.equals(request.adminAccess())
                && !adminAccessService.isAdminIdentifier(request.email(), null)) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is not approved for admin access.");
        }

        User user = new User(
                "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                request.name().trim(),
                null,
                request.email().trim(),
                AuthType.gmail,
                passwordEncoder.encode(request.password()),
                Instant.now()
        );
        return userRepository.save(user);
    }

    public OtpResponse requestLoginOtp(MobileLoginOtpRequest request) {
        if (userRepository.findByMobile(request.mobile()).isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this number. Please register first.");
        }
        String otp = generateOtp();
        String key = otpKey("login", request.mobile());
        otpRepository.save(new OtpToken(key, otp, Instant.now().plus(OTP_TTL)));
        smsSender.sendOtp(request.mobile(), otp);
        return otpResponse(otp);
    }

    public User verifyLoginOtp(MobileLoginOtpVerifyRequest request) {
        String key = otpKey("login", request.mobile());
        if (!matchesOtp(key, request.otp())) {
            throw new ResponseStatusException(BAD_REQUEST, "Incorrect OTP.");
        }
        User user = userRepository.findByMobile(request.mobile()).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this number. Please register first.");
        }
        otpRepository.deleteById(key);
        return user;
    }

    public User loginWithEmail(EmailLoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this email. Please register first.");
        }
        String storedPassword = user.getPassword();
        if (storedPassword == null || storedPassword.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
        }
        if (passwordEncoder.matches(request.password(), storedPassword)) {
            return user;
        }
        // Backward compatibility: migrate old plain-text passwords on successful login.
        if (request.password().equals(storedPassword)) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
            return user;
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
    }

    private String generateOtp() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    private boolean matchesOtp(String key, String otp) {
        return otpRepository.findById(key)
                .filter(stored -> stored.getExpiresAt().isAfter(Instant.now()))
                .map(stored -> stored.getOtp().equals(otp))
                .orElse(false);
    }

    private String otpKey(String flow, String mobile) {
        return flow + ":" + mobile;
    }

    private OtpResponse otpResponse(String otp) {
        return new OtpResponse(
                "OTP generated successfully.",
                exposeOtpInResponse ? otp : null
        );
    }
}
