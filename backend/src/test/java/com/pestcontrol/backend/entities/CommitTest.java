package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CommitTest
{
    @Test
    @DisplayName("Verify Commit getters and setters")
    void testCommitGettersAndSetters()
	{
        Commit commit = new Commit();
        UUID repoId = UUID.randomUUID();
        LocalDateTime committedAt = LocalDateTime.of(2026, 11, 11, 10, 30);

        commit.setCommitId("sha-abc12345");
        commit.setRepoId(repoId);
        commit.setMessage("feat: add authentication interceptor");
        commit.setAuthorName("octocat");
        commit.setAuthorEmail("octocat@github.com");
        commit.setCommittedAt(committedAt);
        commit.setUrl("https://github.com/octocat/Hello-World/commit/sha-abc12345");

        assertEquals("sha-abc12345", commit.getCommitId());
        assertEquals(repoId, commit.getRepoId());
        assertEquals("feat: add authentication interceptor", commit.getMessage());
        assertEquals("octocat", commit.getAuthorName());
        assertEquals("octocat@github.com", commit.getAuthorEmail());
        assertEquals(committedAt, commit.getCommittedAt());
        assertEquals("https://github.com/octocat/Hello-World/commit/sha-abc12345", commit.getUrl());
    }
}