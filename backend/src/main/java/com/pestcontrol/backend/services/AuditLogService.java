package com.pestcontrol.backend.services;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.pestcontrol.backend.entities.AuditLog;
import com.pestcontrol.backend.repositories.AuditLogRepository;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog createEntry(UUID userId, UUID spaceId, UUID issueId, String title, String description) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setSpaceId(spaceId);
        log.setIssueId(issueId);
        log.setAuditTitle(title);
        log.setAuditDesc(description);
        return auditLogRepository.save(log);
    }

    public AuditLog logIssueCreated(UUID userId, UUID spaceId, UUID issueId, String issueTitle) {
        return createEntry(
                userId,
                spaceId,
                issueId,
                "Issue Filed",
                "Filed issue: " + issueTitle);
    }

    public AuditLog logSeverityChanged(UUID userId, UUID spaceId, UUID issueId,
            String oldSeverity, String newSeverity) {
        return createEntry(
                userId,
                spaceId,
                issueId,
                "Severity Changed",
                "Severity changed from " + oldSeverity + " to " + newSeverity);
    }

    public AuditLog logDueDateChanged(UUID userId, UUID spaceId, UUID issueId,
            String oldDueDate, String newDueDate) {
        String oldDisplay = (oldDueDate == null || oldDueDate.isBlank()) ? "none" : oldDueDate;
        String newDisplay = (newDueDate == null || newDueDate.isBlank()) ? "none" : newDueDate;
        return createEntry(
                userId,
                spaceId,
                issueId,
                "Due Date Changed",
                "Due date changed from " + oldDisplay + " to " + newDisplay);
    }

    public AuditLog logStatusChanged(UUID userId, UUID spaceId, UUID issueId,
            String oldStatus, String newStatus) {
        return createEntry(
                userId,
                spaceId,
                issueId,
                "Status Transition",
                "Transitioned from " + oldStatus + " to " + newStatus);
    }

    public AuditLog logIssueReassigned(UUID userId, UUID spaceId, UUID issueId, String details) {
        return createEntry(
                userId,
                spaceId,
                issueId,
                "Issue Reassigned",
                details);
    }

    public AuditLog logRepoImported(UUID userId, UUID spaceId, String repoOwner, String repoName) {
        return createEntry(
                userId,
                spaceId,
                null,
                "Repo Imported",
                "Imported repository " + repoOwner + "/" + repoName);
    }
}
