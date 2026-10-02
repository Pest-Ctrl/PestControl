package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "commit")
public class Commit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "commitid")
    private UUID commitId;

    @Column(name = "repoid", nullable = false)
    private UUID repoId;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "authorname", nullable = false)
    private String authorName;

    @Column(name = "authoremail", nullable = false)
    private String authorEmail;

    @Column(name = "committedat", nullable = false)
    private LocalDateTime committedAt;

    @Column(name = "\"url\"", nullable = false)
    private String url;

    // Getters and Setters

    public UUID getCommitId() { return commitId; }
    public void setCommitId(UUID commitId) { this.commitId = commitId; }
    public UUID getRepoId() { return repoId; }
    public void setRepoId(UUID repoId) { this.repoId = repoId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
    public LocalDateTime getCommittedAt() { return committedAt; }
    public void setCommittedAt(LocalDateTime committedAt) { this.committedAt = committedAt; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}