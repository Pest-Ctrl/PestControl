package com.pestcontrol.backend.repositories;

import com.pestcontrol.backend.entities.Inbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InboxRepository extends JpaRepository<Inbox, UUID> {
    List<Inbox> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
