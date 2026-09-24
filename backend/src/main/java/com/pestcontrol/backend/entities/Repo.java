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
@Table(name = "repo")
public class Repo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "\"RepoID\"")
    private UUID repoId;

    @Column(name = "\"SpaceID\"", nullable = false)
    private UUID spaceId;

    @Column(name = "\"GHOwner\"", nullable = false)
    private String ghOwner;

    @Column(name = "\"GHName\"", nullable = false)
    private String ghName;

    @Column(name = "\"DefaultBranch\"", nullable = false)
    private String defaultBranch = "main";

    @Column(name = "\"IsPrivate\"", nullable = false)
    private Boolean isPrivate = false;

    // Use a custom converter or mapping for JSONB if needed
    @Column(name = "\"FileTree\"", columnDefinition = "jsonb")
    private String fileTree;

    @Column(name = "\"ImportedAt\"", insertable = false, updatable = false)
    private LocalDateTime importedAt;

    @Column(name = "\"ImportedBy\"", nullable = false)
    private UUID importedBy;

    // Getters and Setters

    public UUID getRepoId() { return repoId; }
    public void setRepoId(UUID repoId) { this.repoId = repoId; }
    public UUID getSpaceId() { return spaceId; }
    public void setSpaceId(UUID spaceId) { this.spaceId = spaceId; }
    public String getGhOwner() { return ghOwner; }
    public void setGhOwner(String ghOwner) { this.ghOwner = ghOwner; }
    public String getGhName() { return ghName; }
    public void setGhName(String ghName) { this.ghName = ghName; }
    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    public String getFileTree() { return fileTree; }
    public void setFileTree(String fileTree) { this.fileTree = fileTree; }
    public LocalDateTime getImportedAt() { return importedAt; }
    public void setImportedAt(LocalDateTime importedAt) { this.importedAt = importedAt; }
    public UUID getImportedBy() { return importedBy; }
    public void setImportedBy(UUID importedBy) { this.importedBy = importedBy; }
}