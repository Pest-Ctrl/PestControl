package com.pestcontrol.backend.repositories;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.repository.query.parser.PartTree;

import com.pestcontrol.backend.entities.AuditLog;

@ExtendWith(MockitoExtension.class)
class AuditLogRepositoryTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("AuditLogRepository extends JpaRepository<AuditLog, UUID> and maps auditlog table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(AuditLogRepository.class, AuditLog.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(AuditLog.class, "auditlog", "auditId");
        assertEquals("spaceid", RepositoryTestSupport.getColumnName(AuditLog.class, "spaceId"));
        assertEquals("issueid", RepositoryTestSupport.getColumnName(AuditLog.class, "issueId"));
        assertEquals("audittime", RepositoryTestSupport.getColumnName(AuditLog.class, "auditTime"));
    }

    @Test
    @DisplayName("Derived queries parse spaceId and issueId predicates ordered by auditTime DESC")
    void testDerivedQueriesParseCorrectly() {
        PartTree bySpaceTree = RepositoryTestSupport.assertDerivedQueryMethod(
                AuditLogRepository.class, AuditLog.class,
                "findBySpaceIdOrderByAuditTimeDesc", new Class<?>[]{UUID.class},
                List.class, AuditLog.class);
        assertEquals(List.of("spaceId"), RepositoryTestSupport.getPropertyPaths(bySpaceTree));
        RepositoryTestSupport.assertSortedDesc(bySpaceTree, "auditTime");

        PartTree byIssueTree = RepositoryTestSupport.assertDerivedQueryMethod(
                AuditLogRepository.class, AuditLog.class,
                "findByIssueIdOrderByAuditTimeDesc", new Class<?>[]{UUID.class},
                List.class, AuditLog.class);
        assertEquals(List.of("issueId"), RepositoryTestSupport.getPropertyPaths(byIssueTree));
        RepositoryTestSupport.assertSortedDesc(byIssueTree, "auditTime");
    }

    @Test
    @DisplayName("findBySpaceIdOrderByAuditTimeDesc returns matching logs and empty list when none")
    void testFindBySpaceIdOrderByAuditTimeDesc() {
        UUID spaceId = UUID.randomUUID();
        AuditLog log = new AuditLog();
        log.setAuditId(UUID.randomUUID());
        log.setSpaceId(spaceId);
        log.setAuditTitle("Issue Filed");

        when(auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(spaceId)).thenReturn(List.of(log));
        when(auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(UUID.fromString("00000000-0000-0000-0000-000000000000")))
                .thenReturn(Collections.emptyList());

        List<AuditLog> found = auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(spaceId);
        List<AuditLog> empty = auditLogRepository.findBySpaceIdOrderByAuditTimeDesc(
                UUID.fromString("00000000-0000-0000-0000-000000000000"));

        assertEquals(1, found.size());
        assertEquals("Issue Filed", found.get(0).getAuditTitle());
        assertTrue(empty.isEmpty());
        verify(auditLogRepository).findBySpaceIdOrderByAuditTimeDesc(spaceId);
    }

    @Test
    @DisplayName("findByIssueIdOrderByAuditTimeDesc retrieves issue audit history")
    void testFindByIssueIdOrderByAuditTimeDesc() {
        UUID issueId = UUID.randomUUID();
        AuditLog log = new AuditLog();
        log.setIssueId(issueId);
        log.setAuditTitle("Status Transition");

        when(auditLogRepository.findByIssueIdOrderByAuditTimeDesc(issueId)).thenReturn(List.of(log));

        List<AuditLog> result = auditLogRepository.findByIssueIdOrderByAuditTimeDesc(issueId);

        assertEquals(1, result.size());
        assertEquals(issueId, result.get(0).getIssueId());
        verify(auditLogRepository).findByIssueIdOrderByAuditTimeDesc(issueId);
    }
}

