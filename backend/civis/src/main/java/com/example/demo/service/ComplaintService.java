package com.example.demo.service;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.dto.ComplaintDtos.AdminComplaintSummary;
import com.example.demo.dto.ComplaintDtos.UpdateComplaintStatusRequest;
import com.example.demo.model.Complaint;
import com.example.demo.model.Status;
import com.example.demo.model.TimelineEntry;
import com.example.demo.model.User;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ComplaintService {

    private static final long DUPLICATE_LOOKBACK_HOURS = 24;
    private static final double DUPLICATE_SIMILARITY_THRESHOLD = 0.60;

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AdminAccessService adminAccessService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AdminAccessService adminAccessService
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.adminAccessService = adminAccessService;
    }

    public List<Complaint> getComplaintsByUser(String userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Complaint getComplaintById(String id, String requesterUserId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Complaint not found."));
        if (!complaint.getUserId().equals(requesterUserId) && !isAdmin(requesterUserId)) {
            throw new ResponseStatusException(NOT_FOUND, "Complaint not found.");
        }
        return complaint;
    }

    public List<AdminComplaintSummary> getAllComplaintsForAdmin(String requesterUserId) {
        if (!isAdmin(requesterUserId)) {
            throw new ResponseStatusException(NOT_FOUND, "Complaint not found.");
        }

        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        Map<String, User> usersById = new HashMap<>();
        userRepository.findAllById(complaints.stream().map(Complaint::getUserId).distinct().toList())
                .forEach(user -> usersById.put(user.getId(), user));

        return complaints.stream()
                .map(complaint -> {
                    User reporter = usersById.get(complaint.getUserId());
                    return new AdminComplaintSummary(
                            complaint.getId(),
                            complaint.getUserId(),
                            reporter != null ? reporter.getName() : "Unknown User",
                            !defaultString(complaint.getReporterMobile()).isBlank()
                                    ? complaint.getReporterMobile()
                                    : reporter != null ? defaultString(reporter.getMobile()) : "",
                            reporter != null ? defaultString(reporter.getEmail()) : "",
                            complaint.getCategory(),
                            complaint.getCategoryIcon(),
                            complaint.getTitle(),
                            complaint.getDescription(),
                            complaint.getLocation(),
                            complaint.getLandmark(),
                            complaint.getStatus(),
                            complaint.isDuplicate(),
                            complaint.getDuplicateOfComplaintId(),
                            complaint.getPriority(),
                            complaint.getCreatedAt(),
                            complaint.getUpdatedAt()
                    );
                })
                .toList();
    }

    public Complaint updateComplaintStatusForAdmin(
            String complaintId,
            UpdateComplaintStatusRequest request,
            String requesterUserId
    ) {
        if (!isAdmin(requesterUserId)) {
            throw new ResponseStatusException(NOT_FOUND, "Complaint not found.");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Complaint not found."));

        Instant now = Instant.now();
        complaint.setStatus(request.status());
        complaint.setUpdatedAt(now);
        complaint.getTimeline().add(new TimelineEntry(
                request.status().toString(),
                statusNote(request.status()),
                now
        ));

        return complaintRepository.save(complaint);
    }

    public Complaint createComplaint(String requesterUserId, CreateComplaintRequest request) {
        User user = userRepository.findById(requesterUserId).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing user.");
        }

        String category = request.category().trim();
        String title = request.title().trim();
        String description = request.description().trim();
        String location = request.location().trim();
        String landmark = request.landmark() == null ? "" : request.landmark().trim();
        String imageDataUrl = request.imageDataUrl() == null ? "" : request.imageDataUrl().trim();
        String reporterMobile = request.mobileNumber() == null || request.mobileNumber().isBlank()
                ? defaultString(user.getMobile())
                : request.mobileNumber().trim();
        Instant now = Instant.now();
        Complaint duplicateOf = findDuplicateComplaint(category, location, title, description, now).orElse(null);
        boolean isDuplicate = duplicateOf != null;
        Complaint complaint = new Complaint(
                "CIV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(),
                requesterUserId,
                category,
                request.categoryIcon(),
                title,
                description,
                imageDataUrl,
                reporterMobile,
                location,
                landmark,
                Status.Submitted,
                request.priority(),
                now,
                now,
                isDuplicate,
                isDuplicate ? duplicateOf.getId() : null,
                List.of(new TimelineEntry(
                        "Submitted",
                        isDuplicate
                                ? "Your complaint matches a recently submitted complaint and has been marked as a duplicate."
                                : "Your complaint has been received and is under processing.",
                        now
                ))
        );

        return complaintRepository.save(complaint);
    }

    private boolean isAdmin(String requesterUserId) {
        return adminAccessService.isAdmin(userRepository.findById(requesterUserId).orElse(null));
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private Optional<Complaint> findDuplicateComplaint(
            String category,
            String location,
            String title,
            String description,
            Instant submittedAt
    ) {
        String normalizedCategory = normalizeText(category);
        String normalizedLocation = normalizeText(location);
        String incomingText = combineForSimilarity(title, description);
        Instant cutoff = submittedAt.minus(DUPLICATE_LOOKBACK_HOURS, ChronoUnit.HOURS);

        return complaintRepository.findByCreatedAtAfterOrderByCreatedAtDesc(cutoff).stream()
                .filter(existing -> !defaultString(existing.getId()).isBlank())
                .filter(existing -> normalizedCategory.equals(normalizeText(existing.getCategory())))
                .filter(existing -> normalizedLocation.equals(normalizeText(existing.getLocation())))
                .map(existing -> new ComplaintMatch(existing, calculateTextSimilarity(
                        incomingText,
                        combineForSimilarity(existing.getTitle(), existing.getDescription())
                )))
                .filter(match -> match.similarity() >= DUPLICATE_SIMILARITY_THRESHOLD)
                .max(Comparator
                        .comparingDouble(ComplaintMatch::similarity)
                        .thenComparing(match -> match.complaint().getCreatedAt()))
                .map(ComplaintMatch::complaint);
    }

    private double calculateTextSimilarity(String left, String right) {
        Set<String> leftTokens = tokenize(left);
        Set<String> rightTokens = tokenize(right);
        if (leftTokens.isEmpty() || rightTokens.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(leftTokens);
        intersection.retainAll(rightTokens);

        Set<String> union = new HashSet<>(leftTokens);
        union.addAll(rightTokens);

        if (union.isEmpty()) {
            return 0.0;
        }
        return (double) intersection.size() / (double) union.size();
    }

    private Set<String> tokenize(String value) {
        String normalized = normalizeText(value);
        if (normalized.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(normalized.split(" "))
                .filter(token -> !token.isBlank())
                .collect(Collectors.toSet());
    }

    private String combineForSimilarity(String title, String description) {
        return defaultString(title) + " " + defaultString(description);
    }

    private String normalizeText(String value) {
        return defaultString(value)
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    public java.util.Map<String, Object> getPublicStats() {
        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(Status.Resolved);
        long locations = complaintRepository.countDistinctLocations();
        double rate = total == 0 ? 0.0 : ((double) resolved / (double) total) * 100.0;
        java.util.Map<String, Long> categoryCounts = complaintRepository.countByCategory().stream()
                .filter(row -> row.length >= 2 && row[0] instanceof String && row[1] instanceof Number)
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).longValue()
                ));
        java.util.Map<String, Object> m = new java.util.HashMap<>();
        m.put("total", total);
        m.put("resolved", resolved);
        m.put("locations", locations);
        m.put("resolutionRate", Math.round(rate));
        m.put("categoryCounts", categoryCounts);
        return m;
    }

    private String statusNote(Status status) {
        return switch (status) {
            case Submitted -> "Complaint status was set to submitted by the admin team.";
            case Acknowledged -> "Complaint has been acknowledged by the admin team.";
            case Under_Review -> "Complaint is currently under review.";
            case In_Progress -> "Work on this complaint is now in progress.";
            case Resolved -> "Complaint has been marked as resolved by the admin team.";
        };
    }

    private record ComplaintMatch(Complaint complaint, double similarity) {
    }
}
