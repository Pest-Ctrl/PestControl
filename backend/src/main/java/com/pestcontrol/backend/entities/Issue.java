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

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public UUID getSpaceId() { return spaceId; }
    public void setSpaceId(UUID spaceId) { this.spaceId = spaceId; }
    public UUID getReporterId() { return reporterId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getRepoId() { return repoId; }
    public void setRepoId(UUID repoId) { this.repoId = repoId; }
    public UUID getCommitId() { return commitId; }
    public void setCommitId(UUID commitId) { this.commitId = commitId; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getBugType() { return bugType; }
    public void setBugType(String bugType) { this.bugType = bugType; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getLineRange() { return lineRange; }
    public void setLineRange(String lineRange) { this.lineRange = lineRange; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}