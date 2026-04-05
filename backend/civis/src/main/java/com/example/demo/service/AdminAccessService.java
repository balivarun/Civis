package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAccessService {

    private final Set<String> adminEmails;
    private final Set<String> adminMobiles;

    public AdminAccessService(
            @Value("${app.admin.emails:}") String adminEmails,
            @Value("${app.admin.mobiles:}") String adminMobiles
    ) {
        this.adminEmails = parseList(adminEmails);
        this.adminMobiles = parseList(adminMobiles);
    }

    public boolean isAdmin(User user) {
        if (user == null) {
            return false;
        }
        String email = normalize(user.getEmail());
        String mobile = normalize(user.getMobile());
        return (!email.isBlank() && adminEmails.contains(email))
                || (!mobile.isBlank() && adminMobiles.contains(mobile));
    }

    public boolean isAdminIdentifier(String email, String mobile) {
        String normalizedEmail = normalize(email);
        String normalizedMobile = normalize(mobile);
        return (!normalizedEmail.isBlank() && adminEmails.contains(normalizedEmail))
                || (!normalizedMobile.isBlank() && adminMobiles.contains(normalizedMobile));
    }

    public User decorate(User user) {
        if (user != null) {
            user.setAdmin(isAdmin(user));
        }
        return user;
    }

    private Set<String> parseList(String values) {
        return Arrays.stream(values.split(","))
                .map(this::normalize)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
