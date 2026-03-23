package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserRepository {

    private final Map<String, User> usersById = new ConcurrentHashMap<>();
    private final Map<String, String> userIdsByMobile = new ConcurrentHashMap<>();
    private final Map<String, String> userIdsByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> passwordsByUserId = new ConcurrentHashMap<>();

    public User save(User user) {
        usersById.put(user.id(), user);
        if (user.mobile() != null && !user.mobile().isBlank()) {
            userIdsByMobile.put(user.mobile(), user.id());
        }
        if (user.email() != null && !user.email().isBlank()) {
            userIdsByEmail.put(normalizeEmail(user.email()), user.id());
        }
        return user;
    }

    public User findByMobile(String mobile) {
        String userId = userIdsByMobile.get(mobile);
        return userId == null ? null : usersById.get(userId);
    }

    public User findByEmail(String email) {
        String userId = userIdsByEmail.get(normalizeEmail(email));
        return userId == null ? null : usersById.get(userId);
    }

    public User findById(String userId) {
        return usersById.get(userId);
    }

    public void savePassword(String userId, String password) {
        passwordsByUserId.put(userId, password);
    }

    public boolean passwordMatches(String userId, String password) {
        return password.equals(passwordsByUserId.get(userId));
    }

    public String nextUserId() {
        return "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String normalizeEmail(String email) {
        return email.toLowerCase().trim();
    }
}
