package com.pestcontrol.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pestcontrol.backend.entities.AuditLog;
import com.pestcontrol.backend.repositories.AuditLogRepository;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    private UUID userId;
    private UUID spaceId;
    private UUID issueId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        spaceId = UUID.randomUUID();
        issueId = UUID.randomUUID();
    }

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

