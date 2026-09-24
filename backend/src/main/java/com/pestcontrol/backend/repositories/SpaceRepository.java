package com.pestcontrol.backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pestcontrol.backend.entities.Space;

public interface SpaceRepository extends JpaRepository<Space, UUID> {
}
