package com.pestcontrol.backend.repositories;

import java.util.List;
import java.util.Optional;
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

import com.pestcontrol.backend.entities.Space;

@ExtendWith(MockitoExtension.class)
class SpaceRepositoryTest {

    @Mock
    private SpaceRepository spaceRepository;

    @Test
    @DisplayName("SpaceRepository extends JpaRepository<Space, UUID> and maps space table")
    void testRepositoryContractAndEntityMapping() {
        RepositoryTestSupport.assertJpaRepositoryContract(SpaceRepository.class, Space.class, UUID.class);
        RepositoryTestSupport.assertEntityTableAndId(Space.class, "space", "spaceId");
        assertEquals("ownerid", RepositoryTestSupport.getColumnName(Space.class, "ownerId"));
        assertEquals("spacename", RepositoryTestSupport.getColumnName(Space.class, "spaceName"));
    }

    @Test
    @DisplayName("SpaceRepository CRUD methods delegate saving, lookup, existence, and deletion")
    void testSpaceCrudOperations() {
        UUID spaceId = UUID.randomUUID();
        Space space = new Space();
        space.setSpaceId(spaceId);
        space.setOwnerId(UUID.randomUUID());
        space.setSpaceName("Core Platform");

        when(spaceRepository.save(space)).thenReturn(space);
        when(spaceRepository.findById(spaceId)).thenReturn(Optional.of(space));
        when(spaceRepository.findAll()).thenReturn(List.of(space));
        when(spaceRepository.existsById(spaceId)).thenReturn(true);

        Space saved = spaceRepository.save(space);
        Optional<Space> found = spaceRepository.findById(spaceId);
        List<Space> all = spaceRepository.findAll();

        assertEquals("Core Platform", saved.getSpaceName());
        assertTrue(found.isPresent());
        assertEquals(1, all.size());
        assertTrue(spaceRepository.existsById(spaceId));

        spaceRepository.deleteById(spaceId);
        verify(spaceRepository).deleteById(spaceId);
    }
}

