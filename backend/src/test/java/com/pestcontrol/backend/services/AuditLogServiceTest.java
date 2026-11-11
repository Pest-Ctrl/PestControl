package com.pestcontrol.backend.services;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pestcontrol.backend.entities.AuditLog;
import com.pestcontrol.backend.repositories.AuditLogRepository;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    private final UUID userId = UUID.randomUUID();
    private final UUID spaceId = UUID.randomUUID();
    private final UUID issueId = UUID.randomUUID();

    @Test
    @DisplayName("Compliance: logSeverityChanged logs transition accurately")
    void testLogSeverityChanged() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditLogService.logSeverityChanged(userId, spaceId, issueId, "Low", "Critical");

        assertNotNull(log);
        assertEquals("Severity Changed", log.getAuditTitle());
        assertEquals("Severity changed from Low to Critical", log.getAuditDesc());
        assertEquals(userId, log.getUserId());
        assertEquals(spaceId, log.getSpaceId());
        assertEquals(issueId, log.getIssueId());
    }

    @Test
    @DisplayName("Compliance: logDueDateChanged formats null/empty dates as 'none'")
    void testLogDueDateChangedHandlesNull() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditLogService.logDueDateChanged(userId, spaceId, issueId, null, "2026-12-31T23:59:59");

        assertNotNull(log);
        assertEquals("Due Date Changed", log.getAuditTitle());
        assertEquals("Due date changed from none to 2026-12-31T23:59:59", log.getAuditDesc());
    }

    @Test
    @DisplayName("Compliance: logRepoImported logs repository owner and name with null issueId")
    void testLogRepoImported() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditLogService.logRepoImported(userId, spaceId, "Pest-Ctrl", "PestControl");

        assertNotNull(log);
        assertEquals("Repo Imported", log.getAuditTitle());
        assertEquals("Imported repository Pest-Ctrl/PestControl", log.getAuditDesc());
        assertNull(log.getIssueId());
    }
}

