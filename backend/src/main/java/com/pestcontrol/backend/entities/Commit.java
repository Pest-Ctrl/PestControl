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
@Table(name = "\"Commit\"")
public class Commit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "\"CommitID\"")
    private UUID commitId;

    @Column(name = "\"RepoID\"", nullable = false)
    private UUID repoId;

    @Column(name = "\"SHA\"", nullable = false)
    private String sha;

    @Column(name = "\"Message\"", nullable = false)
    private String message;

    @Column(name = "\"AuthorName\"", nullable = false)
    private String authorName;

    @Column(name = "\"AuthorEmail\"")
    private String authorEmail;

    @Column(name = "\"CommittedAt\"", nullable = false)
    private LocalDateTime committedAt;

    @Column(name = "\"URL\"")
    private String url;

    // Getters and Setters

    public UUID getCommitId() { return commitId; }
    public void setCommitId(UUID commitId) { this.commitId = commitId; }
    public UUID getRepoId() { return repoId; }
    public void setRepoId(UUID repoId) { this.repoId = repoId; }
    public String getSha() { return sha; }
    public void setSha(String sha) { this.sha = sha; }
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