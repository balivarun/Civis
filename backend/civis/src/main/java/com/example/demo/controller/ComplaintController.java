package com.example.demo.controller;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.model.Complaint;
import com.example.demo.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public List<Complaint> getComplaintsByUser(Authentication authentication) {
        return complaintService.getComplaintsByUser(authentication.getName());
    }

    @GetMapping("/{id}")
    public Complaint getComplaintById(@PathVariable String id, Authentication authentication) {
        return complaintService.getComplaintById(id, authentication.getName());
    }

    @PostMapping
    public Complaint createComplaint(@Valid @RequestBody CreateComplaintRequest request, Authentication authentication) {
        return complaintService.createComplaint(authentication.getName(), request);
    }
}
