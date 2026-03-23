package com.example.demo.controller;

import com.example.demo.dto.ComplaintDtos.CreateComplaintRequest;
import com.example.demo.model.Complaint;
import com.example.demo.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<Complaint> getComplaintsByUser(@RequestParam String userId) {
        return complaintService.getComplaintsByUser(userId);
    }

    @GetMapping("/{id}")
    public Complaint getComplaintById(@PathVariable String id) {
        return complaintService.getComplaintById(id);
    }

    @PostMapping
    public Complaint createComplaint(@Valid @RequestBody CreateComplaintRequest request) {
        return complaintService.createComplaint(request);
    }
}
