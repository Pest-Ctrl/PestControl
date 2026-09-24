package com.pestcontrol.backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
