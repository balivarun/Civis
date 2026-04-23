package com.example.demo.service;

public interface GoogleTokenVerifier {
    GoogleUser verify(String idToken);

    record GoogleUser(String email, String name, String subject) {
    }
}
