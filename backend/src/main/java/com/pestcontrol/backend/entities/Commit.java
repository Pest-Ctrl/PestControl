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
}