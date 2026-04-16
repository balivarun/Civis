package com.example.demo.service;

import com.example.demo.config.AiProperties;
import com.example.demo.dto.ComplaintDtos.GenerateComplaintDescriptionRequest;
import com.example.demo.dto.ComplaintDtos.GenerateComplaintDescriptionResponse;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;
import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;

@Service
public class ComplaintAiService {
    private static final int MAX_AI_RETRIES = 2;

    private static final String SYSTEM_PROMPT = """
            You rewrite rough civic issue notes into a clear complaint description for a municipal reporting form.
            Rules:
            - Return plain text only.
            - Write one short paragraph of 80 to 140 words.
            - Be factual, respectful, and easy for city staff to act on.
            - Mention the reported issue, the location clues provided, and the citizen impact when available.
            - Do not invent facts that were not provided.
            - Do not use bullet points, headings, or markdown.
            - Do not mention AI.
            """;

    private final AiProperties aiProperties;
    private final RestClient restClient;

    public ComplaintAiService(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        this.restClient = RestClient.builder()
                .baseUrl(aiProperties.getBaseUrl())
                .build();
    }

    public GenerateComplaintDescriptionResponse generateDescription(GenerateComplaintDescriptionRequest request) {
        if (aiProperties.getApiKey() == null || aiProperties.getApiKey().isBlank()) {
            throw new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "AI description generation is not configured. Set AI_API_KEY first."
            );
        }

        if (isBlank(request.category())
                && isBlank(request.title())
                && isBlank(request.draftDescription())
                && isBlank(request.location())
                && isBlank(request.landmark())) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Enter at least one complaint detail before generating a description."
            );
        }

        for (int attempt = 0; attempt <= MAX_AI_RETRIES; attempt++) {
            try {
                ChatCompletionResponse response = restClient.post()
                        .uri("/chat/completions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + aiProperties.getApiKey().trim())
                        .body(new ChatCompletionRequest(
                                aiProperties.getModel(),
                                List.of(
                                        new ChatCompletionMessage("system", SYSTEM_PROMPT),
                                        new ChatCompletionMessage("user", buildUserPrompt(request))
                                )
                        ))
                        .retrieve()
                        .body(ChatCompletionResponse.class);

                String description = extractDescription(response);
                return new GenerateComplaintDescriptionResponse(description);
            } catch (RestClientResponseException exception) {
                int statusCode = exception.getStatusCode().value();
                if (statusCode == TOO_MANY_REQUESTS.value() && attempt < MAX_AI_RETRIES) {
                    sleepBeforeRetry(attempt);
                    continue;
                }
                throw mapProviderException(statusCode);
            } catch (RestClientException exception) {
                throw new ResponseStatusException(BAD_GATEWAY, "Unable to reach the AI provider.");
            }
        }

        throw new ResponseStatusException(
                BAD_GATEWAY,
                "AI provider request failed after retries."
        );
    }

    private String buildUserPrompt(GenerateComplaintDescriptionRequest request) {
        List<String> lines = new ArrayList<>();
        lines.add("Write a final complaint description using only these details:");
        addLine(lines, "Category", request.category());
        addLine(lines, "Title", request.title());
        addLine(lines, "Citizen notes", request.draftDescription());
        addLine(lines, "Location", request.location());
        addLine(lines, "Landmark", request.landmark());
        return String.join(System.lineSeparator(), lines);
    }

    private String extractDescription(ChatCompletionResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new ResponseStatusException(BAD_GATEWAY, "AI provider returned an empty response.");
        }

        String content = response.choices().stream()
                .map(ChatCompletionChoice::message)
                .filter(message -> message != null && !isBlank(message.content()))
                .map(ChatCompletionMessage::content)
                .findFirst()
                .orElse("");

        if (content.isBlank()) {
            throw new ResponseStatusException(BAD_GATEWAY, "AI provider returned an empty description.");
        }

        return content.trim();
    }

    private void addLine(List<String> lines, String label, String value) {
        if (!isBlank(value)) {
            lines.add(label + ": " + value.trim());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void sleepBeforeRetry(int attempt) {
        long delayMillis = (long) Math.pow(2, attempt) * 1000L;
        try {
            Thread.sleep(delayMillis);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(BAD_GATEWAY, "AI retry interrupted.");
        }
    }

    private ResponseStatusException mapProviderException(int statusCode) {
        if (statusCode == TOO_MANY_REQUESTS.value()) {
            return new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "AI service is busy or quota is exceeded. Please try again in a minute."
            );
        }
        if (statusCode == NOT_FOUND.value()) {
            return new ResponseStatusException(
                    BAD_GATEWAY,
                    "AI model or endpoint was not found. Check AI_BASE_URL and AI_MODEL."
            );
        }
        return new ResponseStatusException(
                BAD_GATEWAY,
                "AI provider request failed with status " + statusCode + "."
        );
    }

    private record ChatCompletionRequest(
            String model,
            List<ChatCompletionMessage> messages
    ) {
    }

    private record ChatCompletionMessage(
            String role,
            String content
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ChatCompletionResponse(
            List<ChatCompletionChoice> choices
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ChatCompletionChoice(
            ChatCompletionMessage message
    ) {
    }
}
