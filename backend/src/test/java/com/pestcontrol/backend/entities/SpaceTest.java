package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SpaceTest
{
    @Test
    @DisplayName("Verify Space getters and setters")
    void testSpaceGettersAndSetters()
	{
        Space space = new Space();
        UUID spaceId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        LocalDateTime createdAt = LocalDateTime.now();

        space.setSpaceId(spaceId);
        space.setOwnerId(ownerId);
        space.setSpaceName("Engineering Workspace");
        space.setCreatedAt(createdAt);

        assertEquals(spaceId, space.getSpaceId());
        assertEquals(ownerId, space.getOwnerId());
        assertEquals("Engineering Workspace", space.getSpaceName());
        assertEquals(createdAt, space.getCreatedAt());
    }
}