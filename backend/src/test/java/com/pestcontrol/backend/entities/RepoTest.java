package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RepoTest
{
    @Test
    @DisplayName("Verify Repo default field values")
    void testRepoDefaults()
	{
        Repo repo = new Repo();
        assertEquals("main", repo.getDefaultBranch(), "Default branch should be 'main'");
        assertFalse(repo.getIsPrivate(), "Default isPrivate should be false");
    }

    @Test
    @DisplayName("Verify Repo getters and setters")
    void testRepoGettersAndSetters()
	{
        Repo repo = new Repo();
        UUID repoId = UUID.randomUUID();
        UUID spaceId = UUID.randomUUID();
        UUID importedBy = UUID.randomUUID();
        LocalDateTime importedAt = LocalDateTime.now();
        String sampleTree = "{\"tree\": [{\"path\": \"src/Main.java\"}]}";

        repo.setRepoId(repoId);
        repo.setSpaceId(spaceId);
        repo.setGhOwner("pstctrl");
        repo.setGhName("backend");
        repo.setDefaultBranch("develop");
        repo.setIsPrivate(true);
        repo.setFileTree(sampleTree);
        repo.setImportedAt(importedAt);
        repo.setImportedBy(importedBy);

        assertEquals(repoId, repo.getRepoId());
        assertEquals(spaceId, repo.getSpaceId());
        assertEquals("pstctrl", repo.getGhOwner());
        assertEquals("backend", repo.getGhName());
        assertEquals("develop", repo.getDefaultBranch());
        assertTrue(repo.getIsPrivate());
        assertEquals(sampleTree, repo.getFileTree());
        assertEquals(importedAt, repo.getImportedAt());
        assertEquals(importedBy, repo.getImportedBy());
    }
}