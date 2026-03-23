package com.example.demo.service;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.model.Complaint;
import com.example.demo.model.Status;
import com.example.demo.model.TimelineEntry;
import com.example.demo.model.User;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public List<Complaint> getComplaintsByUser(String userId) {
        return complaintRepository.findByUserId(userId);
    }

    public Complaint getComplaintById(String id) {
        Complaint complaint = complaintRepository.findById(id);
        if (complaint == null) {
            throw new ResponseStatusException(NOT_FOUND, "Complaint not found.");
        }
        return complaint;
    }

    public Complaint createComplaint(CreateComplaintRequest request) {
        User user = userRepository.findById(request.userId());
        if (user == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing user.");
        }

        Instant now = Instant.now();
        Complaint complaint = new Complaint(
                complaintRepository.nextId(),
                user.id(),
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
}
