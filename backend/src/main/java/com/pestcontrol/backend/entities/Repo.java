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
}