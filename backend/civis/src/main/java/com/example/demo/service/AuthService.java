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
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final ComplaintRepository complaintRepository;
    private final SmsSender smsSender;
    private final EmailSender emailSender;
    private final AdminAccessService adminAccessService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();
    private final boolean exposeOtpInResponse;

    public AuthService(
            UserRepository userRepository,
            OtpTokenRepository otpRepository,
            ComplaintRepository complaintRepository,
            SmsSender smsSender,
            EmailSender emailSender,
            AdminAccessService adminAccessService,
            RefreshTokenService refreshTokenService,
            @Value("${app.auth.expose-otp:false}") boolean exposeOtpInResponse
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.complaintRepository = complaintRepository;
        this.smsSender = smsSender;
        this.emailSender = emailSender;
        this.adminAccessService = adminAccessService;
        this.refreshTokenService = refreshTokenService;
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
        String email = request.email() == null ? null : request.email().trim();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Enter a valid email address.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is already registered.");
        }
        if (Boolean.TRUE.equals(request.adminAccess())
                && !adminAccessService.isAdminIdentifier(email, null)) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is not approved for admin access.");
        }

        User user = new User(
                "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                request.name().trim(),
                null,
                email,
                AuthType.gmail,
                passwordEncoder.encode(request.password()),
                Instant.now()
        );
        user.setEmailVerified(false);
        userRepository.save(user);

        // create verification token (valid 24h)
        String token = UUID.randomUUID().toString().replace("-", "");
        String key = "email_verif:" + email;
        otpRepository.save(new OtpToken(key, token, Instant.now().plus(Duration.ofHours(24))));
        emailSender.sendVerification(email, token);

        return user;
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
        String email = request.email() == null ? null : request.email().trim();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Enter a valid email address.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this email. Please register first.");
        }
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email not verified. Please check your inbox for the verification link.");
        }
        if (Boolean.TRUE.equals(request.adminAccess()) && !adminAccessService.isAdmin(user)) {
            throw new ResponseStatusException(BAD_REQUEST, "This account is not approved for admin access.");
        }
        String storedPassword = user.getPassword();
        if (storedPassword == null || storedPassword.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
        }
        if (passwordEncoder.matches(request.password(), storedPassword)) {
            return user;
        }
        if (request.password().equals(storedPassword)) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
            return user;
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
    }

    public void changePassword(String userId, String oldPassword, String newPassword, String confirmNewPassword) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid token.");
        }
        if (newPassword == null || newPassword.isBlank() || confirmNewPassword == null || confirmNewPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "New password is required.");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new ResponseStatusException(BAD_REQUEST, "New passwords do not match.");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not found.");
        }

        String storedPassword = user.getPassword();
        if (storedPassword == null || storedPassword.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
        }

        // Backward compatibility: plain-text passwords may exist in older deployments.
        boolean oldPasswordMatches = passwordEncoder.matches(oldPassword, storedPassword) || oldPassword.equals(storedPassword);
        if (!oldPasswordMatches) {
            throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid token.");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not found.");
        }

        complaintRepository.deleteByUserId(userId);
        refreshTokenService.revokeAllForUser(userId);
        userRepository.delete(user);
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

    public User verifyEmail(String email, String token) {
        String key = "email_verif:" + (email == null ? "" : email.trim());
        if (!otpRepository.findById(key)
                .filter(stored -> stored.getExpiresAt().isAfter(Instant.now()))
                .map(stored -> stored.getOtp().equals(token))
                .orElse(false)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid or expired verification token.");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this email.");
        }
        user.setEmailVerified(true);
        userRepository.save(user);
        otpRepository.deleteById(key);
        return user;
    }

    private OtpResponse otpResponse(String otp) {
        return new OtpResponse(
                "OTP generated successfully.",
                exposeOtpInResponse ? otp : null
        );
    }
}
