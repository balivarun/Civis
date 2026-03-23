package com.example.demo.service;

import com.example.demo.dto.AuthDtos.EmailLoginRequest;
import com.example.demo.dto.AuthDtos.EmailRegisterRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpRequest;
import com.example.demo.dto.AuthDtos.MobileLoginOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.MobileOtpRequest;
import com.example.demo.dto.AuthDtos.MobileOtpVerifyRequest;
import com.example.demo.dto.AuthDtos.OtpResponse;
import com.example.demo.model.AuthType;
import com.example.demo.model.User;
import com.example.demo.repository.OtpRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, OtpRepository otpRepository) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
    }

    public OtpResponse requestRegistrationOtp(MobileOtpRequest request) {
        if (userRepository.findByMobile(request.mobile()) != null) {
            throw new ResponseStatusException(BAD_REQUEST, "This mobile number is already registered.");
        }
        String otp = generateOtp();
        otpRepository.save(otpKey("register", request.mobile()), otp);
        return new OtpResponse(otp);
    }

    public User verifyRegistrationOtp(MobileOtpVerifyRequest request) {
        String key = otpKey("register", request.mobile());
        if (!otpRepository.matches(key, request.otp())) {
            throw new ResponseStatusException(BAD_REQUEST, "Incorrect OTP. Check the demo code above.");
        }
        if (userRepository.findByMobile(request.mobile()) != null) {
            throw new ResponseStatusException(BAD_REQUEST, "This mobile number is already registered.");
        }

        User user = new User(
                userRepository.nextUserId(),
                request.name().trim(),
                request.mobile(),
                "",
                AuthType.mobile,
                Instant.now()
        );
        otpRepository.remove(key);
        return userRepository.save(user);
    }

    public User registerWithEmail(EmailRegisterRequest request) {
        if (userRepository.findByEmail(request.email()) != null) {
            throw new ResponseStatusException(BAD_REQUEST, "This email is already registered.");
        }

        User user = new User(
                userRepository.nextUserId(),
                request.name().trim(),
                "",
                request.email().trim(),
                AuthType.gmail,
                Instant.now()
        );
        userRepository.save(user);
        userRepository.savePassword(user.id(), request.password());
        return user;
    }

    public OtpResponse requestLoginOtp(MobileLoginOtpRequest request) {
        if (userRepository.findByMobile(request.mobile()) == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this number. Please register first.");
        }
        String otp = generateOtp();
        otpRepository.save(otpKey("login", request.mobile()), otp);
        return new OtpResponse(otp);
    }

    public User verifyLoginOtp(MobileLoginOtpVerifyRequest request) {
        String key = otpKey("login", request.mobile());
        if (!otpRepository.matches(key, request.otp())) {
            throw new ResponseStatusException(BAD_REQUEST, "Incorrect OTP. Check the demo code above.");
        }
        User user = userRepository.findByMobile(request.mobile());
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this number. Please register first.");
        }
        otpRepository.remove(key);
        return user;
    }

    public User loginWithEmail(EmailLoginRequest request) {
        User user = userRepository.findByEmail(request.email());
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "No account found for this email. Please register first.");
        }
        if (!userRepository.passwordMatches(user.id(), request.password())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Incorrect password.");
        }
        return user;
    }

    private String generateOtp() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    private String otpKey(String flow, String mobile) {
        return flow + ":" + mobile;
    }
}
