package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findBySpaceIdOrderByAuditTimeDesc(UUID spaceId);
    List<AuditLog> findByIssueIdOrderByAuditTimeDesc(UUID issueId);
}
