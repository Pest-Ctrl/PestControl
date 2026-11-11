package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AuditLogTest
{
    @Test
    @DisplayName("Verify AuditLog getters, setters, and nullable issueId")
    void testAuditLogGettersAndSetters()
	{
        AuditLog auditLog = new AuditLog();
        UUID auditId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID spaceId = UUID.randomUUID();
        UUID issueId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        auditLog.setAuditId(auditId);
        auditLog.setUserId(userId);
        auditLog.setSpaceId(spaceId);
        auditLog.setIssueId(issueId);
        auditLog.setAuditTitle("Status Changed");
        auditLog.setAuditDesc("Status changed from Open to InProgress");
        auditLog.setAuditTime(now);

        assertEquals(auditId, auditLog.getAuditId());
        assertEquals(userId, auditLog.getUserId());
        assertEquals(spaceId, auditLog.getSpaceId());
        assertEquals(issueId, auditLog.getIssueId());
        assertEquals("Status Changed", auditLog.getAuditTitle());
        assertEquals("Status changed from Open to InProgress", auditLog.getAuditDesc());
        assertEquals(now, auditLog.getAuditTime());
    }

    @Test
    @DisplayName("Verify AuditLog issueId can be null for space-level actions")
    void testAuditLogNullableIssueId() 
	{
        AuditLog auditLog = new AuditLog();
        auditLog.setIssueId(null);
        assertNull(auditLog.getIssueId());
    }
}