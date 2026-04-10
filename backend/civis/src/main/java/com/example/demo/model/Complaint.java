package com.example.demo.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String category;

    private String categoryIcon;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2048)
    private String description;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String imageDataUrl;

    private String location;
    private String landmark;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_timeline", joinColumns = @JoinColumn(name = "complaint_id"))
    private List<TimelineEntry> timeline = new ArrayList<>();

    public Complaint() {
    }

    public Complaint(String id, String userId, String category, String categoryIcon, String title, String description, String imageDataUrl, String location, String landmark, Status status, Priority priority, Instant createdAt, Instant updatedAt, List<TimelineEntry> timeline) {
        this.id = id;
        this.userId = userId;
        this.category = category;
        this.categoryIcon = categoryIcon;
        this.title = title;
        this.description = description;
        this.imageDataUrl = imageDataUrl;
        this.location = location;
        this.landmark = landmark;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.timeline = timeline;
    }

    // getters and setters for all fields

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageDataUrl() { return imageDataUrl; }
    public void setImageDataUrl(String imageDataUrl) { this.imageDataUrl = imageDataUrl; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public List<TimelineEntry> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEntry> timeline) { this.timeline = timeline; }
}
