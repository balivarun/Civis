package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    Submitted,
    Acknowledged,
    Under_Review,
    In_Progress,
    Resolved;

    @JsonValue
    @Override
    public String toString() {
        return switch (this) {
            case Submitted -> "Submitted";
            case Acknowledged -> "Acknowledged";
            case Under_Review -> "Under Review";
            case In_Progress -> "In Progress";
            case Resolved -> "Resolved";
        };
    }
}
