package com.example.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class GoogleTokenVerifierHttpClient implements GoogleTokenVerifier {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String googleClientId;

    public GoogleTokenVerifierHttpClient(
            @Value("${app.auth.google-client-id:}") String googleClientId
    ) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
    }

    @Override
    public GoogleUser verify(String idToken) {
        if (googleClientId.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Google sign-in is not configured.");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8)))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ResponseStatusException(UNAUTHORIZED, "Unable to verify Google sign-in.");
        }

        if (response.statusCode() != 200) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid Google credential.");
        }

        Map<String, String> payload;
        try {
            payload = objectMapper.readValue(response.body(), new TypeReference<>() {});
        } catch (IOException e) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid Google credential.");
        }

        String audience = payload.getOrDefault("aud", "");
        String email = payload.getOrDefault("email", "").trim();
        String name = payload.getOrDefault("name", "").trim();
        String subject = payload.getOrDefault("sub", "").trim();
        boolean emailVerified = Boolean.parseBoolean(payload.getOrDefault("email_verified", "false"));

        if (!googleClientId.equals(audience) || !emailVerified || email.isBlank() || subject.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid Google credential.");
        }

        return new GoogleUser(email, name, subject);
    }
}
