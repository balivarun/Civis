package com.example.demo.service;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.GoogleAuthRequest;
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
    private final AdminAccessService adminAccessService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();
    private final boolean exposeOtpInResponse;

    public AuthService(
            UserRepository userRepository,
            OtpTokenRepository otpRepository,
            ComplaintRepository complaintRepository,
            SmsSender smsSender,
            AdminAccessService adminAccessService,
            RefreshTokenService refreshTokenService,
            GoogleTokenVerifier googleTokenVerifier,
            @Value("${app.auth.expose-otp:false}") boolean exposeOtpInResponse
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.complaintRepository = complaintRepository;
        this.smsSender = smsSender;
        this.adminAccessService = adminAccessService;
        this.refreshTokenService = refreshTokenService;
        this.googleTokenVerifier = googleTokenVerifier;
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

    public User authenticateWithGoogle(GoogleAuthRequest request) {
        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(request.idToken());
        String email = googleUser.email().toLowerCase();
        boolean adminAccess = Boolean.TRUE.equals(request.adminAccess());

        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null) {
            if (adminAccess && !adminAccessService.isAdmin(existingUser)) {
                throw new ResponseStatusException(BAD_REQUEST, "This account is not approved for admin access.");
            }
            if (existingUser.getName() == null || existingUser.getName().isBlank()) {
                existingUser.setName(googleUser.name().isBlank() ? email : googleUser.name());
                return userRepository.save(existingUser);
            }
            return existingUser;
        }

        if (adminAccess && !adminAccessService.isAdminIdentifier(email, null)) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is not approved for admin access.");
        }

        User user = new User(
                "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                googleUser.name().isBlank() ? email : googleUser.name(),
                null,
                email,
                AuthType.gmail,
                null,
                Instant.now()
        );
        return userRepository.save(user);
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

    private OtpResponse otpResponse(String otp) {
        return new OtpResponse(
                "OTP generated successfully.",
                exposeOtpInResponse ? otp : null
        );
    }
}
