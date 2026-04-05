package com.example.demo.service;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.dto.ComplaintDtos.AdminComplaintSummary;
import com.example.demo.model.Complaint;
import com.example.demo.model.Status;
import com.example.demo.model.TimelineEntry;
import com.example.demo.model.User;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ComplaintService {

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
                            reporter != null ? defaultString(reporter.getMobile()) : "",
                            reporter != null ? defaultString(reporter.getEmail()) : "",
                            complaint.getCategory(),
                            complaint.getCategoryIcon(),
                            complaint.getTitle(),
                            complaint.getDescription(),
                            complaint.getLocation(),
                            complaint.getLandmark(),
                            complaint.getStatus(),
                            complaint.getPriority(),
                            complaint.getCreatedAt(),
                            complaint.getUpdatedAt()
                    );
                })
                .toList();
    }

    public Complaint createComplaint(String requesterUserId, CreateComplaintRequest request) {
        User user = userRepository.findById(requesterUserId).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing user.");
        }

        Instant now = Instant.now();
        Complaint complaint = new Complaint(
                "CIV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(),
                requesterUserId,
                request.category().trim(),
                request.categoryIcon(),
                request.title().trim(),
                request.description().trim(),
                request.location().trim(),
                request.landmark() == null ? "" : request.landmark().trim(),
                Status.Submitted,
                request.priority(),
                now,
                now,
                List.of(new TimelineEntry(
                        "Submitted",
                        "Your complaint has been received and is under processing.",
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
}
