package com.example.demo.controller;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.dto.ComplaintDtos.AdminComplaintSummary;
import com.example.demo.dto.ComplaintDtos.GenerateComplaintDescriptionRequest;
import com.example.demo.dto.ComplaintDtos.GenerateComplaintDescriptionResponse;
import com.example.demo.dto.ComplaintDtos.UpdateComplaintStatusRequest;
import com.example.demo.model.Complaint;
import com.example.demo.service.ComplaintAiService;
import com.example.demo.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintAiService complaintAiService;

    public ComplaintController(ComplaintService complaintService, ComplaintAiService complaintAiService) {
        this.complaintService = complaintService;
        this.complaintAiService = complaintAiService;
    }

    @GetMapping
    public List<Complaint> getComplaintsByUser(Authentication authentication) {
        return complaintService.getComplaintsByUser(authentication.getName());
    }

    @GetMapping("/admin/all")
    public List<AdminComplaintSummary> getAllComplaintsForAdmin(Authentication authentication) {
        return complaintService.getAllComplaintsForAdmin(authentication.getName());
    }

    @GetMapping("/stats")
    public java.util.Map<String, Object> getPublicStats() {
        return complaintService.getPublicStats();
    }

    @PatchMapping("/admin/{id}/status")
    public Complaint updateComplaintStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateComplaintStatusRequest request,
            Authentication authentication
    ) {
        return complaintService.updateComplaintStatusForAdmin(id, request, authentication.getName());
    }

    @GetMapping("/{id}")
    public Complaint getComplaintById(@PathVariable String id, Authentication authentication) {
        return complaintService.getComplaintById(id, authentication.getName());
    }

    @PostMapping("/ai/generate-description")
    public GenerateComplaintDescriptionResponse generateComplaintDescription(
            @Valid @RequestBody GenerateComplaintDescriptionRequest request
    ) {
        return complaintAiService.generateDescription(request);
    }

    @PostMapping
    public Complaint createComplaint(@Valid @RequestBody CreateComplaintRequest request, Authentication authentication) {
        return complaintService.createComplaint(authentication.getName(), request);
    }
}
