package com.example.demo.repository;

import com.example.demo.model.Complaint;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class ComplaintRepository {

    private final Map<String, Complaint> complaints = new ConcurrentHashMap<>();
    private final AtomicInteger sequence = new AtomicInteger();

    public Complaint save(Complaint complaint) {
        complaints.put(complaint.id(), complaint);
        return complaint;
    }

    public List<Complaint> findByUserId(String userId) {
        return complaints.values().stream()
                .filter(complaint -> complaint.userId().equals(userId))
                .sorted(Comparator.comparing(Complaint::createdAt).reversed())
                .toList();
    }

    public Complaint findById(String id) {
        return complaints.get(id);
    }

    public String nextId() {
        return "CIV-" + String.format("%04d", sequence.incrementAndGet());
    }
}
