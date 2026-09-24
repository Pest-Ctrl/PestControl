package com.pestcontrol.backend.repositories;

import java.util.UUID;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.Repo;

public interface RepoRepository extends JpaRepository<Repo, UUID> {
    Optional<Repo> findBySpaceIdAndGhOwnerAndGhName(UUID spaceId, String ghOwner, String ghName);
    List<Repo> findAllByOrderByImportedAtDesc();
}
