package com.example.demo.service;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.model.AuthType;
import com.example.demo.model.Complaint;
import com.example.demo.model.Priority;
import com.example.demo.model.Status;
import com.example.demo.model.TimelineEntry;
import com.example.demo.model.User;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ComplaintServiceTest {

    private final ComplaintRepository complaintRepository = mock(ComplaintRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final AdminAccessService adminAccessService = new AdminAccessService("admin@example.com", "");
    private final ComplaintService complaintService = new ComplaintService(
            complaintRepository,
            userRepository,
            adminAccessService
    );

    @Test
    void createComplaintMarksRecentSimilarComplaintAsDuplicate() {
        User user = new User(
                "user-1",
                "Reporter",
                "9876543210",
                "reporter@example.com",
                AuthType.gmail,
                null,
                Instant.now()
        );
        Complaint existingComplaint = new Complaint(
                "CIV-EXIST01",
                "user-2",
                "Road Damage",
                "road",
                "Large pothole on Main Street",
                "There is a large pothole near the bus stop on Main Street causing traffic issues.",
                "",
                "9988776655",
                "Main Street",
                "",
                Status.Submitted,
                Priority.High,
                Instant.now().minusSeconds(60 * 60),
                Instant.now().minusSeconds(60 * 60),
                false,
                null,
                List.of(new TimelineEntry("Submitted", "Existing complaint", Instant.now().minusSeconds(60 * 60)))
        );
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(complaintRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(Instant.class)))
                .thenReturn(List.of(existingComplaint));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Complaint createdComplaint = complaintService.createComplaint(
                "user-1",
                new CreateComplaintRequest(
                        "Road Damage",
                        "road",
                        "Big pothole on Main Street",
                        "A big pothole near the bus stop on Main Street is creating traffic and safety issues.",
                        "",
                        "Main Street",
                        "",
                        "",
                        Priority.High
                )
        );

        assertTrue(createdComplaint.isDuplicate());
        assertEquals("CIV-EXIST01", createdComplaint.getDuplicateOfComplaintId());
        assertTrue(createdComplaint.getTimeline().get(0).getNote().contains("marked as a duplicate"));
    }

    @Test
    void createComplaintLeavesDifferentComplaintAsNonDuplicate() {
        User user = new User(
                "user-1",
                "Reporter",
                "9876543210",
                "reporter@example.com",
                AuthType.gmail,
                null,
                Instant.now()
        );
        Complaint existingComplaint = new Complaint(
                "CIV-EXIST02",
                "user-2",
                "Garbage",
                "trash",
                "Overflowing bin in market",
                "The garbage bin in the central market is overflowing since morning.",
                "",
                "9988776655",
                "Central Market",
                "",
                Status.Submitted,
                Priority.Medium,
                Instant.now().minusSeconds(60 * 60),
                Instant.now().minusSeconds(60 * 60),
                false,
                null,
                List.of(new TimelineEntry("Submitted", "Existing complaint", Instant.now().minusSeconds(60 * 60)))
        );
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(complaintRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(Instant.class)))
                .thenReturn(List.of(existingComplaint));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Complaint createdComplaint = complaintService.createComplaint(
                "user-1",
                new CreateComplaintRequest(
                        "Street Light",
                        "light",
                        "Street light not working",
                        "The street light near the school has been off for three nights and the road is unsafe.",
                        "",
                        "School Road",
                        "",
                        "",
                        Priority.Medium
                )
        );

        assertFalse(createdComplaint.isDuplicate());
        assertNull(createdComplaint.getDuplicateOfComplaintId());
        assertEquals("Your complaint has been received and is under processing.", createdComplaint.getTimeline().get(0).getNote());
    }
}
