package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "issues")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "issueid")
    private UUID issueId;

    @Column(name = "spaceid", nullable = false)
    private UUID spaceId;

    @Column(name = "reporterid", nullable = false)
    private UUID reporterId;

    @Column(name = "assigneeid")
    private UUID assigneeId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "\"Description\"", nullable = false)
    private String description;

    @Column(name = "status", nullable = false)
    private String status = "Open"; // Consider mapping to a Java Enum

    @Column(name = "\"RepoID\"")
    private UUID repoId;

    @Column(name = "\"CommitID\"")
    private UUID commitId;

    @Column(name = "\"Severity\"", nullable = false)
    private String severity = "Medium";

    @Column(name = "\"BugType\"", nullable = false)
    private String bugType = "Functional";

    @Column(name = "\"FilePath\"")
    private String filePath;

    @Column(name = "\"LineRange\"")
    private String lineRange;

    @Column(name = "\"Environment\"")
    private String environment;

    @Column(name = "\"CreatedAt\"", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"UpdatedAt\"", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Getters and Setters
}