package com.pestcontrol.backend.repositories;

import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.Commit;

public interface CommitRepository extends JpaRepository<Commit, String> {
    List<Commit> findByRepoIdOrderByCommittedAtDesc(UUID repoId);
}
