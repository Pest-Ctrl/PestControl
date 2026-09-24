package com.pestcontrol.backend.repositories;

import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.Issue;

public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findBySpaceIdOrderByCreatedAtDesc(UUID spaceId);
}
