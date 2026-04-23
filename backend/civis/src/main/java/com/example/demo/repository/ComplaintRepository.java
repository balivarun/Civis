package com.example.demo.repository;

import com.example.demo.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    void deleteByUserId(String userId);

    long countByStatus(com.example.demo.model.Status status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.location) FROM Complaint c WHERE c.location IS NOT NULL AND c.location <> ''")
    long countDistinctLocations();

    @org.springframework.data.jpa.repository.Query("SELECT c.category, COUNT(c) FROM Complaint c WHERE c.category IS NOT NULL AND c.category <> '' GROUP BY c.category")
    List<Object[]> countByCategory();
}
