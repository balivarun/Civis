package com.example.demo.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    void updateSchema() {
        jdbcTemplate.execute("""
                ALTER TABLE complaints
                ADD COLUMN IF NOT EXISTS duplicate BOOLEAN NOT NULL DEFAULT FALSE
                """);
        jdbcTemplate.execute("""
                ALTER TABLE complaints
                ADD COLUMN IF NOT EXISTS duplicate_of_complaint_id VARCHAR(255)
                """);
    }
}
