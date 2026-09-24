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
@Table(name = "\"AuditLog\"")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "\"AuditID\"")
    private UUID auditId;

    @Column(name = "\"UserID\"", nullable = false)
    private UUID userId;

    @Column(name = "\"SpaceID\"", nullable = false)
    private UUID spaceId;

    @Column(name = "\"IssueID\"")
    private UUID issueId;

    @Column(name = "\"AuditTitle\"", nullable = false)
    private String auditTitle;

    @Column(name = "\"AuditDesc\"", nullable = false)
    private String auditDesc;

    @Column(name = "\"AuditTime\"", insertable = false, updatable = false)
    private LocalDateTime auditTime;

    public UUID getAuditId() { return auditId; }
    public void setAuditId(UUID auditId) { this.auditId = auditId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getSpaceId() { return spaceId; }
    public void setSpaceId(UUID spaceId) { this.spaceId = spaceId; }

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }

    public String getAuditTitle() { return auditTitle; }
    public void setAuditTitle(String auditTitle) { this.auditTitle = auditTitle; }

    public String getAuditDesc() { return auditDesc; }
    public void setAuditDesc(String auditDesc) { this.auditDesc = auditDesc; }

    public LocalDateTime getAuditTime() { return auditTime; }
    public void setAuditTime(LocalDateTime auditTime) { this.auditTime = auditTime; }
}
