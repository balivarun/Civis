package com.example.demo.model;

import jakarta.persistence.Embeddable;

import java.time.Instant;

@Embeddable
public class TimelineEntry {

    private String status;
    private String note;
    private Instant date;

    public TimelineEntry() {
    }

    public TimelineEntry(String status, String note, Instant date) {
        this.status = status;
        this.note = note;
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
