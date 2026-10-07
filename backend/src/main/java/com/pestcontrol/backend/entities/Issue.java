package com.pestcontrol.backend.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.pestcontrol.backend.exceptions.InvalidBugTypeException;
import com.pestcontrol.backend.exceptions.InvalidIssueStatusException;
import com.pestcontrol.backend.exceptions.InvalidSeverityStatusException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "issues")
public class Issue {

    public enum IssueStatus
    {
        Open, InProgress, UnderReview, Resolved, Closed, Reopened
    }

    public enum SeverityStatus
    {
        Critical, High, Medium, Low
    }

    public enum BugTypes
    {
        Functional, Performance, Security, UI, Compatibility, Data
    }

    public static IssueStatus fromStringIssueStatus(String text)
    {
        for (IssueStatus r : IssueStatus.values()) 
        {
            if (r.name().equalsIgnoreCase(text))
            {
                return r;
            }
        }
        throw new InvalidIssueStatusException("Invalid Issue Status Mentioned!");
    }

    public static SeverityStatus fromStringSeverityStatus(String text)
    {
        for (SeverityStatus r : SeverityStatus.values()) 
        {
            if (r.name().equalsIgnoreCase(text))
            {
                return r;
            }
        }
        throw new InvalidSeverityStatusException("Invalid Severity Status Mentioned!");
    }

    public static BugTypes fromStringBugTypes(String text)
    {
        for (BugTypes r : BugTypes.values()) 
        {
            if (r.name().equalsIgnoreCase(text) || (text != null && text.equalsIgnoreCase("Compatiblity") && r == BugTypes.Compatibility))
            {
                return r;
            }
        }
        throw new InvalidBugTypeException("Invalid Bug Type Mentioned!");
    }

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

    @Column(name = "\"desc\"", nullable = false)
    private String description;

    @Column(name = "\"status\"", nullable = false)
    private IssueStatus status = IssueStatus.Open;

    @Column(name = "repoid")
    private UUID repoId;

    @Column(name = "commitid")
    private UUID commitId;

    @Column(name = "severity", nullable = false)
    private SeverityStatus severity = SeverityStatus.Medium;

    @Column(name = "bugtype", nullable = false)
    private BugTypes bugType = BugTypes.Functional;

    @Column(name = "filepath")
    private String filePath;

    @Column(name = "linerange")
    private String lineRange;

    @Column(name = "createdat", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deadline", insertable = true, updatable = true, nullable = true)
    private LocalDateTime deadline;

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
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public UUID getRepoId() { return repoId; }
    public void setRepoId(UUID repoId) { this.repoId = repoId; }
    public UUID getCommitId() { return commitId; }
    public void setCommitId(UUID commitId) { this.commitId = commitId; }
    public SeverityStatus getSeverity() { return severity; }
    public void setSeverity(SeverityStatus severity) { this.severity = severity; }
    public BugTypes getBugType() { return bugType; }
    public void setBugType(BugTypes bugType) { this.bugType = bugType; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getLineRange() { return lineRange; }
    public void setLineRange(String lineRange) { this.lineRange = lineRange; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
}